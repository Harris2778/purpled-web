import React, { useState, useRef, useEffect } from 'react';
import { Heart, X, MessageCircle, User, Sparkles, MapPin, BookOpen, Search, Settings, Mail, ArrowRight, LogOut, Map as MapIcon, Navigation, Camera, Edit2, ChevronLeft, Check, ClipboardEdit, Lock, Unlock, Percent, AlertCircle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, query } from 'firebase/firestore';

// ----------------------------------------------------
// 1. 这里就是你从 Firebase 拿到的“钥匙”
// ----------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDjjA2cwO2k5F2eM2zORVB56MM_p9dNBUQ",
  authDomain: "purpled-app.firebaseapp.com",
  projectId: "purpled-app",
  storageBucket: "purpled-app.firebasestorage.app",
  messagingSenderId: "862312576505",
  appId: "1:862312576505:web:7bfe4c29e5496354def928",
  measurementId: "G-H71DB2P8HS"
};

// ----------------------------------------------------
// 2. 使用你的配置进行初始化（替换掉截图里的那几行）
// ----------------------------------------------------
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const appId = 'purpled-thu-v1'; // 你的应用ID


// 模拟校园用户数据
const MOCK_PROFILES = [
  {
    id: 1,
    name: "阿杰",
    age: 20,
    major: "计算机科学与技术",
    location: "紫荆公寓",
    height: 181,
    weight: 72,
    tagMode: ["1", "side"],
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ajie&backgroundColor=b6e3f4",
    color: "from-purple-500 to-indigo-500",
    mapPosition: { top: '25%', left: '20%' },
    matchScore: 96,
    isPublic: true, 
    answers: { q19: "认真交往的恋爱对象", q18: "劳逸结合，一半一半", q15: ["性格和情绪稳定", "外形条件"], q1: ["1", "side"], q3: "同级/同龄", q9: "夜跑、看展、写代码", q22: "浙江", q25: "一周三次左右" }
  },
  {
    id: 2,
    name: "星宇",
    age: 21,
    major: "美术学院 - 工业设计",
    location: "南区宿舍",
    height: 176,
    weight: 60,
    tagMode: ["0", "其他(颜控)"],
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Xingyu&backgroundColor=ffdfbf",
    color: "from-pink-500 to-rose-500",
    mapPosition: { top: '70%', left: '80%' },
    matchScore: 89,
    isPublic: false, 
    answers: {}
  },
  {
    id: 3,
    name: "林一",
    age: 19,
    major: "经济管理学院",
    location: "紫荆公寓",
    height: 179,
    weight: 65,
    tagMode: ["side", "m"],
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Linyi&backgroundColor=c0aede",
    color: "from-blue-400 to-cyan-500",
    mapPosition: { top: '35%', left: '75%' },
    matchScore: 85,
    isPublic: true,
    answers: { q19: "贴贴抱抱的轻松关系", q26: "必须当晚解决", q1: ["side", "m"], q8: ["INFJ", "ENFJ"], q22: "广东", q24: "轮流买单或AA", q13: ["温和包容", "佛系松弛"] }
  },
  {
    id: 4,
    name: "学长Alex",
    age: 24,
    major: "电子工程系 (研二)",
    location: "双清公寓",
    height: 185,
    weight: 78,
    tagMode: ["1", "s"],
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=d1d4f9",
    color: "from-emerald-400 to-teal-500",
    mapPosition: { top: '80%', left: '30%' },
    matchScore: 82,
    isPublic: false,
    answers: {}
  }
];

const TAG_OPTIONS = ['1', '0', 's', 'm', 'side', '其他'];
const MBTI_OPTIONS = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];

const MATCH_QUESTIONS = [
  { id: 'q1', type: 'multi-other', title: '1. 你的属性（可多选）', options: ['1', '0', 's', 'm', '0.5', '不sm', '不10', 'side', '其他'] },
  { id: 'q2', type: 'multi-other', title: '2. 希望匹配到的对方的属性（可多选）', options: ['1', '0', 's', 'm', '0.5', '不sm', '不10', 'side', '其他'] },
  { id: 'q3', type: 'select', title: '3. 希望匹配到的对方的年龄', options: ['不限', '同级/同龄', '学长(大1-3岁)', '学弟(小1-3岁)', '更成熟(大3岁以上)'] },
  { id: 'q4', type: 'text', title: '4. 希望匹配到的对方的专业（可选填）', placeholder: '例如：理工科 / 经管 / 不限' },
  { id: 'q5', type: 'select', title: '5. 希望匹配到的对方的身高', options: ['不限', '170以下', '170-175', '175-180', '180-185', '185以上'] },
  { id: 'q6', type: 'select', title: '6. 希望匹配到的对方的体重', options: ['不限', '55kg以下', '55-65kg', '65-75kg', '75-85kg', '85kg以上'] },
  { id: 'q7', type: 'multi', title: '7. 希望匹配到的对方的身材（可多选）', options: ['肉壮', '薄肌', '匀称', '微胖', '很胖'] },
  { id: 'q8', type: 'multi', title: '8. 希望匹配到的对方的MBTI（可多选）', options: MBTI_OPTIONS },
  { id: 'q9', type: 'text', title: '9. 我的爱好包括', placeholder: '例如：夜跑、看展、打游戏...' },
  { id: 'q10', type: 'text', title: '10. 希望匹配到的对方的爱好包括', placeholder: '例如：喜欢户外、安静看书...' },
  { id: 'q11', type: 'text', title: '11. 我的坏习惯包括', placeholder: '真诚点哦，例如：有点拖延、容易情绪化' },
  { id: 'q12', type: 'text', title: '12. 我不希望匹配到的对方的坏习惯包括', placeholder: '例如：抽烟、冷暴力、海王...' },
  { id: 'q13', type: 'multi-limit', limit: 4, title: '13. 我具有这些特点（最多选四项）', options: ['富有野心和领导力', '温和包容', '深思熟虑', '乐观敏捷', '勤奋自律', '佛系松弛', '爱冒险勇于尝试新事物', '踏实求稳', '不计较付出爱照顾人', '乐于被照顾被安排'] },
  { id: 'q14', type: 'multi-limit', limit: 4, title: '14. 希望匹配到的对方的特点（最多选四项）', options: ['富有野心和领导力', '温和包容', '深思熟虑', '乐观敏捷', '勤奋自律', '佛系松弛', '爱冒险勇于尝试新事物', '踏实求稳', '不计较付出爱照顾人', '乐于被照顾被安排'] },
  { id: 'q15', type: 'multi-limit', limit: 3, title: '15. 我最看重对方的（最多选三项）', options: ['道德水准和善良', '智力水平', '外形条件', '情商(输送情绪价值)', '性格和情绪稳定', '经济条件'] },
  { id: 'q16', type: 'select', title: '16. 重大决定时，父母家庭对我的影响力', options: ['0-20% (自己完全做主)', '20-50% (会参考意见)', '50-80% (很大程度受影响)', '80-100% (基本听父母的)'] },
  { id: 'q17', type: 'single', title: '17. 关系稳定后，对于我和对方的同性好友，我的接受度是', options: ['一个都不能有', '有对象的可以', '也是我的朋友可以', '有点介意但不干涉', '完全不介意'] },
  { id: 'q18', type: 'single', title: '18. 目前阶段，我理想的时间分配是', options: ['全力以赴，尽可能多时间投入学业', '较多时间花在学业，少部分给娱乐社交', '劳逸结合，一半一半', '及格就行，尽可能多享受业余活动'] },
  { id: 'q19', type: 'single', title: '19. 我想在这里寻找的对方是', options: ['贴贴抱抱的轻松关系', '认真交往的恋爱对象', '朋友'] },
  { id: 'q20', type: 'select', title: '20. 我的每月花销是', options: ['1500以下', '1500-3000', '3000-5000', '5000-8000', '8000以上'] },
  { id: 'q21', type: 'multi', title: '21. 未来我希望的工作/深造地点是', options: ['北京', '江浙沪', '大湾区', '美国', '欧洲', '其他'] },
  { id: 'q22', type: 'select', title: '22. 我来自', options: ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '台湾', '香港', '澳门', '海外'] }, 
  { id: 'q23', type: 'single', title: '23. 我对亲密行为的接受程度是', options: ['快点无妨，感情到了就行', '交往一两年后', '双方家庭确认为结婚对象后', '婚后', '柏拉图，不想有亲密行为'] },
  { id: 'q24', type: 'single', title: '24. 你希望约会时谁买单', options: ['我爱买单', '多数时候我来买单', '轮流买单或AA', '多数时候由对方买单', '对方买吧，我不习惯抢着买单'] },
  { id: 'q25', type: 'single', title: '25. 我喜欢的约会频率是', options: ['天天在一起', '一周三次左右', '一周一次', '不用太频繁，十天半月一次'] },
  { id: 'q26', type: 'single', title: '26. 你和对象因为一件事吵了起来，吵完后你会?', options: ['必须当晚解决，睡不睡觉无所谓', '先冷静一下，明天再谈', '发消息说"今天累了，回头再说吧"', '等对方先开口，我需要台阶'] },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 切换 'login' (登录) 或 'register' (注册)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState('');
  const [isWaitVerify, setIsWaitVerify] = useState(false); // 控制是否显示等待验证的界面

  const [activeTab, setActiveTab] = useState('discover'); 
  const [currentView, setCurrentView] = useState('main'); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [showMatchAnim, setShowMatchAnim] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // 地图与定位相关状态
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [userLoc, setUserLoc] = useState([40.0000, 116.3265]); // 默认清华大学坐标
  const [isMapLoaded, setIsMapLoaded] = useState(false); 
  const mapContainerRef = useRef(null); // 安全的地图容器引用

  // 提示与模态框
  const [toastMsg, setToastMsg] = useState('');
  const [viewedProfile, setViewedProfile] = useState(null); 

  // 云端真实用户与认证
  const [currentUser, setCurrentUser] = useState(null);
  const [realUsers, setRealUsers] = useState([]);

  // 新增：实时聊天相关状态
  const [currentChatUser, setCurrentChatUser] = useState(null); // 当前正在聊天的对象
  const [allMessages, setAllMessages] = useState([]); // 云端所有消息
  const [inputText, setInputText] = useState(''); // 聊天输入框
  const chatEndRef = useRef(null); // 用于自动滚动到底部

  // 个人资料与问卷
  const [userProfile, setUserProfile] = useState({
    name: '清华学子',
    avatarUrl: null,
    gender: '男',
    age: '20',
    major: '软件工程',
    grade: '大二',
    height: '178',
    weight: '65',
    tagMode: ['side'], 
    customTag: '' 
  });
  const [qaAnswers, setQaAnswers] = useState({});
  const [isQaPublic, setIsQaPublic] = useState(true);

  // 计算问卷进度
  const answeredCount = MATCH_QUESTIONS.filter(q => {
    const ans = qaAnswers[q.id];
    if (Array.isArray(ans)) return ans.length > 0;
    return ans !== undefined && ans !== '';
  }).length;
  const progressPercent = Math.round((answeredCount / MATCH_QUESTIONS.length) * 100);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);
  const fileInputRef = useRef(null);

  // 新增：每次收到新消息时，聊天界面自动滚动到底部
  useEffect(() => {
    if (currentChatUser && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages, currentChatUser]);

  // ----------------------------------------------------
  // 初始化全局 Leaflet 地图脚本资源 (安全加载)
  // ----------------------------------------------------
  useEffect(() => {
    if (document.getElementById('leaflet-script')) {
      if (window.L) setIsMapLoaded(true);
      return;
    }
    
    try {
      const style = document.createElement('style');
      style.innerHTML = `.leaflet-div-icon { background: transparent !important; border: none !important; }`;
      document.head.appendChild(style);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.id = 'leaflet-script';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => setIsMapLoaded(true);
      script.onerror = (e) => console.error("Leaflet script failed to load", e);
      document.head.appendChild(script);
    } catch (err) {
      console.error("Map resource load error:", err);
    }
  }, []);

  // ----------------------------------------------------
  // Firebase 认证与数据同步监听
  // ----------------------------------------------------
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      }
    };
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser || !db) return;
    try {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'profiles'));
      const unsubscribeDB = onSnapshot(q, (snapshot) => {
        const profiles = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.id !== currentUser.uid) { 
            profiles.push({ id: docSnap.id, ...docSnap.data() });
          }
        });
        setRealUsers(profiles);
      }, (error) => {
        console.error("数据拉取失败:", error);
      });
      return () => unsubscribeDB();
    } catch (err) {
      console.error("Firestore connection error:", err);
    }
  }, [currentUser]);

  // 新增：监听云端的所有实时聊天消息
  useEffect(() => {
    if (!currentUser || !db) return;
    try {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'messages'));
      const unsubscribeMsg = onSnapshot(q, (snapshot) => {
        const msgs = [];
        snapshot.forEach((docSnap) => {
          msgs.push({ id: docSnap.id, ...docSnap.data() });
        });
        // 在本地按时间戳排序以符合开发规范
        msgs.sort((a, b) => a.timestamp - b.timestamp);
        setAllMessages(msgs);
      }, (error) => {
        console.error("消息拉取失败:", error);
      });
      return () => unsubscribeMsg();
    } catch (err) {
      console.error("Firestore message connection error:", err);
    }
  }, [currentUser]);

  // 合并数据
  const displayProfiles = [...realUsers, ...MOCK_PROFILES];

  // UI 交互
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const checkTsinghuaEmail = (em) => {
    return em.endsWith('@mails.tsinghua.edu.cn') || em.endsWith('@tsinghua.edu.cn');
  };

  const handleRegister = async () => {
    if (!checkTsinghuaEmail(email)) return setAuthError('必须使用清华大学教育邮箱');
    if (password.length < 6) return setAuthError('密码至少需要 6 位');
    if (!username.trim()) return setAuthError('请填写用户名');
    setAuthError('');

    try {
      showToast('正在注册中...');
      // 1. 在 Firebase 创建账号
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. 发送验证邮件
      await sendEmailVerification(userCredential.user);
      
      // 3. 将初始用户名保存到你的 profiles 数据库（为了防止用户没填资料前就没有名字）
      if (db) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', userCredential.user.uid), {
          name: username,
          email: email,
          isPublic: false
        }, { merge: true });
      }

      setIsWaitVerify(true); // 切换到提示去邮箱激活的界面
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') setAuthError('该邮箱已被注册，请直接登录');
      else setAuthError('注册失败：' + error.message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return setAuthError('请填写邮箱和密码');
    setAuthError('');

    try {
      showToast('正在验证...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 检查邮箱是否已经通过点击链接激活
      if (!userCredential.user.emailVerified) {
        setAuthError('该邮箱尚未激活，请前往清华邮箱点击激活链接');
        // 可选：在这里再发一次验证邮件
        // await sendEmailVerification(userCredential.user); 
        return;
      }

      // 验证通过，进入主界面
      setIsAuthenticated(true);
    } catch (error) {
      if (error.code === 'auth/invalid-credential') setAuthError('邮箱或密码错误');
      else setAuthError('登录失败：' + error.message);
    }
  };

  const handleSaveToCloud = async () => {
    if (!currentUser || !db) return showToast('未登录或云数据库未连接，保存失败');

    // 定义一个内部保存逻辑：接收真实的或默认的经纬度作为“基准点”
    const saveWithLocation = async (baseLat, baseLng) => {
      // 核心秘籍：在基准点上加上随机偏移量（保护隐私 + 防止头像重叠）
      const finalLat = baseLat + (Math.random() - 0.5) * 0.005;
      const finalLng = baseLng + (Math.random() - 0.5) * 0.005;

      try {
        const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', currentUser.uid);
        await setDoc(profileRef, {
          name: userProfile.name,
          age: userProfile.age,
          major: userProfile.major,
          location: "紫荆校园", // 这里保持文字，用于卡片上的 UI 显示
          // --- 写入最终计算好的坐标 ---
          latitude: finalLat,  
          longitude: finalLng, 
          // ----------------------------
          height: userProfile.height,
          weight: userProfile.weight,
          tagMode: userProfile.tagMode,
          avatarUrl: userProfile.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + currentUser.uid,
          color: "from-blue-400 to-purple-500", 
          matchScore: Math.floor(Math.random() * 15) + 85, 
          isPublic: isQaPublic,
          answers: qaAnswers,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        showToast('资料保存成功！已同步至云端匹配大厅');
      } catch (error) {
        console.error("保存失败详情:", error);
        showToast('保存失败：' + error.message);
      }
    };

    showToast('正在获取定位并保存...');

    // 尝试获取真实GPS
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // 获取成功：使用用户的真实 GPS 作为基准点
          saveWithLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          // 获取失败（用户拒绝授权或没信号）：使用紫荆公寓作为默认基准点
          console.warn("定位获取失败，使用默认坐标", error);
          saveWithLocation(40.002, 116.326);
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      // 浏览器不支持：直接使用默认基准点
      saveWithLocation(40.002, 116.326);
    }
  };

  const handleLike = () => {
    if (currentIndex >= displayProfiles.length) return;
    const currentProfile = displayProfiles[currentIndex];
    const isMatch = Math.random() > 0.4; 
    if (isMatch) {
      setMatches([...matches, currentProfile]);
      setShowMatchAnim(true);
      setTimeout(() => { setShowMatchAnim(false); setCurrentIndex(prev => prev + 1); }, 1500);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // 新增：发送聊天消息到云端
  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentUser || !currentChatUser || !db) return;
    
    const text = inputText.trim();
    setInputText(''); // 乐观更新：立刻清空输入框
    
    try {
      // 双方的 UID 排序组合作为唯一的聊天房间 ID
      const chatId = [String(currentUser.uid), String(currentChatUser.id)].sort().join('_');
      const msgRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'));
      
      await setDoc(msgRef, {
        chatId,
        text,
        senderId: currentUser.uid,
        receiverId: currentChatUser.id,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(error);
      showToast('发送失败，请检查网络');
    }
  };

  const handlePass = () => setCurrentIndex(prev => prev + 1);

  const handleViewProfileClick = (profile) => {
    if (profile.isPublic) {
      setViewedProfile(profile);
    } else {
      showToast(`已向 ${profile.name || '同学'} 发送查看资料申请`);
    }
  };

  const updateQaAnswer = (id, val) => setQaAnswers(prev => ({ ...prev, [id]: val }));
  const toggleQaArrayItem = (id, item, limit = null) => {
    setQaAnswers(prev => {
      const current = prev[id] || [];
      if (current.includes(item)) {
        return { ...prev, [id]: current.filter(i => i !== item) };
      } else {
        if (limit && current.length >= limit) {
          showToast(`该项最多只能选择 ${limit} 项`);
          return prev;
        }
        return { ...prev, [id]: [...current, item] };
      }
    });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserProfile({ ...userProfile, avatarUrl: imageUrl });
    }
  };

  // ----------------------------------------------------
  // 地图交互渲染钩子 (安全挂载机制)
  // ----------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'nearby' || !locationEnabled || !isMapLoaded || !mapContainerRef.current) return;
    
    const container = mapContainerRef.current;
    if (container._leaflet_id) return; // 避免 React 重绘引发多次挂载

    let map;
    try {
      map = window.L.map(container, {
        zoomControl: false,
        attributionControl: false
      }).setView(userLoc, 15);

      // 将原来的国外地图替换为：高德地图 (AMap) 的高清国内底图
      window.L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        subdomains: ['1', '2', '3', '4'],
        maxZoom: 18,
        minZoom: 3,
        attribution: '© 高德地图'
      }).addTo(map);

      // 我的位置
      const myAvatar = userProfile.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me';
      const myIconHtml = `
        <div class="relative flex items-center justify-center w-14 h-14">
          <div class="absolute w-full h-full bg-purple-500 rounded-full animate-ping opacity-50" style="animation-duration: 2.5s;"></div>
          <div class="absolute w-12 h-12 bg-white rounded-full p-1 shadow-2xl border-2 border-purple-600 z-10 overflow-hidden">
             <img src="${myAvatar}" class="w-full h-full object-cover" />
          </div>
        </div>
      `;
      window.L.marker(userLoc, {
        icon: window.L.divIcon({ html: myIconHtml, iconSize: [56, 56], iconAnchor: [28, 28] }),
        zIndexOffset: 1000
      }).addTo(map);

      // 附近用户
      displayProfiles.forEach((profile, index) => {
        const idNum = String(profile.id).charCodeAt(0) || index;
        const latOffset = (Math.sin(idNum * 123) * 0.012);
        const lngOffset = (Math.cos(idNum * 321) * 0.012);
        const pName = profile.name || '?';
        const pNameInitial = pName.length > 0 ? pName[0] : '?';

        const avatarHtml = profile.avatarUrl
          ? `<img src="${profile.avatarUrl}" class="w-full h-full object-cover" />`
          : `<span class="text-xl font-bold text-gray-400 opacity-50">${pNameInitial}</span>`;

        const iconHtml = `
          <div class="relative group cursor-pointer flex flex-col items-center">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br ${profile.color || 'from-blue-400 to-blue-600'} p-0.5 shadow-md transform transition-transform group-hover:scale-125 group-hover:shadow-2xl z-10">
              <div class="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden border border-white/50">
                ${avatarHtml}
              </div>
              <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
            </div>
            
            <div class="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold text-gray-800 whitespace-nowrap z-20 pointer-events-none flex items-center transform -translate-y-1">
              ${pName} 
              <span class="text-pink-500 ml-1.5 flex items-center bg-pink-50 px-1.5 py-0.5 rounded-md">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="mr-0.5"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg> 
                ${profile.matchScore || 90}%
              </span>
            </div>
          </div>
        `;

        window.L.marker([userLoc[0] + latOffset, userLoc[1] + lngOffset], {
          icon: window.L.divIcon({ html: iconHtml, iconSize: [48, 48], iconAnchor: [24, 24] })
        }).addTo(map);
      });
    } catch (err) {
      console.error("Leaflet map rendering error:", err);
    }

    // 卸载地图实例防止内存泄漏或脏状态
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [activeTab, locationEnabled, isMapLoaded, displayProfiles, userProfile.avatarUrl, userLoc]);

  // ================= 模块渲染逻辑 =================

const renderAuth = () => {
    if (isWaitVerify) {
      return (
        <div className="w-full h-full flex flex-col items-center px-8 pt-32 bg-white relative text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">验证邮件已发送</h2>
          <p className="text-gray-500 mb-8">我们已向 <span className="font-bold text-purple-600">{email}</span> 发送了一封激活邮件。请前往邮箱点击链接完成验证。</p>
          <button onClick={() => { setIsWaitVerify(false); setAuthMode('login'); }} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold active:scale-95 transition-all">
            我已验证，去登录
          </button>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col px-8 pt-16 bg-white relative overflow-y-auto pb-10">
        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center transform rotate-12 mb-8 shadow-lg shadow-purple-500/30">
           <span className="text-white font-black text-2xl -rotate-12">THU</span>
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          {authMode === 'login' ? '欢迎回来' : '注册 Purpled'}
        </h1>
        <p className="text-gray-500 mb-8">专属于清华的男生交友社区</p>

        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          {authMode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">怎么称呼你 (用户名)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setAuthError(''); }}
                className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                placeholder="例如：紫荆彭于晏"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">清华邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value.toLowerCase()); setAuthError(''); }}
              className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
              placeholder="@mails.tsinghua.edu.cn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
              className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
              placeholder={authMode === 'register' ? "设置一个至少6位的密码" : "输入密码"}
            />
          </div>

          {authError && <p className="text-sm text-red-500 font-medium">{authError}</p>}
          
          <button
            onClick={authMode === 'login' ? handleLogin : handleRegister}
            className="w-full py-4 mt-2 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98]"
          >
            {authMode === 'login' ? '登录' : '同意协议并注册'}
          </button>

          <div className="text-center mt-6">
            <button 
              onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
              className="text-sm text-gray-500 font-medium hover:text-purple-600 transition-colors"
            >
              {authMode === 'login' ? '没有账号？点击注册' : '已有账号？直接登录'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMatch = () => {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-white px-4 py-4 border-b border-gray-100 z-10 sticky top-0 shadow-sm">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <ClipboardEdit className="w-6 h-6 mr-2 text-purple-600" />
              灵魂契合度问卷
            </h2>
            <span className="text-sm font-bold text-purple-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">认真填写，匹配算法会向你推荐契合度 80% 以上的同学</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 pb-32">
          {MATCH_QUESTIONS.map((q, index) => {
            const currentAns = qaAnswers[q.id];

            return (
              <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 animate-in slide-in-from-bottom-4" style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}>
                <h3 className="font-bold text-gray-800 mb-3 leading-relaxed">{q.title}</h3>
                
                {q.type === 'text' && (
                  <input 
                    type="text" 
                    value={currentAns || ''}
                    onChange={(e) => updateQaAnswer(q.id, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={q.placeholder}
                  />
                )}

                {q.type === 'select' && (
                  <select 
                    value={currentAns || ''}
                    onChange={(e) => updateQaAnswer(q.id, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="" disabled>请选择...</option>
                    {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                )}

                {q.type === 'single' && (
                  <div className="flex flex-col space-y-2">
                    {q.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => updateQaAnswer(q.id, opt)}
                        className={`text-left px-4 py-3 rounded-xl text-sm transition-all border ${
                          currentAns === opt 
                          ? 'bg-purple-50 border-purple-300 text-purple-700 font-bold' 
                          : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {(q.type === 'multi' || q.type === 'multi-limit' || q.type === 'multi-other') && (
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {q.options.map(opt => {
                        const isArrAns = Array.isArray(currentAns) ? currentAns : [];
                        const isSelected = isArrAns.includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleQaArrayItem(q.id, opt, q.limit)}
                            className={`px-4 py-2 rounded-full text-sm transition-all border ${
                              isSelected
                              ? 'bg-purple-600 border-purple-600 text-white shadow-md' 
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                    
                    {q.type === 'multi-other' && (Array.isArray(currentAns) && currentAns.includes('其他')) && (
                       <div className="mt-3">
                         <input 
                          type="text" 
                          value={qaAnswers[`${q.id}_other`] || ''}
                          onChange={(e) => updateQaAnswer(`${q.id}_other`, e.target.value)}
                          className="w-full bg-purple-50/50 border border-purple-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="请输入具体的标签内容..."
                        />
                       </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${isQaPublic ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {isQaPublic ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">公开问卷资料</p>
                  <p className="text-xs text-gray-500">允许互相喜欢的人直接查看你的资料</p>
                </div>
              </div>
              <button 
                onClick={() => setIsQaPublic(!isQaPublic)}
                className={`w-12 h-6 rounded-full relative transition-colors ${isQaPublic ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${isQaPublic ? 'left-6' : 'left-0.5'}`}></div>
              </button>
            </div>

            <button 
              onClick={handleSaveToCloud}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/30 flex justify-center items-center active:scale-95 transition-transform"
            >
              保存并同步至云端大厅
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDiscover = () => {
    if (currentIndex >= displayProfiles.length) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4"><Sparkles className="w-10 h-10 text-purple-600" /></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">附近没有更多同学啦</h2>
          <button onClick={() => setCurrentIndex(0)} className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-full font-medium">重新浏览</button>
        </div>
      );
    }
    const profile = displayProfiles[currentIndex];
    const pName = profile.name || '?';
    
    return (
      <div className="relative w-full h-full flex flex-col pt-4 pb-2">
        <div 
          onClick={() => handleViewProfileClick(profile)}
          className="flex-1 w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col relative border border-purple-50 cursor-pointer group"
        >
          <div className={`h-[55%] w-full bg-gradient-to-br ${profile.color || 'from-blue-400 to-purple-500'} relative flex items-center justify-center overflow-hidden`}>
             {profile.avatarUrl ? (
               <img src={profile.avatarUrl} alt={pName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
             ) : (
               <span className="text-white text-6xl font-bold opacity-30">{pName[0]}</span>
             )}
             
             <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center space-x-1 shadow-lg border border-white/50">
                <Percent className="w-4 h-4 text-pink-500" />
                <span className="text-pink-600 font-black text-sm">契合度 {profile.matchScore || 90}%</span>
             </div>

             <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1 text-white text-sm">
                <MapPin className="w-3 h-3" /><span>{profile.location || '紫荆校园'}</span>
             </div>
             
             <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-white to-transparent"></div>
          </div>
          
          <div className="p-5 flex-1 flex flex-col bg-white relative">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">{pName} <span className="text-2xl font-normal text-gray-500 ml-1">{profile.age || '20'}</span></h2>
              {profile.isPublic ? (
                 <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                   <Unlock className="w-3 h-3 mr-1"/> 资料公开
                 </span>
              ) : (
                 <span className="flex items-center text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                   <Lock className="w-3 h-3 mr-1"/> 需申请
                 </span>
              )}
            </div>
            
            <div className="flex flex-col space-y-2.5 mb-4">
              <div className="flex items-center text-gray-700 font-medium text-sm">
                <div className="w-6 flex justify-center"><BookOpen className="w-4 h-4 text-purple-400" /></div>
                <span>{profile.major || '未填写专业'}</span>
              </div>
              <div className="flex items-center text-gray-700 font-medium text-sm">
                <div className="w-6 flex justify-center"><User className="w-4 h-4 text-blue-400" /></div>
                <span>{profile.height || '?'} cm • {profile.weight || '?'} kg</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(profile.tagMode || []).map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-gray-100">
                  {tag}
                </span>
              ))}
            </div>

            <div className="absolute bottom-4 left-0 w-full flex justify-center text-xs text-gray-400 animate-pulse">
               点击卡片查看详细灵魂问卷
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center space-x-10 py-5">
          <button onClick={handlePass} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 hover:text-red-500 active:scale-90 transition-all"><X className="w-6 h-6" /></button>
          <button onClick={handleLike} className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl shadow-pink-500/30 text-white active:scale-90 transition-all"><Heart className="w-8 h-8 fill-current" /></button>
        </div>

        {showMatchAnim && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-3xl">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-400 mb-6 -rotate-6 italic">It's a Match!</h2>
            <p className="text-white mb-8">你和 {pName} 互相喜欢了对方</p>
          </div>
        )}
      </div>
    );
  };

  const renderProfileModal = () => {
    if (!viewedProfile) return null;
    return (
      <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden">
        <div className="relative h-64 bg-gray-900 flex-shrink-0">
           {viewedProfile.avatarUrl && <img src={viewedProfile.avatarUrl} className="w-full h-full object-cover opacity-60" />}
           <button onClick={() => setViewedProfile(null)} className="absolute top-6 left-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition">
             <ChevronLeft className="w-6 h-6" />
           </button>
           <div className="absolute bottom-4 left-4 text-white">
             <h2 className="text-3xl font-black">{viewedProfile.name || '?'}</h2>
             <p className="opacity-80 mt-1">{viewedProfile.major || '未填写专业'}</p>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 bg-gray-50 pb-20">
          <div className="bg-white p-5 rounded-2xl shadow-sm space-y-5">
             <h3 className="font-black text-xl text-gray-900 border-b pb-3 mb-4 flex items-center">
               <ClipboardEdit className="w-5 h-5 mr-2 text-purple-600" /> 灵魂档案
             </h3>
             
             {MATCH_QUESTIONS.map(q => {
               const ans = viewedProfile.answers?.[q.id];
               if (ans === undefined || ans === null || (Array.isArray(ans) && ans.length === 0) || ans === '') return null;
               
               let displayAns = ans;
               if (Array.isArray(ans)) {
                 displayAns = ans.join('、');
                 if (ans.includes('其他') && viewedProfile.answers[`${q.id}_other`]) {
                   displayAns += ` (${viewedProfile.answers[`${q.id}_other`]})`;
                 }
               }

               return (
                 <div key={q.id} className="flex flex-col space-y-1">
                   <span className="text-sm font-bold text-gray-500">{q.title.replace(/^\d+\.\s*/, '')}</span>
                   <span className="text-base text-gray-900 bg-gray-50 px-4 py-2.5 rounded-xl mt-1 border border-gray-100">{displayAns}</span>
                 </div>
               );
             })}
             
             {(!viewedProfile.answers || Object.keys(viewedProfile.answers).length === 0) && (
               <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                 <Lock className="w-10 h-10 mb-2 opacity-20" />
                 <p>TA还没有填写问卷哦~</p>
               </div>
             )}
          </div>
        </div>
      </div>
    );
  };

  const renderNearby = () => {
    if (!locationEnabled) {
      return (
        <div className="h-full flex flex-col items-center justify-center px-6 text-center">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6"><MapIcon className="w-12 h-12 text-blue-500" /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">发现身边的缘分</h2>
          <p className="text-gray-500 text-sm mb-8 px-4">调用真实地理位置服务，在地图上偶遇同样在校园里的他。</p>
          <button 
            onClick={() => {
              setIsLocating(true);
              if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setUserLoc([position.coords.latitude, position.coords.longitude]);
                    setIsLocating(false);
                    setLocationEnabled(true);
                    showToast('成功获取您的精确位置！');
                  },
                  (error) => {
                    // 优化定位失败的错误提示
                    let errorMsg = '定位失败，启用清华默认坐标';
                    if (error.code === 1) errorMsg = '您拒绝了定位权限，已启用默认坐标';
                    if (error.code === 2 || error.code === 3) errorMsg = '测试环境/网络限制定位，已启用默认坐标';

                    setUserLoc([40.0000, 116.3265]); 
                    setIsLocating(false);
                    setLocationEnabled(true);
                    showToast(errorMsg);
                  },
                  { timeout: 5000, enableHighAccuracy: true }
                );
              } else {
                setUserLoc([40.0000, 116.3265]);
                setIsLocating(false);
                setLocationEnabled(true);
                showToast('当前环境不支持定位，启用默认坐标');
              }
            }}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center transition-transform active:scale-95"
            disabled={isLocating}
          >
            {isLocating ? (
              <><Navigation className="w-5 h-5 mr-2 animate-spin" /> 正在搜寻卫星信号...</>
            ) : (
              <><Navigation className="w-5 h-5 mr-2" /> 允许开启真实地图</>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full bg-[#f4f7f6] overflow-hidden rounded-3xl border border-gray-100 shadow-inner animate-in zoom-in-95 duration-500">
        <div ref={mapContainerRef} className="w-full h-full z-0 relative outline-none"></div>
        <div className="absolute right-4 bottom-4 flex flex-col space-y-3 z-20">
          <button 
            onClick={() => showToast('雷达扫描已更新，当前展示附近活跃用户')}
            className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-blue-600 hover:scale-105 transition-transform border border-blue-50"
          >
            <Navigation className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    // 动态提取：只要你们聊过天，不管有没有配对，都在列表里显示
    const chattedUserIds = new Set(
      allMessages
        .filter(m => m.senderId === currentUser?.uid || m.receiverId === currentUser?.uid)
        .map(m => m.senderId === currentUser?.uid ? String(m.receiverId) : String(m.senderId))
    );

    // 合并：划卡匹配成功的人 + 已经聊过天的人
    const chatListProfiles = displayProfiles.filter(p =>
      matches.some(m => m.id === p.id) || chattedUserIds.has(String(p.id))
    );

    return (
      <div className="h-full flex flex-col">
        <div className="py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">消息</h2>
        </div>
        <div className="flex-1 overflow-y-auto pt-4">
          {chatListProfiles.length > 0 ? (
            <div className="space-y-4">
              {chatListProfiles.map(match => {
                const pName = match.name || '?';
                
                // 查找你们的最后一条消息
                const chatId = [String(currentUser?.uid), String(match.id)].sort().join('_');
                const chatMsgs = allMessages.filter(m => m.chatId === chatId);
                const lastMsg = chatMsgs.length > 0 ? chatMsgs[chatMsgs.length - 1].text : '匹配成功，现在开始聊天吧！';

                return (
                  <div key={match.id} onClick={() => setCurrentChatUser(match)} className="flex items-center space-x-4 p-2 hover:bg-purple-50 rounded-2xl cursor-pointer transition-colors active:scale-95">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${match.color || 'from-blue-400 to-blue-600'} flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm`}>
                      {match.avatarUrl ? (
                        <img src={match.avatarUrl} alt={pName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-xl font-bold">{pName[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-gray-900">{pName}</h4>
                      <p className="text-sm text-gray-500 truncate">{lastMsg}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400"><MessageCircle className="w-12 h-12 mb-2 opacity-20" /><p>暂无消息，快去探索吧</p></div>
          )}
        </div>
      </div>
    );
  };

  // 新增：渲染完整的实时聊天界面
  const renderChatView = () => {
    if (!currentChatUser) return null;
    
    // 过滤出当前两人之间的所有消息
    const chatId = [String(currentUser?.uid), String(currentChatUser.id)].sort().join('_');
    const chatMsgs = allMessages.filter(m => m.chatId === chatId);

    return (
      <div className="absolute inset-0 bg-gray-50 z-30 flex flex-col animate-in slide-in-from-right duration-300">
        {/* 聊天头部栏 */}
        <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100 shadow-sm z-10">
          <button onClick={() => setCurrentChatUser(null)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 shadow-sm">
               {currentChatUser.avatarUrl ? <img src={currentChatUser.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-bold">{currentChatUser.name?.[0] || '?'}</div>}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{currentChatUser.name || '同学'}</h2>
          </div>
          <div className="w-8"></div> {/* 占位符以居中 */}
        </div>

        {/* 聊天消息滚动区 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f4f7f6]">
          {chatMsgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
              <Sparkles className="w-12 h-12 mb-2" />
              <p className="text-sm">这是你们的初次相遇，发个消息打个招呼吧！</p>
            </div>
          ) : (
            chatMsgs.map(msg => {
              const isMe = msg.senderId === currentUser?.uid;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    isMe 
                    ? 'bg-purple-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              )
            })
          )}
          <div ref={chatEndRef} /> {/* 自动滚动锚点 */}
        </div>

        {/* 底部输入框 */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center space-x-2 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="发送消息..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full pl-5 pr-14 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="absolute right-1.5 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white disabled:opacity-0 disabled:scale-75 shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    return (
      <div className="h-full flex flex-col items-center pt-8 overflow-y-auto pb-6">
        <div className="w-full flex justify-end px-4 mb-4">
          <Settings className="w-6 h-6 text-gray-400 cursor-pointer" />
        </div>
        
        <div className="relative mb-6 cursor-pointer group" onClick={() => fileInputRef.current.click()}>
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 p-1 shadow-xl">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden border-4 border-white relative">
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-purple-200" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-gray-100 text-purple-600">
            <Camera className="w-4 h-4" />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div className="flex items-center space-x-2 mb-1">
          {isEditingName ? (
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="text-2xl font-bold text-gray-900 border-b-2 border-purple-500 focus:outline-none bg-transparent w-32 text-center"
                autoFocus
              />
              <button 
                onClick={() => {
                  setUserProfile({...userProfile, name: tempName});
                  setIsEditingName(false);
                }}
                className="bg-purple-100 p-1.5 rounded-full text-purple-700"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900">{userProfile.name}</h2>
              <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-purple-600">
                <Edit2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        <p className="text-purple-600 font-medium mb-6">清华大学 • {userProfile.major}</p>

        <div className="w-full px-4 space-y-3">
          <button 
            onClick={() => setCurrentView('editProfile')}
            className="w-full py-4 bg-white rounded-2xl shadow-sm border border-gray-50 text-left px-6 font-medium text-gray-700 flex justify-between items-center hover:bg-gray-50"
          >
            编辑个人资料
            <span className="text-gray-300">›</span>
          </button>
          
          <button 
            onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="w-full py-4 bg-white rounded-2xl shadow-sm border border-gray-50 text-left px-6 font-medium text-purple-600 flex justify-between items-center hover:bg-gray-50"
          >
            {copied ? "✅ 链接已复制" : "🔗 分享网站给同学"}
          </button>
          
          <button 
            onClick={() => { setIsAuthenticated(false); setAuthStep('email'); setCode(''); }}
            className="w-full py-4 bg-red-50 rounded-2xl text-red-600 font-bold flex justify-center items-center mt-4"
          >
            退出登录
          </button>
        </div>
      </div>
    );
  };

  const renderEditProfile = () => {
    return (
      <div className="absolute inset-0 bg-gray-50 z-20 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
          <button onClick={() => setCurrentView('main')} className="p-2 -ml-2 text-gray-600">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">编辑个人资料</h2>
          <button 
            onClick={() => setCurrentView('main')} 
            className="text-purple-600 font-bold text-sm"
          >
            完成
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <label className="block text-sm font-medium text-gray-500 mb-2">性别</label>
            <select 
              value={userProfile.gender}
              onChange={(e) => setUserProfile({...userProfile, gender: e.target.value})}
              className="w-full bg-transparent text-gray-900 font-medium focus:outline-none"
            >
              <option value="男">男</option>
              <option value="女">女</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <label className="block text-sm font-medium text-gray-500 mb-2">年龄</label>
            <input 
              type="number" 
              value={userProfile.age}
              onChange={(e) => setUserProfile({...userProfile, age: e.target.value})}
              className="w-full bg-transparent text-gray-900 font-medium focus:outline-none"
              placeholder="例如：20"
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <label className="block text-sm font-medium text-gray-500 mb-2">学院/专业</label>
            <input 
              type="text" 
              value={userProfile.major}
              onChange={(e) => setUserProfile({...userProfile, major: e.target.value})}
              className="w-full bg-transparent text-gray-900 font-medium focus:outline-none"
              placeholder="例如：计算机科学与技术"
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
              <label className="block text-sm font-medium text-gray-500 mb-2">身高 (cm)</label>
              <input 
                type="number" 
                value={userProfile.height}
                onChange={(e) => setUserProfile({...userProfile, height: e.target.value})}
                className="w-full bg-transparent text-gray-900 font-medium focus:outline-none"
              />
            </div>
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
              <label className="block text-sm font-medium text-gray-500 mb-2">体重 (kg)</label>
              <input 
                type="number" 
                value={userProfile.weight}
                onChange={(e) => setUserProfile({...userProfile, weight: e.target.value})}
                className="w-full bg-transparent text-gray-900 font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <label className="block text-sm font-medium text-gray-500 mb-3">标签属性 (可多选)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {TAG_OPTIONS.map(tag => {
                const isSelected = userProfile.tagMode.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      setUserProfile(prev => {
                        const newTags = isSelected 
                          ? prev.tagMode.filter(t => t !== tag)
                          : [...prev.tagMode, tag];
                        return {...prev, tagMode: newTags};
                      });
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
            
            {userProfile.tagMode.includes('其他') && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                 <input 
                  type="text" 
                  value={userProfile.customTag}
                  onChange={(e) => setUserProfile({...userProfile, customTag: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="请输入您的专属标签..."
                />
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-400 text-center pt-4 pb-8">
            完善资料能让更多人了解你哦
          </p>
        </div>
      </div>
    );
  };

  const renderToast = () => {
    if (!toastMsg) return null;
    return (
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full shadow-2xl z-50 font-medium text-sm text-center min-w-[200px] animate-in fade-in zoom-in duration-200 pointer-events-none">
        {toastMsg}
      </div>
    );
  }

  // ================= 根渲染逻辑 =================

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center sm:p-4 font-sans"><div className="w-full h-[100dvh] sm:h-[800px] sm:max-h-[90vh] sm:max-w-[400px] bg-white sm:rounded-[2.5rem] sm:shadow-2xl overflow-hidden flex flex-col relative sm:border-8 sm:border-white">{renderAuth()}</div></div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center sm:p-4 font-sans selection:bg-purple-200">
      <div className="w-full h-[100dvh] sm:h-[800px] sm:max-h-[90vh] sm:max-w-[400px] bg-gray-50 sm:rounded-[2.5rem] sm:shadow-2xl overflow-hidden flex flex-col relative sm:border-8 sm:border-white">
        
        {currentView === 'editProfile' ? renderEditProfile() : (
          <>
            {renderToast()}
            {renderChatView()} {/* 新增：聊天界面模态框覆盖在最上层 */}

            <header className="px-5 pt-8 pb-3 flex justify-between items-center bg-gray-50 z-10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center transform rotate-12">
                  <span className="text-white font-black text-sm -rotate-12">THU</span>
                </div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">Purpled</h1>
              </div>
            </header>

            <main className="flex-1 overflow-hidden px-4 relative pb-2">
              {activeTab === 'discover' && renderDiscover()}
              {activeTab === 'nearby' && renderNearby()}
              {activeTab === 'match' && renderMatch()} 
              {activeTab === 'messages' && renderMessages()}
              {activeTab === 'profile' && renderProfile()}
              {renderProfileModal()}
            </main>

            <nav className="h-[80px] sm:h-20 bg-white border-t border-gray-100 flex justify-around items-center px-2 pb-6 sm:pb-2 z-10 sm:rounded-b-[2rem]">
              <button onClick={() => setActiveTab('discover')} className={`flex flex-col items-center space-y-1 w-1/5 ${activeTab === 'discover' ? 'text-purple-600' : 'text-gray-400'}`}><Sparkles className="w-6 h-6" /><span className="text-[10px] font-bold transform scale-90">探索</span></button>
              <button onClick={() => setActiveTab('nearby')} className={`flex flex-col items-center space-y-1 w-1/5 ${activeTab === 'nearby' ? 'text-blue-500' : 'text-gray-400'}`}><MapIcon className="w-6 h-6" /><span className="text-[10px] font-bold transform scale-90">附近</span></button>
              
              <button onClick={() => setActiveTab('match')} className={`flex flex-col items-center space-y-1 w-1/5 ${activeTab === 'match' ? 'text-pink-500' : 'text-gray-400'}`}>
                <ClipboardEdit className="w-6 h-6" />
                <span className="text-[10px] font-bold transform scale-90">匹配</span>
              </button>
              
              <button onClick={() => setActiveTab('messages')} className={`flex flex-col items-center space-y-1 relative w-1/5 ${activeTab === 'messages' ? 'text-purple-600' : 'text-gray-400'}`}><MessageCircle className="w-6 h-6" /><span className="text-[10px] font-bold transform scale-90">消息</span></button>
              <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center space-y-1 w-1/5 ${activeTab === 'profile' ? 'text-purple-600' : 'text-gray-400'}`}><User className="w-6 h-6" /><span className="text-[10px] font-bold transform scale-90">我的</span></button>
            </nav>
          </>
        )}
      </div>
    </div>
  );
}