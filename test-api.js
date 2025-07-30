// 引入 dotenv 来加载 .env.local 文件中的环境变量
require('dotenv').config({ path: './.env.local' });
const { OpenAI } = require('openai');

// 从环境变量中获取 API Key
const apiKey = process.env.SILICONFLOW_API_KEY;

if (!apiKey) {
    console.error("错误：未找到 SILICONFLOW_API_KEY。请检查你的 .env.local 文件。");
    process.exit(1);
}

console.log("成功读取 API 密钥。");

// 配置 OpenAI 客户端，指向硅基流动的服务地址
const client = new OpenAI({
    apiKey: apiKey,
    baseURL: "https://api.siliconflow.cn/v1",
});

async function testConnection() {
    console.log("正在向硅基流动发送测试请求...");
    try {
        const response = await client.chat.completions.create({
            model: "THUDM/GLM-4.1V-9B-Thinking",
            messages: [{ role: "user", content: "你好" }],
            max_tokens: 5, // 只需要一个简短的回复来测试
        });
        console.log("连接成功！模型返回了测试信息：", response.choices[0].message);
        console.log("\n✅ 你的 API 密钥配置正确，可以正常工作！");
    } catch (error) {
        console.error("\n❌ 测试失败！请检查以下问题：");
        console.error("1. 你的 API 密钥是否正确？");
        console.error("2. 你的网络是否可以访问 https://api.siliconflow.cn/v1 ?");
        console.error("详细错误信息:", error.message);
    }
}

testConnection(); 