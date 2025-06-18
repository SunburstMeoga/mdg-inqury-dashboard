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
