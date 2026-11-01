// ================= 配置 =================
// 在这里填入你的 Supabase 信息
const SUPABASE_URL = 'https://ygldbnljuygsdndfqecp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbGRibmxqdXlnc2RuZGZxZWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1Mjk2NzgsImV4cCI6MjEwOTEwNTY3OH0.58cWp5tm54rlg4y1-qQWvRnVHpgezYXQw-40kea9dIs';

// 创建 Supabase 客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================= 状态管理 =================
let appData = {
    stars: [],
    clouds: [],
    wishes: []
};

let currentUserId = localStorage.getItem('userId') || '';

// ================= 星空背景动画 =================
const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 创建星星背景
const bgStars = [];
for (let i = 0; i < 200; i++) {
    bgStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        alpha: Math.random(),
        alphaChange: 0.01 * Math.random()
    });
}

function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    bgStars.forEach(star => {
        star.alpha += star.alphaChange;
        if (star.alpha <= 0 || star.alpha >= 1) {
            star.alphaChange = -star.alphaChange;
        }
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
    });
    
    requestAnimationFrame(drawStars);
}

drawStars();

// ================= UI 交互 =================
function updateCounters() {
    document.getElementById('starCount').textContent = appData.stars.length;
    document.getElementById('cloudCount').textContent = appData.clouds.length;
    document.getElementById('wishCount').textContent = appData.wishes.length;
}

function renderStars() {
    const container = document.getElementById('starsContainer');
    container.innerHTML = '';
    
    appData.stars.forEach((star, index) => {
        const starEl = document.createElement('span');
        starEl.className = 'star';
        starEl.textContent = '⭐';
        starEl.title = star.author || '匿名';
        starEl.style.color = star.color || '#ffd700';
        starEl.addEventListener('click', () => removeStar(index));
        container.appendChild(starEl);
    });
}

function renderClouds() {
    const container = document.getElementById('cloudsContainer');
    container.innerHTML = '';
    
    appData.clouds.forEach((cloud, index) => {
        const cloudEl = document.createElement('span');
        cloudEl.className = 'cloud';
        cloudEl.textContent = '☁️';
        cloudEl.title = cloud.author || '匿名';
        cloudEl.addEventListener('click', () => removeCloud(index));
        container.appendChild(cloudEl);
    });
}

function renderWishes() {
    const container = document.getElementById('wishesContainer');
    container.innerHTML = '';
    
    appData.wishes.forEach((wish, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'wish-card';
        cardEl.innerHTML = `
            <div class="wish-author">${wish.author || '匿名'}</div>
            <div class="wish-text">${wish.text}</div>
        `;
        cardEl.addEventListener('click', () => removeWish(index));
        container.appendChild(cardEl);
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// ================= 操作函数 =================
function getUsername() {
    const input = document.getElementById('username');
    const username = input.value.trim() || '匿名用户';
    input.value = username;
    localStorage.setItem('username', username);
    return username;
}

function initUsername() {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
        document.getElementById('username').value = savedUsername;
    }
}

function addStar() {
    const username = getUsername();
    appData.stars.push({
        author: username,
        color: getRandomColor(),
        time: new Date().toISOString()
    });
    renderStars();
    updateCounters();
    showToast('✨ 添加了一颗星星');
}

function addCloud() {
    const username = getUsername();
    appData.clouds.push({
        author: username,
        time: new Date().toISOString()
    });
    renderClouds();
    updateCounters();
    showToast('☁️ 添加了一朵云');
}

function addWish() {
    const modal = document.getElementById('wishModal');
    modal.style.display = 'flex';
}

function confirmWish() {
    const text = document.getElementById('wishText').value.trim();
    if (text) {
        const username = getUsername();
        appData.wishes.push({
            author: username,
            text: text,
            time: new Date().toISOString()
        });
        renderWishes();
        updateCounters();
        document.getElementById('wishText').value = '';
        showToast('💖 祝福已添加');
    }
    closeWishModal();
}

function closeWishModal() {
    document.getElementById('wishModal').style.display = 'none';
}

function removeStar(index) {
    appData.stars.splice(index, 1);
    renderStars();
    updateCounters();
    showToast('✨ 星星已删除');
}

function removeCloud(index) {
    appData.clouds.splice(index, 1);
    renderClouds();
    updateCounters();
    showToast('☁️ 云朵已删除');
}

function removeWish(index) {
    appData.wishes.splice(index, 1);
    renderWishes();
    updateCounters();
    showToast('💔 祝福已删除');
}

function getRandomColor() {
    const colors = ['#ff6b9d', '#c44cff', '#6b9dff', '#ffd700', '#ff8c00'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ================= Supabase 云端同步 =================
async function syncToCloud() {
    try {
        const username = getUsername();
        
        // 保存到 Supabase
        const { error } = await supabase
            .from('app_data')
            .upsert({
                user_id: currentUserId,
                key: 'love_content',
                data: {
                    stars: appData.stars,
                    clouds: appData.clouds,
                    wishes: appData.wishes,
                    username: username,
                    time: new Date().toISOString()
                },
                updated_at: new Date()
            });
        
        if (error) throw error;
        
        showToast('💾 同步成功！');
    } catch (e) {
        console.error('同步失败:', e);
        showToast('❌ 同步失败，请检查 Supabase 配置');
    }
}

async function loadFromCloud() {
    try {
        // 确保有 userId
        if (!currentUserId) {
            currentUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', currentUserId);
        }
        
        // 从 Supabase 获取
        const { data, error } = await supabase
            .from('app_data')
            .select('data')
            .eq('user_id', currentUserId)
            .eq('key', 'love_content')
            .single();
        
        if (error) throw error;
        
        if (data && data.data) {
            appData = data.data;
            
            // 恢复用户名
            if (appData.username) {
                document.getElementById('username').value = appData.username;
                localStorage.setItem('username', appData.username);
            }
            
            renderStars();
            renderClouds();
            renderWishes();
            updateCounters();
            
            showToast('📥 云端数据已加载');
        } else {
            showToast('📭 暂无云端数据');
        }
    } catch (e) {
        console.error('加载失败:', e);
        showToast('❌ 加载失败，请检查 Supabase 配置');
    }
}

// ================= 事件绑定 =================
document.getElementById('addStar').addEventListener('click', addStar);
document.getElementById('addCloud').addEventListener('click', addCloud);
document.getElementById('addWish').addEventListener('click', addWish);
document.getElementById('syncBtn').addEventListener('click', syncToCloud);
document.getElementById('loadBtn').addEventListener('click', loadFromCloud);

document.getElementById('confirmWish').addEventListener('click', confirmWish);
document.getElementById('cancelWish').addEventListener('click', closeWishModal);

// 点击模态框外部关闭
document.getElementById('wishModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('wishModal')) {
        closeWishModal();
    }
});

// ================= 初始化 =================
function init() {
    initUsername();
    updateCounters();
    
    // 欢迎消息
    const welcomeMsg = document.getElementById('welcomeMsg');
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
        welcomeMsg.textContent = `欢迎回来，${savedUsername}！`;
    }
    
    console.log('✨ 爱心宇宙已启动');
    console.log('📝 请记得在 script.js 中配置你的 Supabase URL 和 Key');
}

init();
