const express = require('express');
const router = express.Router();

// 模拟统计数据
const statsData = new Map();

// 仪表盘数据
router.get('/dashboard', (req, res) => {
  const tenantId = req.tenantId;
  
  // 模拟数据
  const data = {
    today: {
      conversations: Math.floor(Math.random() * 100) + 50,
      aiAnswered: Math.floor(Math.random() * 80) + 40,
      humanAnswered: Math.floor(Math.random() * 20) + 5,
      avgRating: (4 + Math.random()).toFixed(1),
      transferRate: (Math.random() * 10).toFixed(1)
    },
    week: generateWeekData(),
    hotQuestions: [
      { keyword: '如何退货', count: 156 },
      { keyword: '物流查询', count: 132 },
      { keyword: '产品质量', count: 98 },
      { keyword: '优惠活动', count: 87 },
      { keyword: '账户设置', count: 65 }
    ],
    channelDist: [
      { name: '微信', value: 45 },
      { name: '飞书', value: 30 },
      { name: 'Web', value: 25 }
    ]
  };
  
  res.json({ code: 0, data });
});

// 趋势数据
router.get('/trend', (req, res) => {
  const { startDate, endDate, type = 'conversations' } = req.query;
  
  const data = generateTrendData(30);
  
  res.json({ code: 0, data });
});

// 辅助函数
function generateWeekData() {
  const data = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      conversations: Math.floor(Math.random() * 80) + 40,
      aiAnswered: Math.floor(Math.random() * 60) + 30,
      humanAnswered: Math.floor(Math.random() * 15) + 5
    });
  }
  return data;
}

function generateTrendData(days) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100) + 20
    });
  }
  return data;
}

module.exports = router;
