// 云函数入口文件
const cloud = require('wx-server-sdk')
console.log("test11111111");
cloud.init() // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const { path, skip, limit } = event;
  const result = await cloud.getTempFileURL({
    fileList: (await cloud.getFileList({
      path,
      skip,
      limit
    })).fileList.map(file => file.fileID)
  });
  return result;
};