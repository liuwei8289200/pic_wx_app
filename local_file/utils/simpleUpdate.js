/**
 * 简单批量更新工具
 * 按顺序设置8位字符串编号，从00000001开始
 */

const { init } = require("@cloudbase/wx-cloud-client-sdk");
const client = init(wx.cloud);
const models = client.models;

/**
 * 按顺序更新字段为8位字符串编号
 * @param {string} fieldName 字段名
 */
const updateWithSequentialNumber = async (fieldName) => {
  console.log(`开始为 ${fieldName} 字段设置顺序编号...`);
  
  try {
    // 1. 获取所有没有该字段值的记录（按创建时间排序）
    let allRecords = [];
    let pageNumber = 1;
    const pageSize = 100;
    
    while (true) {
      const { data } = await models.media_image.list({
        filter: {
          where: {
            $or: [
              { [fieldName]: { $exists: false } }, // 字段不存在
              { [fieldName]: null }, // 字段为null
              { [fieldName]: "" }, // 字段为空
            ]
          }
        },
        select: { _id: true, createdAt: true },
        pageSize: pageSize,
        pageNumber: pageNumber
      });
      
      if (data.records.length === 0) break;
      
      allRecords.push(...data.records);
      pageNumber++;
      
      console.log(`已查询 ${allRecords.length} 条需要更新的记录...`);
    }
    
    console.log(`总共找到 ${allRecords.length} 条记录需要更新`);
    
    if (allRecords.length === 0) {
      console.log('没有需要更新的记录');
      return { success: true, updated: 0 };
    }
    
    // 2. 按创建时间排序
    allRecords.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // 3. 批量更新，设置为8位字符串编号
    let updated = 0;
    const batchSize = 50; // 每批50条
    
    for (let i = 0; i < allRecords.length; i += batchSize) {
      const batch = allRecords.slice(i, i + batchSize);
      
      console.log(`正在更新第 ${Math.floor(i / batchSize) + 1} 批，共 ${batch.length} 条记录...`);
      
      // 并发更新当前批次
      const updatePromises = batch.map((record, batchIndex) => {
        const sequenceNumber = i + batchIndex + 1; // 从1开始
        const paddedNumber = sequenceNumber.toString().padStart(8, '0'); // 补0到8位
        
        return models.media_image.update({
          data: { [fieldName]: paddedNumber },
          filter: { where: { _id: { $eq: record._id } } }
        });
      });
      
      await Promise.all(updatePromises);
      updated += batch.length;
      
      console.log(`已更新 ${updated}/${allRecords.length} 条记录`);
      console.log(`当前批次编号范围: ${(i + 1).toString().padStart(8, '0')} - ${(i + batch.length).toString().padStart(8, '0')}`);
      
      // 小延迟，避免请求过频
      if (i + batchSize < allRecords.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`✅ 更新完成！总共更新了 ${updated} 条记录`);
    console.log(`编号范围: 00000001 - ${updated.toString().padStart(8, '0')}`);
    return { success: true, updated };
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
    throw error;
  }
};

export default updateWithSequentialNumber; 