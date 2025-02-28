// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  
  env: 'mini-program-7gugok6cdb014aba'
}) // 使用当前云环境
const CloudBase = require("@cloudbase/manager-node");
const {storage} = new CloudBase();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const directoryPath = event.directoryPath || ""; // 默认值为空字符串
  
  try {
    // 使用传入的参数
    const imagePic = await storage.listDirectoryFiles(directoryPath);
    console.log(imagePic);

    for (let item of imagePic) {
      console.log(item);
    }

    return {
      success: true,
      data: imagePic
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error.message
    };
  }
}