// Mock数据

// 生成随机日期
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// 生成随机手机号
const getRandomPhone = () => {
  const prefixes = ['138', '139', '150', '151', '152', '158', '159', '188', '189'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + suffix;
};

// 生成随机身份证号
const getRandomIdCard = () => {
  const areas = ['110101', '310101', '440101', '440301', '330101', '510101', '420101', '610101'];
  const area = areas[Math.floor(Math.random() * areas.length)];
  const year = Math.floor(Math.random() * 30) + 1970;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const checkCode = Math.floor(Math.random() * 10);
  
  return `${area}${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}${suffix}${checkCode}`;
};

// 生成Mock预问诊报告数据
export const generateMockReports = (count = 50) => {
  const reports = [];
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二', '冯十三', '陈十四', '褚十五', '卫十六', '蒋十七', '沈十八', '韩十九', '杨二十'];
  
  for (let i = 0; i < count; i++) {
    const consultationDate = getRandomDate(new Date(2024, 0, 1), new Date());
    const reportDate = new Date(consultationDate.getTime() + Math.random() * 24 * 60 * 60 * 1000); // 报告生成时间在问诊后24小时内
    
    reports.push({
      id: `RPT${(i + 1).toString().padStart(6, '0')}`,
      patientName: names[Math.floor(Math.random() * names.length)],
      patientId: `P${(i + 1).toString().padStart(8, '0')}`,
      phone: getRandomPhone(),
      idCard: getRandomIdCard(),
      consultationTime: consultationDate.toISOString(),
      reportGenerateTime: reportDate.toISOString(),
      reportThumbnail: `https://picsum.photos/200/300?random=${i}`, // 使用随机图片作为缩略图
      reportUrl: `https://example.com/reports/${i + 1}.pdf`, // Mock报告下载链接
      status: Math.random() > 0.1 ? 'completed' : 'pending', // 90%完成，10%待处理
      symptoms: ['视力模糊', '眼部疲劳', '干眼症', '近视加深'][Math.floor(Math.random() * 4)],
      hospitalArea: ['北京总院', '上海分院', '广州分院', '深圳分院'][Math.floor(Math.random() * 4)]
    });
  }
  
  return reports.sort((a, b) => new Date(b.reportGenerateTime) - new Date(a.reportGenerateTime));
};

// 预问诊报告Mock数据
export const mockReports = generateMockReports();

// 根据手机号或身份证号搜索报告
export const searchReports = (searchTerm) => {
  if (!searchTerm) return mockReports;
  
  return mockReports.filter(report => 
    report.phone.includes(searchTerm) || 
    report.idCard.includes(searchTerm) ||
    report.patientName.includes(searchTerm)
  );
};

// 根据ID获取报告详情
export const getReportById = (id) => {
  return mockReports.find(report => report.id === id);
};

// 生成随机年龄
const getRandomAge = () => {
  return Math.floor(Math.random() * 60) + 18; // 18-78岁
};

// 生成随机性别
const getRandomGender = () => {
  return Math.random() > 0.5 ? '男' : '女';
};

// 生成随机就诊号
const getRandomVisitNumber = (prefix) => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${date}${random}`;
};

// 生成随机医院名称
const getRandomHospital = () => {
  const hospitals = [
    '北京同仁医院',
    '上海第一人民医院',
    '广州中山大学附属第一医院',
    '深圳市人民医院',
    '杭州浙江大学医学院附属第一医院',
    '成都华西医院',
    '武汉协和医院',
    '西安交通大学第一附属医院',
    '南京鼓楼医院',
    '天津医科大学总医院'
  ];
  return hospitals[Math.floor(Math.random() * hospitals.length)];
};

// 生成术前分析Mock数据
export const generateMockPreSurgeryData = (count = 30) => {
  const data = [];
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二', '冯十三', '陈十四', '褚十五', '卫十六', '蒋十七', '沈十八', '韩十九', '杨二十'];
  const statuses = ['pending', 'generating', 'completed', 'confirmed'];

  for (let i = 0; i < count; i++) {
    const createDate = getRandomDate(new Date(2024, 0, 1), new Date());

    data.push({
      id: `PS${(i + 1).toString().padStart(6, '0')}`,
      visitNumber: getRandomVisitNumber('PS'),
      patientName: names[Math.floor(Math.random() * names.length)],
      age: getRandomAge(),
      gender: getRandomGender(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createTime: createDate.toISOString(),
      updateTime: new Date(createDate.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      surgeryType: ['近视手术', '白内障手术', '青光眼手术', '视网膜手术'][Math.floor(Math.random() * 4)],
      doctorName: ['张医生', '李医生', '王医生', '赵医生'][Math.floor(Math.random() * 4)]
    });
  }

  return data.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
};

// 生成塑形镜分析Mock数据
export const generateMockOrthoKData = (count = 25) => {
  const data = [];
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二', '冯十三', '陈十四', '褚十五', '卫十六', '蒋十七', '沈十八', '韩十九', '杨二十'];
  const statuses = ['pending', 'generating', 'completed', 'confirmed'];

  for (let i = 0; i < count; i++) {
    const createDate = getRandomDate(new Date(2024, 0, 1), new Date());

    data.push({
      id: `OK${(i + 1).toString().padStart(6, '0')}`,
      visitNumber: getRandomVisitNumber('OK'),
      patientName: names[Math.floor(Math.random() * names.length)],
      age: getRandomAge(),
      gender: getRandomGender(),
      hospital: getRandomHospital(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createTime: createDate.toISOString(),
      updateTime: new Date(createDate.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      lensType: ['夜戴型', '日戴型', '特殊定制型'][Math.floor(Math.random() * 3)],
      doctorName: ['张医生', '李医生', '王医生', '赵医生'][Math.floor(Math.random() * 4)]
    });
  }

  return data.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
};

// 术前分析Mock数据
export const mockPreSurgeryData = generateMockPreSurgeryData();

// 塑形镜分析Mock数据
export const mockOrthoKData = generateMockOrthoKData();

// 根据就诊号搜索术前分析数据
export const searchPreSurgeryData = (searchTerm) => {
  if (!searchTerm) return mockPreSurgeryData;

  return mockPreSurgeryData.filter(item =>
    item.visitNumber.includes(searchTerm) ||
    item.patientName.includes(searchTerm)
  );
};

// 根据就诊号搜索塑形镜分析数据
export const searchOrthoKData = (searchTerm) => {
  if (!searchTerm) return mockOrthoKData;

  return mockOrthoKData.filter(item =>
    item.visitNumber.includes(searchTerm) ||
    item.patientName.includes(searchTerm)
  );
};

// 更新术前分析数据状态
export const updatePreSurgeryStatus = (id, newStatus) => {
  const item = mockPreSurgeryData.find(item => item.id === id);
  if (item) {
    item.status = newStatus;
    item.updateTime = new Date().toISOString();
  }
  return item;
};

// 更新塑形镜分析数据状态
export const updateOrthoKStatus = (id, newStatus) => {
  const item = mockOrthoKData.find(item => item.id === id);
  if (item) {
    item.status = newStatus;
    item.updateTime = new Date().toISOString();
  }
  return item;
};

// 根据ID获取术前分析数据
export const getPreSurgeryById = (id) => {
  return mockPreSurgeryData.find(item => item.id === id);
};

// 根据ID获取塑形镜分析数据
export const getOrthoKById = (id) => {
  return mockOrthoKData.find(item => item.id === id);
};
