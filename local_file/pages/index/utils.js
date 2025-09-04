export const lightBlue = {
  0: '#E1F5FE',
  100: '#B3E5FC',
  200: '#81D4FA',
  300: '#4FC3F7',
  400: '#29B6F6',
  500: '#03A9F4',
  600: '#039BE5',
  700: '#0288D1',
  800: '#0277BD',
  900: '#01579B',
}

export const generateList = (childCount) => {
  const ans = []
  for (let i = 0; i < childCount; i++) {
    ans.push({
      id: i,
      color: lightBlue[`${100 * (i % 9)}`],
    })
  }
  return ans
}

const contents = [
  '小程序推出 Skyline 新渲染框架啦',
  '推荐 Skyline，使用后体验流畅很多~',
  '开发必备！共享元素、自定义路由、手势系统',
  'Hayya Hayya！我用小程序啦',
]

const nicknames = [
  'REX',
  'BINNIE',
  'ERIC',
  'SANFORD',
]
const imageRatios = {
  "1:1": {  // 1:1
    width: 1,
    height: 1,
    imageRatio: 1 / 1,
  },
  "3:4": {
    width: 3,
    height: 4,
    imageRatio: 3 / 4,
  },
  "4:3": {
    width: 4,
    height: 3,
    imageRatio: 4 / 3,
  },
}
const imageRatio = [
  // {
  //   width: 3,
  //   height: 4,
  //   imageRatio: 3 / 4,
  // },
  // {
  //   width: 4,
  //   height: 3,
  //   imageRatio: 4 / 3,
  // },
  {
    width: 1,
    height: 1,
    imageRatio: 1 / 1,
  },
]

const imageList = [
  // 3:4
  [
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr_TJOaxvM0jTWnZCPVx5tYhqZIIAWcwZ-wjkthDNgUPon6gB8cS1-4Gmj9Fa0emByQ',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr5TiaeMo-e_G_0VkoAgrUpJDa0vkq7A-ZqnGdXPqENXxwOpNm6WNaukJzkaNpe2l4g',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr3Vg3QwFEkRrtGVFfuis3HPsfPRAimoR3xrmxA6WqSP6gqLYxpQR70H0Mjd82xRvLg',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr57xPb6otBpyKgqlzjXvSaLKB_SPr5oYFTYCYUbk6bCwyLvvPWUVpsNuYRjVNouuDw',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr8oVdhjDzwpGQWkUNT3VLWmNYEetJXErnWq48jD0zVELo45qmUAdu7jCgFskY6Eh8w',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr1x4v1gTqT3MrC7LtVTjQXb_9hd9vbCf12guLPXiMXd0G7IUnLQXkOa-o1eNyAJ_nA',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr7lTnuuiwGJPwwjxDVYbDolj05sAxd5cOESVZt4_nl1KwzkiDWTvG56LuhE45xAaZA'
  ],
  // 4:3
  [
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr87sFqvqtkPc7qeZdary_8crGWuX_SOb72lupHA7sWx0dti3JrJXdP_lwm0ZtvINXg',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr3vA4i7lSkWNR0BRe_g4A-_lo5MYYlkks8oHLoZzXjqAm_M3RvDAXtn9UUgZuQtVBA',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr5Ifsj1_cRjONPrw-gUgq8g6BNH8sYQ3kBBQas5JAeMN0zsCBY9gmz3D7kj_GOWfHw',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr1IwceePWSJ_EhG4QedvnFKN6v_mNlNuwG2FkAIoOhx_1fyCDEqtHWSktSrPmLvTpw',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihrzz951X66QJWV_Oj4MT6XImEk-wFlNZP6mJE1Vt-ybtD1UK7ARlhOBl9bizrC5KA9g',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihrxFO1zooQxE0ufna7fMaqrU-Pp4Dm2rw5dFcTdBymLTijegIFw3WcVD1rUyLD4XTig',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr6WcfJCajSnCm4CNu5oQ5HPsPqyzWD-vtFVuJDZOhMpcG1iN0tvOsvS8DUgn3qO8UA',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr4HKYTq7-4l-F47z8u2QbvNsjcTEA3Cu5-4wQpBGPeWKCh66Ho5W42fn3naWuN2NJg',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr8PdfZEyicDsJiFPBw8MAjve2UKbzLds_-IZW_Q0EYUbboQk-31FeTkFmzuNzCfLHg'
  ],
  // 1:1
  [
    'https://res.wx.qq.com/op_res/KSWft_GRyQ3WEzVUTCSWs7HaJh0lgdPce6Uon3dhNpZ3R3sTVA3NLrOORpMDGaBl5P8QkzHZCaOErPlma2sAow',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihrwcWdDUeblb42H9kVfv14Eru-W62xBL1bUXbfwZbaJG7_JrKvnAKvdVCQJkS3PX3IQ',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr13IooGqagGNd7x5NTGbtrz4g0NrIVLLJ2KSx-BcYpaGMTpnv-pUB_iexsCzQC4wZg',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihrxD9Yj0ZHr0C5YMm7qYRo2fqji9kH4CS6LUyQf4YXzHzK3BW0FFNZiTQb6AK9bp1WA',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr5yBy6GoASjPro9uFIUZVFdiDIjiJObbopuhr7PUXnsTLQ537ujpIBxyX2Ln2gRu0w',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihrzhx4m_v7j5nYGhkUG5h-dulp3X7FxpQVY8L1QzVqPROJHUcK0mO38isUiclpbae_Q',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr_VrnIzjbAVDL2cmG0wjYsNZv1l_lacmGCshp9OEz3QcPnn9YymbITplyQS5T5C-VA',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr0m2rsO-Y1l6Wsz_sFyu7vJj_ZTfI7GABbstLg4GUDTZVeZCKgDADCmsDjmF8rG7dw'
  ]
]
const { init } = require("@cloudbase/wx-cloud-client-sdk");
const client = init(wx.cloud)
const models = client.models

// 获取图片总数的函数
export const getTotalImagesCount = async () => {
  console.log("获取图片总数")
  
  const { data } = await models.media_image.list({
    filter: {
      where: {}
    },
    pageSize: 1, // 只需要获取总数，所以页面大小设为最小
    pageNumber: 1,
    getCount: true, // 开启用来获取总数
  });
  
  console.log("图片总数:", data.total);
  return data.total;
}

// 根据图片总数和pageSize生成随机页码
export const getRandomPageNumber = (totalCount, pageSize) => {
  if (!totalCount || !pageSize || totalCount <= 0 || pageSize <= 0) {
    return 1;
  }
  
  // 计算最大页码
  const maxPageNumber = Math.ceil(totalCount / pageSize);
  // 生成1到maxPageNumber之间的随机整数
  const randomPageNumber = Math.floor(Math.random() * maxPageNumber) + 1;
  
  console.log("总页数:", maxPageNumber);
  console.log("随机页码:", randomPageNumber);
  
  return randomPageNumber;
}

// 记录已使用过的页码
const usedPageNumbers = new Set();

// 获取未使用过的下一个页码（保留原有功能）
export const getNextUnusedPageNumber = (totalCount, pageSize, currentPageNumber) => {
  if (!totalCount || !pageSize || totalCount <= 0 || pageSize <= 0) {
    return 1;
  }
  
  // 记录当前页码为已使用
  usedPageNumbers.add(currentPageNumber);
  
  // 计算最大页码
  const maxPageNumber = Math.ceil(totalCount / pageSize);
  
  // 如果所有页码都已使用，则重置已使用页码集合
  if (usedPageNumbers.size >= maxPageNumber) {
    usedPageNumbers.clear();
    usedPageNumbers.add(currentPageNumber);
  }
  
  // 查找未使用过的页码
  let nextPageNumber = currentPageNumber + 1;
  if (nextPageNumber > maxPageNumber) {
    nextPageNumber = 1; // 如果超过最大页码，则回到第一页
  }
  
  // 如果下一个页码已经使用过，则继续查找
  while (usedPageNumbers.has(nextPageNumber)) {
    nextPageNumber++;
    if (nextPageNumber > maxPageNumber) {
      nextPageNumber = 1;
    }
  }
  
  // 标记为已使用
  usedPageNumbers.add(nextPageNumber);
  
  console.log("下一个未使用页码:", nextPageNumber);
  return nextPageNumber;
}

// 新增：已浏览图片的记录
const viewedImageIds = new Set();

// 新增：持久化存储的key
const VIEWED_IMAGES_STORAGE_KEY = 'viewedImageIds';

// 新增：从本地存储加载已浏览记录
const loadViewedImagesFromStorage = () => {
  try {
    const stored = wx.getStorageSync(VIEWED_IMAGES_STORAGE_KEY);
    if (stored && Array.isArray(stored)) {
      stored.forEach(id => viewedImageIds.add(id));
      console.log("从本地存储加载已浏览记录, 数量:", viewedImageIds.size);
    }
  } catch (error) {
    console.error("加载已浏览记录失败:", error);
  }
};

// 新增：保存已浏览记录到本地存储
const saveViewedImagesToStorage = () => {
  try {
    const viewedArray = Array.from(viewedImageIds);
    wx.setStorageSync(VIEWED_IMAGES_STORAGE_KEY, viewedArray);
    console.log("保存已浏览记录到本地存储, 数量:", viewedArray.length);
  } catch (error) {
    console.error("保存已浏览记录失败:", error);
  }
};

// 新增：预缓存图片数据
let prefetchedImages = [];

// 新增：全量图片数据
let allImagesData = [];

// 新增：数据加载状态
let isAllDataLoaded = false;

// 新增：初始化时加载已浏览记录
(() => {
  loadViewedImagesFromStorage();
})();

// 新增：获取预缓存图片数据（前1000张）
export const getPrefetchImages = async (count = 100) => {
  console.log("开始获取预缓存图片数据, count:", count);
  
  try {
    const { data } = await models.media_image.list({
      filter: {
        where: {}
      },
      select: {
        connect_image_liked_users: {
          _id: true,
        },
        $master: true
      },
      pageSize: count,
      pageNumber: 1,
      getCount: true,
    });
    
    console.log("预缓存数据获取成功, 数量:", data.records.length);
    return formatImageData(data.records);
  } catch (error) {
    console.error("获取预缓存数据失败:", error);
    return [];
  }
};

// 新增：获取所有图片数据（后台异步加载）
export const getAllImagesData = async () => {
  console.log("开始获取所有图片数据");
  
  try {
    // 首先获取总数
    const totalCount = await getTotalImagesCount();
    console.log("图片总数:", totalCount);
    
    const allImages = [];
    const pageSize = 100; // 每次获取100张
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // 分批获取所有数据
    for (let page = 1; page <= totalPages; page++) {
      console.log(`正在获取第 ${page}/${totalPages} 页`);
      
      const { data } = await models.media_image.list({
        filter: {
          where: {}
        },
        select: {
          connect_image_liked_users: {
            _id: true,
          },
          $master: true
        },
        pageSize: pageSize,
        pageNumber: page,
        getCount: false,
      });
      
      allImages.push(...data.records);
    }
    
    console.log("所有图片数据获取完成, 总数:", allImages.length);
    return formatImageData(allImages);
  } catch (error) {
    console.error("获取所有图片数据失败:", error);
    return [];
  }
};

// 新增：格式化图片数据的通用函数
const formatImageData = (records) => {
  const ans = [];
  
  records.forEach(item => {
    let ratio = item.ratio;
    if (ratio == "" || ratio == null || ratio == undefined) {
      ratio = imageRatios["1:1"];
    } else {
      ratio = imageRatios[ratio];
    }
    
    // src 根据指定格式拼接
    const url = `https://6d69-mini-program-7gugok6cdb014aba-1258427370.tcb.qcloud.la/grid_images_online/${item.file_id}`;
    
    // 根据: 分割
    const short_title = item.title.split('：')[0];
    
    ans.push({
      id: ans.length,
      docid: item._id,
      ...ratio,
      src: url,
      like_users: item.connect_image_liked_users,
      content: item.description,
      title: item.title,
      short_title: short_title,
      foot_is_show: true,
      // 新增字段，用于随机排序
      randomOrder: Math.random()
    });
  });
  
  return ans;
};

// 新增：Fisher-Yates 洗牌算法，真正的随机打乱
export const shuffleArray = (array) => {
  const shuffled = [...array]; // 创建副本，避免修改原数组
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 新增：记录已浏览的图片
export const markImageAsViewed = (imageId) => {
  viewedImageIds.add(imageId);
  console.log("标记图片为已浏览:", imageId, "已浏览总数:", viewedImageIds.size);
  
  // 每10次浏览保存一次到本地存储，避免频繁写入
  if (viewedImageIds.size % 10 === 0) {
    saveViewedImagesToStorage();
  }
};

// 新增：获取随机图片列表（去除已浏览的）
export const getRandomUnviewedImages = (count = 20) => {
  console.log("获取随机未浏览图片, 请求数量:", count);
  console.log("当前数据状态 - 预缓存:", prefetchedImages.length, "全量数据:", allImagesData.length, "全量数据已加载:", isAllDataLoaded);
  
  // 选择数据源：优先使用全量数据，如果未加载完成则使用预缓存数据
  const dataSource = isAllDataLoaded && allImagesData.length > 0 ? allImagesData : prefetchedImages;
  
  if (dataSource.length === 0) {
    console.warn("没有可用的图片数据");
    return [];
  }
  
  // 过滤掉已浏览的图片
  const unviewedImages = dataSource.filter(image => !viewedImageIds.has(image.docid));
  
  console.log("未浏览图片数量:", unviewedImages.length, "已浏览数量:", viewedImageIds.size);
  
  if (unviewedImages.length === 0) {
    console.log("所有图片都已浏览，重置浏览记录");
    viewedImageIds.clear();
    return getRandomUnviewedImages(count); // 递归调用
  }
  
  // 随机打乱未浏览的图片
  const shuffledImages = shuffleArray(unviewedImages);
  
  // 取前count张图片
  const selectedImages = shuffledImages.slice(0, Math.min(count, shuffledImages.length));
  
  // 标记这些图片为已浏览
  selectedImages.forEach(image => {
    markImageAsViewed(image.docid);
  });
  
  console.log("返回随机图片数量:", selectedImages.length);
  return selectedImages;
};

// 新增：初始化图片数据（预缓存 + 后台加载全量数据）
export const initializeImageData = async () => {
  console.log("开始初始化图片数据");
  
  try {
    // 1. 立即获取预缓存数据
    console.log("步骤1: 获取预缓存数据");
    prefetchedImages = await getPrefetchImages(1000);
    console.log("预缓存数据加载完成, 数量:", prefetchedImages.length);
    
    // 2. 后台异步加载全量数据
    console.log("步骤2: 开始后台加载全量数据");
    setTimeout(async () => {
      try {
        allImagesData = await getAllImagesData();
        
        // 3. 计算差集：从全量数据中移除已浏览的预缓存图片
        console.log("步骤3: 计算差集");
        const viewedFromPrefetch = Array.from(viewedImageIds);
        allImagesData = allImagesData.filter(image => !viewedFromPrefetch.includes(image.docid));
        
        // 随机打乱全量数据
        allImagesData = shuffleArray(allImagesData);
        
        isAllDataLoaded = true;
        console.log("全量数据加载完成并计算差集, 剩余数量:", allImagesData.length);
        
        // 触发事件通知组件数据已更新
        // wx.nextTick(() => {
        //   wx.showToast({
        //     title: '更多图片已加载',
        //     icon: 'none',
        //     duration: 1000
        //   });
        // });
        
      } catch (error) {
        console.error("后台加载全量数据失败:", error);
      }
    }, 100); // 延迟100ms开始后台加载，避免阻塞UI
    
    return prefetchedImages;
  } catch (error) {
    console.error("初始化图片数据失败:", error);
    return [];
  }
};

// 新增：重置所有数据（用于刷新）
export const resetImageData = () => {
  console.log("重置图片数据");
  viewedImageIds.clear();
  prefetchedImages = [];
  allImagesData = [];
  isAllDataLoaded = false;
  
  // 同时清除本地存储
  try {
    wx.removeStorageSync(VIEWED_IMAGES_STORAGE_KEY);
    console.log("已清除本地存储的浏览记录");
  } catch (error) {
    console.error("清除本地存储失败:", error);
  }
};

// 新增：手动保存浏览记录（用于应用退出前）
export const saveViewedImages = () => {
  saveViewedImagesToStorage();
};

// 新增：获取已浏览图片数量
export const getViewedImagesCount = () => {
  return viewedImageIds.size;
};

// 新增：获取数据状态信息
export const getImageDataStatus = () => {
  return {
    prefetchedCount: prefetchedImages.length,
    allDataCount: allImagesData.length,
    viewedCount: viewedImageIds.size,
    isAllDataLoaded: isAllDataLoaded,
    remainingCount: isAllDataLoaded ? 
      allImagesData.filter(img => !viewedImageIds.has(img.docid)).length :
      prefetchedImages.filter(img => !viewedImageIds.has(img.docid)).length
  };
};

export const getModelsGridImages = async (pageNumber, pageSize, randomSeed) => {
  // 固定调试使用
  // pageNumber = 1
  // pageSize = 20
  console.log("enter in getModelsGridImages")
  console.log("PageNumber is ", pageNumber)
  console.log("PageSize is ", pageSize)
  console.log("RandomSeed is ", randomSeed)
  
  const { data } = await models.media_image.list({
    filter: {
      where: {}
    },
    select: {
      connect_image_liked_users:{
        _id:true,
      },
      $master:true
    },
    pageSize: pageSize, // 分页大小，建议指定，如需设置为其它值，需要和 pageNumber 配合使用，两者同时指定才会生效
    pageNumber: pageNumber, // 第几页
    getCount: true, // 开启用来获取总数
  });
  // const sql = `SELECT * FROM media_image ORDER BY RAND(${randomSeed}) LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize}`
  // console.log("sql is ", sql)
  // // 使用randomSeed作为随机排序的种子
  // const { test } = await wx.cloud.callFunction({
  //   name: 'runRawSQL',
  //   data: {
  //     action: 'runRawSQL',
  //     data: {
  //       sql: sql
  //     }
  //   }
  // });
  
  console.log("getModelsGridImages", data);
  const ans = [];
  data.records.forEach(item => {
    //console.log("item", item);
    //const ratioIdx = Math.floor(Math.random() * imageRatio.length)
    // const ratio = imageRatio[ratioIdx]
    let ratio = item.ratio
    if (ratio == "" || ratio == null || ratio == undefined) {
      ratio = imageRatios["1:1"]
    } else {
      ratio = imageRatios[ratio]
    }
    // src 根据指定格式拼接
    const url = `https://6d69-mini-program-7gugok6cdb014aba-1258427370.tcb.qcloud.la/grid_images_online/${item.file_id}`;
    
    //根据: 分割
    const short_title = item.title.split('：')[0];
    ans.push({
      // id 是自增序号
      id: ans.length,
      docid: item._id,
      ...ratio,
      src: url,
      like_users: item.connect_image_liked_users,
      content: item.description,
      title: item.title,
      short_title: short_title,
      foot_is_show:true,
    });
    console.log("ans", ans);
  });
  
  return ans; // 数据获取完成后，返回 ans
}
export const generateGridList = (childCount, columns) => {
  const ans = []
  for (let i = 0; i < childCount; i++) {
    const ratioIdx = Math.floor(Math.random() * imageRatio.length)
    const ratio = imageRatio[ratioIdx]
    const img = imageList[ratioIdx][Math.floor(Math.random() * imageList[ratioIdx].length)]
    ans.push({
      id: i,
      src: img,
      ...ratio,
      like: Math.floor(Math.random() * 10000),
      content: contents[Math.floor(Math.random() * contents.length)],
      nickname: nicknames[Math.floor(Math.random() * nicknames.length)],
    })
  }
  return ans
}

export const generateGridListNew = (childCount, columns) => {
  return new Promise((resolve, reject) => { // 使用 Promise
    const ans = [];
    
    wx.cloud.database().collection('grid_images_list').get({
      success: function(res) {
        console.log("res", res);
        console.log("res.data", res.data);
        
        // 循环 res.data，将 data 中的 url 值存入 ans 中
        res.data.forEach(item => {
          //console.log("item", item);
          //const ratioIdx = Math.floor(Math.random() * imageRatio.length)
          let ratio = item.ratio
          if (ratio == "" || ratio == null || ratio == undefined) {
            ratio = imageRatios["1:1"]
          } else {
            ratio = imageRatios[ratio]
          }
          //const ratio = imageRatio[ratioIdx]
          // src 根据指定格式拼接
          const url = `https://6d69-mini-program-7gugok6cdb014aba-1258427370.tcb.qcloud.la/grid_images/${item.file_id}`;
          
          //根据: 分割
          const short_title = item.title.split('：')[0];
          ans.push({
            // id 是自增序号
            id: ans.length,
            docid: item._id,
            ...ratio,
            src: url,
            like: item.like_num,
            content: item.desc,
            title: item.title,
            short_title: short_title,
          });
          console.log("ans", ans);
        });
        
        resolve(ans); // 数据获取完成后，返回 ans
      },
      fail: err => {
        console.error('获取数据失败:', err);
        reject(err); // 处理失败情况
      }
    });
  });
};
export const getPicListByDocidList = (docidList) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'dbCommand',
      data: {
        action: 'getPicListByDocidList',
        data: {
          docidList: docidList
        }
      },
      success: res => {
        console.log("res", res);
        resolve(res.result);
      },
      fail: err => {
        console.error('获取数据失败:', err);
        reject(err);
      }
    });
  });
};

export const clamp = function (cur, lowerBound, upperBound) {
  'worklet';
  if (cur > upperBound) return upperBound;
  if (cur < lowerBound) return lowerBound;
  return cur;
};

export const compareVersion = function (v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i], 10)
    const num2 = parseInt(v2[i], 10)

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}