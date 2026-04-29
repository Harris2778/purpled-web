import React, { useState, useRef, useEffect } from 'react';
import { Heart, X, MessageCircle, User, Sparkles, MapPin, BookOpen, Search, Settings, Mail, ArrowRight, LogOut, Map as MapIcon, Navigation, Edit2, ChevronLeft, Check, ClipboardEdit, Lock, Unlock, Percent, AlertCircle, Plus, Users, MoreHorizontal, Star, Shield, Crown, Trash2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, updateDoc, onSnapshot, query, getDoc, getDocs } from 'firebase/firestore';

// ----------------------------------------------------
// 1. Firebase 钥匙配置
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
// 2. 初始化
// ----------------------------------------------------
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const appId = 'purpled-thu-v1'; // 应用ID

const TAG_OPTIONS = ['1', '0', 's', 'm', 'side', '其他'];
const MBTI_OPTIONS = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];

const MAJOR_OPTIONS = [
  "安全科学学院", "材料学院", "出土文献研究与保护中心", "低碳能源实验室", "电机工程与应用电子技术系", "笃实书院", "法学院", "高等研究院", 
  "工程物理系", "公共管理学院", "国际与地区研究院", "国家卓越工程师学院", "航空发动机研究院", "航天航空学院", "核能与新能源技术研究院", 
  "化学工程系", "环境学院", "机械工程系", "精密仪器系", "能源与动力工程系", "车辆与运载学院", "工业工程系", "基础工业训练中心", "建筑学院", 
  "交叉信息研究院", "教育学院", "经济管理学院", "数学科学系", "物理系", "化学系", "地球系统科学系", "系统科学系", "天文系", "马克思主义学院", 
  "美术学院", "全球创新学院", "求真书院", "人工智能学院", "人文学院", "日新书院", "社会科学学院", "深圳国际研究生院", "生命科学学院", 
  "生物医学交叉研究院", "数学科学中心", "数学基础教学中心", "水木书院", "苏世民书院", "体育部", "统计与数据科学系", "土木工程系", 
  "水利水电工程系", "建设管理系", "探微书院", "碳中和研究院", "外国语言文学系", "万科公共卫生与健康学院", "未来实验室", "五道口金融学院", 
  "未央书院", "为先书院", "无穹书院", "心理与认知科学系", "新闻与传播学院", "新雅书院", "电子工程系", "计算机科学与技术系", "自动化系", 
  "集成电路学院", "网络科学与网络空间研究院", "软件学院", "信息国家研究中心", "行健书院", "秀钟书院", "医学院", "基础医学院", "药学院", 
  "临床医学院（北京清华长庚医院）", "生物医学工程学院", "医疗管理学院", "艺术教育中心", "语言教学中心", "智能产业研究院", "致理书院", 
  "至善书院", "紫荆书院", "自强书院"
];

const MATCH_QUESTIONS = [
  { id: 'q1', type: 'multi-other', title: '1. 你的属性（可多选）', options: ['1', '0', 's', 'm', '0.5', '不sm', '不10', 'side', '其他'] },
  { id: 'q2', type: 'multi-other', title: '2. 希望匹配到的对方的属性（可多选）', options: ['1', '0', 's', 'm', '0.5', '不sm', '不10', 'side', '其他'] },
  { id: 'q3', type: 'select', title: '3. 希望匹配到的对方的年龄', options: ['不限', '同级/同龄', '学长(大1-3岁)', '学弟(小1-3岁)', '更成熟(大3岁以上)'] },
  { id: 'q4', type: 'multi', title: '4. 希望匹配到的对方的专业（可多选）', options: ["不限", ...MAJOR_OPTIONS] },
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
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState('');
  const [isWaitVerify, setIsWaitVerify] = useState(false);

  const [activeTab, setActiveTab] = useState('discover'); 
  const [currentView, setCurrentView] = useState('main'); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [showMatchAnim, setShowMatchAnim] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [userLoc, setUserLoc] = useState([40.0000, 116.3265]); 
  const [isMapLoaded, setIsMapLoaded] = useState(false); 
  const mapContainerRef = useRef(null);

  const [toastMsg, setToastMsg] = useState('');
  const [viewedProfile, setViewedProfile] = useState(null); 

  const [currentUser, setCurrentUser] = useState(null);
  const [realUsers, setRealUsers] = useState([]);

  // 聊天与群组状态
  const [currentChatUser, setCurrentChatUser] = useState(null); 
  const [currentChatGroup, setCurrentChatGroup] = useState(null); 
  const [allMessages, setAllMessages] = useState([]); 
  const [allRequests, setAllRequests] = useState([]); 
  const [allGroups, setAllGroups] = useState([]); 
  
  const [inputText, setInputText] = useState(''); 
  const chatEndRef = useRef(null); 

  // 群组管理 UI 状态
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [showGroupSettings, setShowGroupSettings] = useState(false);

  const [userProfile, setUserProfile] = useState({
    name: '清华学子', gender: '男', age: '20', major: '计算机科学与技术系',
    grade: '大二', height: '178', weight: '65', tagMode: ['side'], customTag: '', pinnedChats: []
  });
  const [qaAnswers, setQaAnswers] = useState({});
  const [isQaPublic, setIsQaPublic] = useState(true);

  const answeredCount = MATCH_QUESTIONS.filter(q => {
    const ans = qaAnswers[q.id];
    return Array.isArray(ans) ? ans.length > 0 : (ans !== undefined && ans !== '');
  }).length;
  const progressPercent = Math.round((answeredCount / MATCH_QUESTIONS.length) * 100);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);

  // ----------------------------------------------------
  // 红点状态计算与消息已读处理
  // ----------------------------------------------------
  const hasUnread = allMessages.some(m => m.receiverId === currentUser?.uid && !m.read) || 
                    allRequests.some(r => r.receiverId === currentUser?.uid && r.status === 'pending');

  useEffect(() => {
    if ((currentChatUser || currentChatGroup) && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages, currentChatUser, currentChatGroup]);

  // 当进入聊天界面时，将发给自己的私聊消息标记为已读
  useEffect(() => {
    if (currentChatUser && currentUser && db) {
      const chatId = [String(currentUser.uid), String(currentChatUser.id)].sort().join('_');
      const unreadMsgs = allMessages.filter(m => m.chatId === chatId && m.receiverId === currentUser.uid && !m.read);
      unreadMsgs.forEach(m => {
        updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'messages', m.id), { read: true }).catch(console.error);
      });
    }
  }, [currentChatUser, allMessages, currentUser, db]);

  // ----------------------------------------------------
  // 社交链计算：拉黑与取关
  // ----------------------------------------------------
  const blockedUids = new Set();
  allRequests.forEach(r => {
      if (r.type === 'block') {
          if (r.senderId === currentUser?.uid) blockedUids.add(r.receiverId);
          if (r.receiverId === currentUser?.uid) blockedUids.add(r.senderId);
      }
  });

  const displayProfiles = realUsers.filter(p => !blockedUids.has(p.id));

  const unfriendedUids = new Set();
  displayProfiles.forEach(p => {
      const reqs = allRequests.filter(r => ['add_friend', 'like', 'unfriend'].includes(r.type) && 
        ((r.senderId === currentUser?.uid && r.receiverId === p.id) || (r.senderId === p.id && r.receiverId === currentUser?.uid))
      ).sort((a,b) => b.timestamp - a.timestamp);
      if (reqs.length > 0 && reqs[0].type === 'unfriend') {
          unfriendedUids.add(p.id);
      }
  });

  // 全局通知系统
  const prevReqsRef = useRef();
  useEffect(() => {
    if (!currentUser || allRequests.length === 0) return;
    const prevReqs = prevReqsRef.current;
    if (prevReqs) {
      allRequests.forEach(req => {
        const oldReq = prevReqs.find(r => r.id === req.id);
        if (oldReq && oldReq.status !== req.status && req.senderId === currentUser.uid) {
           if (req.status === 'rejected') {
              if (req.type === 'like') showToast('对方拒绝了你的关注申请');
              else showToast('对方拒绝了你的申请');
           } else if (req.status === 'accepted') {
              if (req.type === 'like') showToast('对方通过了你的关注申请，快去聊天吧！');
              else if (req.type === 'view_qa') showToast('对方已同意你查看TA的匹配问卷！');
              else showToast('对方已同意你的好友申请！');
           }
        }
      });
    }
    prevReqsRef.current = allRequests;
  }, [allRequests, currentUser]);

  // ----------------------------------------------------
  // 地图脚本加载
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
    } catch (err) { console.error(err); }
  }, []);

  // ----------------------------------------------------
  // Firebase 监听服务
  // ----------------------------------------------------
  useEffect(() => {
    if (!auth) return;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => { setCurrentUser(user); });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser || !db) return;
    try {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'profiles'));
      const unsubscribeDB = onSnapshot(q, (snapshot) => {
        const profiles = [];
        snapshot.forEach((docSnap) => { if (docSnap.id !== currentUser.uid) profiles.push({ id: docSnap.id, ...docSnap.data() }); });
        setRealUsers(profiles);
      }, console.error);
      return () => unsubscribeDB();
    } catch (err) { console.error(err); }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !db) return;
    try {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'messages'));
      const unsubscribeMsg = onSnapshot(q, (snapshot) => {
        const msgs = [];
        snapshot.forEach((docSnap) => msgs.push({ id: docSnap.id, ...docSnap.data() }));
        msgs.sort((a, b) => a.timestamp - b.timestamp);
        setAllMessages(msgs);
      }, console.error);
      return () => unsubscribeMsg();
    } catch (err) { console.error(err); }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !db) return;
    try {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'requests'));
      const unsubscribeReq = onSnapshot(q, (snapshot) => {
        const reqs = [];
        snapshot.forEach((docSnap) => reqs.push({ id: docSnap.id, ...docSnap.data() }));
        setAllRequests(reqs);
      }, console.error);
      return () => unsubscribeReq();
    } catch (err) { console.error(err); }
  }, [currentUser]);

  // 新增：监听群组数据
  useEffect(() => {
    if (!currentUser || !db) return;
    try {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'groups'));
      const unsubscribeGroup = onSnapshot(q, (snapshot) => {
        const grps = [];
        snapshot.forEach((docSnap) => grps.push({ id: docSnap.id, ...docSnap.data() }));
        setAllGroups(grps);
      }, console.error);
      return () => unsubscribeGroup();
    } catch (err) { console.error(err); }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !db) return;
    const fetchMyProfile = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const myData = docSnap.data();
          setUserProfile(prev => ({ ...prev, ...myData, pinnedChats: myData.pinnedChats || [] }));
          if (myData.answers) setQaAnswers(myData.answers); 
          if (myData.name) setTempName(myData.name); 
        }
      } catch (error) { console.error(error); }
    };
    fetchMyProfile();
  }, [currentUser, db]);

  // ----------------------------------------------------
  // 核心交互工具逻辑
  // ----------------------------------------------------
  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2500); };
  const checkTsinghuaEmail = (em) => em.endsWith('@mails.tsinghua.edu.cn') || em.endsWith('@tsinghua.edu.cn');

  const handleLogout = async () => {
    try { if (auth) await signOut(auth); } catch (error) { console.error(error); }
    setIsAuthenticated(false); setAuthMode('login'); setEmail(''); setPassword(''); setUsername('');
    setUserProfile({ name: '清华学子', gender: '男', age: '20', major: '计算机科学与技术系', grade: '大二', height: '178', weight: '65', tagMode: ['side'], customTag: '', pinnedChats: [] });
    setQaAnswers({}); setCurrentChatUser(null); setCurrentChatGroup(null); setViewedProfile(null);
  };

  const handleRegister = async () => {
    if (!username.trim()) return setAuthError('请填写用户名');
    if (!checkTsinghuaEmail(email)) return setAuthError('必须使用清华大学教育邮箱');
    if (password.length < 6) return setAuthError('密码至少需要 6 位');
    setAuthError('');
    try {
      showToast('正在验证用户名...');
      const profilesSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'profiles'));
      let isNameTaken = false;
      profilesSnap.forEach(doc => { if (doc.data().name === username.trim()) isNameTaken = true; });
      if (isNameTaken) return setAuthError('该用户名已被抢先使用，请换一个');

      showToast('正在为您注册...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      
      if (db) {
        const colors = ['from-blue-400 to-purple-500', 'from-pink-400 to-rose-500', 'from-emerald-400 to-teal-500', 'from-orange-400 to-amber-500', 'from-indigo-400 to-cyan-500'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', userCredential.user.uid), {
          name: username.trim(), email: email, color: randomColor, major: "计算机科学与技术系", isPublic: false, pinnedChats: []
        }, { merge: true });
      }
      setIsWaitVerify(true);
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
      if (!userCredential.user.emailVerified) return setAuthError('该邮箱尚未激活，请前往清华邮箱点击激活链接');
      setIsAuthenticated(true);
    } catch (error) {
      if (error.code === 'auth/invalid-credential') setAuthError('邮箱或密码错误');
      else setAuthError('登录失败：' + error.message);
    }
  };

  const handleSaveToCloud = async () => {
    if (!currentUser || !db) return showToast('未登录或云数据库未连接');
    const saveWithLocation = async (baseLat, baseLng) => {
      const finalLat = baseLat + (Math.random() - 0.5) * 0.005;
      const finalLng = baseLng + (Math.random() - 0.5) * 0.005;
      try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', currentUser.uid), {
          name: userProfile.name, age: userProfile.age, major: userProfile.major, location: "紫荆校园", 
          latitude: finalLat, longitude: finalLng, height: userProfile.height, weight: userProfile.weight,
          tagMode: userProfile.tagMode, customTag: userProfile.customTag || '', matchScore: Math.floor(Math.random() * 15) + 85, 
          isPublic: isQaPublic, answers: qaAnswers, updatedAt: new Date().toISOString()
        }, { merge: true });
        showToast('资料保存成功！已同步至云端匹配大厅');
      } catch (error) { showToast('保存失败'); }
    };
    showToast('正在获取定位并保存...');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => saveWithLocation(position.coords.latitude, position.coords.longitude),
        () => saveWithLocation(40.002, 116.326),
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else saveWithLocation(40.002, 116.326);
  };

  const handleSaveProfileInfo = async () => {
    if (!currentUser || !db) { setCurrentView('main'); return; }
    try {
      showToast('正在保存个人资料...');
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', currentUser.uid), {
        gender: userProfile.gender || '男', age: userProfile.age || '20', major: userProfile.major || '未选择',
        height: userProfile.height || '', weight: userProfile.weight || '', tagMode: userProfile.tagMode || [],
        customTag: userProfile.customTag || '', updatedAt: new Date().toISOString()
      }, { merge: true });
      showToast('资料保存成功');
      setCurrentView('main');
    } catch (error) { showToast('保存失败'); }
  };

  // 请求系统发送引擎
  const handleSendRequest = async (targetId, type) => {
    if (!currentUser || !db) return;
    if (type === 'view_qa') {
      const targetProfile = displayProfiles.find(p => p.id === targetId);
      if (!targetProfile || !targetProfile.answers || Object.keys(targetProfile.answers).length === 0) {
        return showToast("对方尚未填写匹配问卷");
      }
    }
    const existingReq = allRequests.find(r => r.senderId === currentUser.uid && r.receiverId === targetId && r.type === type);
    if (existingReq) {
      if (existingReq.status === 'pending') return showToast("已发送过申请，正在等待对方同意");
      if (existingReq.status === 'accepted') return showToast(type === 'view_qa' ? "对方已对你公开问卷" : "你们已经是好友了");
    }
    try {
      await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'requests')), {
        senderId: currentUser.uid, receiverId: targetId, type: type, status: 'pending', timestamp: Date.now()
      });
      if (type === 'view_qa') showToast("已向对方发送问卷查看申请");
      else if (type === 'add_friend') showToast("已向对方发送好友申请");
      else if (type === 'like') showToast("已发送关注申请，等待对方回应");
    } catch (error) { showToast("申请发送失败，请检查网络"); }
  };

  // 拉黑与取关处理引擎
  const handleBlockUser = async (targetId) => {
    if (!currentUser || !db) return;
    try {
        await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'requests')), { senderId: currentUser.uid, receiverId: targetId, type: 'block', status: 'completed', timestamp: Date.now() });
        showToast("已拉黑该用户，不再为您显示");
        setViewedProfile(null);
        setCurrentChatUser(null);
    } catch(e) { showToast("拉黑失败"); }
  };

  const handleUnfriendUser = async (targetId) => {
    if (!currentUser || !db) return;
    try {
        await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'requests')), { senderId: currentUser.uid, receiverId: targetId, type: 'unfriend', status: 'completed', timestamp: Date.now() });
        showToast("已解除好友关系/取消关注");
        setViewedProfile(null);
        setCurrentChatUser(null);
    } catch(e) { showToast("操作失败"); }
  };

  const handleProcessRequest = async (reqId, newStatus) => {
    if (!db) return;
    try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'requests', reqId), { status: newStatus }, { merge: true }); } 
    catch (e) { showToast("操作失败"); }
  };

  const handleLike = async () => {
    if (currentIndex >= displayProfiles.length) return;
    const targetId = displayProfiles[currentIndex].id;
    
    const didTargetReject = allRequests.some(r => (r.senderId === targetId && r.receiverId === currentUser.uid && r.type === 'pass') || (r.senderId === currentUser.uid && r.receiverId === targetId && r.status === 'rejected'));
    if (didTargetReject) {
        showToast('对方拒绝了你的关注申请');
        setCurrentIndex(prev => prev + 1);
        return;
    }

    const targetLikeReq = allRequests.find(r => r.senderId === targetId && r.receiverId === currentUser.uid && r.type === 'like');
    if (targetLikeReq && targetLikeReq.status === 'pending') {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'requests', targetLikeReq.id), { status: 'accepted' }, { merge: true });
        setShowMatchAnim(true);
        setTimeout(() => { setShowMatchAnim(false); setCurrentIndex(prev => prev + 1); }, 1500);
        return;
    } else if (targetLikeReq && targetLikeReq.status === 'accepted') {
        setCurrentIndex(prev => prev + 1);
        return;
    }
    await handleSendRequest(targetId, 'like');
    setCurrentIndex(prev => prev + 1);
  };

  const handlePass = async () => {
    if (currentIndex >= displayProfiles.length) return;
    const targetId = displayProfiles[currentIndex].id;
    try {
        await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'requests')), { senderId: currentUser.uid, receiverId: targetId, type: 'pass', status: 'completed', timestamp: Date.now() });
        setCurrentIndex(prev => prev + 1);
    } catch(e) { setCurrentIndex(prev => prev + 1); }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentUser || !db) return;
    if (!currentChatUser && !currentChatGroup) return;

    const text = inputText.trim();
    setInputText(''); 
    
    try {
      const msgRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'));
      if (currentChatGroup) {
        await setDoc(msgRef, {
          chatId: currentChatGroup.id, text, senderId: currentUser.uid, receiverId: 'group', timestamp: Date.now()
        });
      } else {
        const chatId = [String(currentUser.uid), String(currentChatUser.id)].sort().join('_');
        await setDoc(msgRef, { chatId, text, senderId: currentUser.uid, receiverId: currentChatUser.id, timestamp: Date.now(), read: false });
      }
    } catch (error) { showToast('发送失败'); }
  };

  const toggleQaArrayItem = (id, item, limit = null) => {
    setQaAnswers(prev => {
      const current = prev[id] || [];
      if (current.includes(item)) return { ...prev, [id]: current.filter(i => i !== item) };
      if (limit && current.length >= limit) { showToast(`该项最多只能选择 ${limit} 项`); return prev; }
      return { ...prev, [id]: [...current, item] };
    });
  };
  const updateQaAnswer = (id, val) => setQaAnswers(prev => ({ ...prev, [id]: val }));

  // ----------------------------------------------------
  // 群聊管理逻辑
  // ----------------------------------------------------
  const handleCreateGroup = async () => {
    if (selectedGroupMembers.length === 0) return showToast("请至少选择一位好友");
    try {
      const newGroupId = `group_${Date.now()}`;
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'groups', newGroupId), {
        name: groupNameInput || '新建群聊',
        ownerId: currentUser.uid,
        adminIds: [],
        memberIds: [currentUser.uid, ...selectedGroupMembers],
        createdAt: Date.now()
      });
      setIsCreatingGroup(false);
      setSelectedGroupMembers([]);
      setGroupNameInput('');
      showToast('群聊创建成功！');
    } catch (e) { showToast('建群失败'); }
  };

  const handleTogglePin = async (chatId) => {
    const currentPinned = userProfile.pinnedChats || [];
    const newPinned = currentPinned.includes(chatId) ? currentPinned.filter(id => id !== chatId) : [...currentPinned, chatId];
    setUserProfile(prev => ({ ...prev, pinnedChats: newPinned }));
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', currentUser.uid), { pinnedChats: newPinned }, { merge: true });
      showToast(newPinned.includes(chatId) ? '已置顶' : '已取消置顶');
    } catch (e) { showToast('操作失败'); }
  };

  const handleGroupAction = async (action, targetId = null) => {
    if (!currentChatGroup || !db) return;
    const groupRef = doc(db, 'artifacts', appId, 'public', 'data', 'groups', currentChatGroup.id);
    try {
      if (action === 'leave') {
        const newMembers = currentChatGroup.memberIds.filter(id => id !== currentUser.uid);
        await setDoc(groupRef, { memberIds: newMembers }, { merge: true });
        setCurrentChatGroup(null);
        setShowGroupSettings(false);
        showToast('已退出群聊');
      } else if (action === 'set_admin') {
        await setDoc(groupRef, { adminIds: [...(currentChatGroup.adminIds || []), targetId] }, { merge: true });
        showToast('已设为管理员');
      } else if (action === 'remove_admin') {
        await setDoc(groupRef, { adminIds: (currentChatGroup.adminIds || []).filter(id => id !== targetId) }, { merge: true });
        showToast('已取消管理员');
      } else if (action === 'transfer_owner') {
        await setDoc(groupRef, { ownerId: targetId }, { merge: true });
        showToast('已转移群主');
      }
    } catch (e) { showToast('操作失败'); }
  };

  // ----------------------------------------------------
  // 地图交互渲染钩子
  // ----------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'nearby' || !locationEnabled || !isMapLoaded || !mapContainerRef.current) return;
    const container = mapContainerRef.current;
    if (container._leaflet_id) return; 
    let map;
    try {
      map = window.L.map(container, { zoomControl: false, attributionControl: false }).setView(userLoc, 15);
      window.L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', { subdomains: ['1', '2', '3', '4'], maxZoom: 18, minZoom: 3, attribution: '© 高德地图' }).addTo(map);

      const pNameInitialMe = userProfile.name ? userProfile.name[0] : '?';
      const myIconHtml = `<div class="relative flex items-center justify-center w-14 h-14 cursor-pointer" id="my-map-marker"><div class="absolute w-full h-full bg-purple-500 rounded-full animate-ping opacity-50"></div><div class="absolute w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full shadow-2xl border-2 border-white z-10 flex items-center justify-center overflow-hidden"><span class="text-2xl font-black text-white">${pNameInitialMe}</span></div></div>`;
      window.L.marker(userLoc, { icon: window.L.divIcon({ html: myIconHtml, iconSize: [56, 56], iconAnchor: [28, 28] }), zIndexOffset: 1000 }).on('click', () => setViewedProfile({id: currentUser.uid, ...userProfile})).addTo(map);
      
      displayProfiles.forEach((profile, index) => {
        const idNum = String(profile.id).charCodeAt(0) || index;
        const latOffset = (Math.sin(idNum * 123) * 0.012);
        const lngOffset = (Math.cos(idNum * 321) * 0.012);
        const pNameInitial = profile.name ? profile.name[0] : '?';
        const themeColor = profile.color || 'from-blue-400 to-blue-600';
        const avatarHtml = `<span class="text-xl font-black text-white shadow-sm">${pNameInitial}</span>`;
        const iconHtml = `<div class="relative group cursor-pointer flex flex-col items-center"><div class="w-12 h-12 rounded-full bg-gradient-to-br ${themeColor} p-0.5 shadow-md transform transition-transform group-hover:scale-125 z-10"><div class="w-full h-full rounded-full flex items-center justify-center overflow-hidden border border-white/50">${avatarHtml}</div><div class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-sm"></div></div><div class="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold text-gray-800 whitespace-nowrap z-20 pointer-events-none flex items-center transform -translate-y-1">${profile.name || '?'} <span class="text-pink-500 ml-1.5 flex items-center bg-pink-50 px-1.5 py-0.5 rounded-md">${profile.matchScore || 90}%</span></div></div>`;
        window.L.marker([userLoc[0] + latOffset, userLoc[1] + lngOffset], { icon: window.L.divIcon({ html: iconHtml, iconSize: [48, 48], iconAnchor: [24, 24] }) }).on('click', () => setViewedProfile(profile)).addTo(map);
      });
    } catch (err) { console.error(err); }
    return () => { if (map) map.remove(); };
  }, [activeTab, locationEnabled, isMapLoaded, displayProfiles, userProfile.name, userLoc]);

  // ================= 模块渲染逻辑 =================

  const renderAuth = () => {
    if (isWaitVerify) {
      return (
        <div className="w-full h-full flex flex-col items-center px-8 pt-32 bg-white text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"><Mail className="w-10 h-10 text-green-600" /></div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">验证邮件已发送</h2>
          <p className="text-gray-500 mb-8">我们已向 <span className="font-bold text-purple-600">{email}</span> 发送了一封激活邮件。请前往邮箱点击链接完成验证。</p>
          <button onClick={() => { setIsWaitVerify(false); setAuthMode('login'); }} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold active:scale-95 transition-all">我已验证，去登录</button>
        </div>
      );
    }
    return (
      <div className="w-full h-full flex flex-col px-8 pt-16 bg-white overflow-y-auto pb-10">
        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center transform rotate-12 mb-8 shadow-lg shadow-purple-500/30"><span className="text-white font-black text-2xl -rotate-12">THU</span></div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">{authMode === 'login' ? '欢迎回来' : '注册 Purpled'}</h1>
        <p className="text-gray-500 mb-8">专属于清华的男生交友社区</p>
        <div className="space-y-4">
          {authMode === 'register' && (<div><label className="block text-sm font-medium text-gray-700 mb-1">用户名</label><input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setAuthError(''); }} className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all" /></div>)}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">清华邮箱</label><input type="email" value={email} onChange={(e) => { setEmail(e.target.value.toLowerCase()); setAuthError(''); }} className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all" placeholder="@mails.tsinghua.edu.cn" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">密码</label><input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setAuthError(''); }} className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all" placeholder={authMode === 'register' ? "设置一个至少6位的密码" : "输入密码"} /></div>
          {authError && <p className="text-sm text-red-500 font-medium">{authError}</p>}
          <button onClick={authMode === 'login' ? handleLogin : handleRegister} className="w-full py-4 mt-2 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98]">{authMode === 'login' ? '登录' : '同意协议并注册'}</button>
          <div className="text-center mt-6"><button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-sm text-gray-500 font-medium hover:text-purple-600 transition-colors">{authMode === 'login' ? '没有账号？点击注册' : '已有账号？直接登录'}</button></div>
        </div>
      </div>
    );
  };

  const renderMatch = () => {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-white px-4 py-4 border-b border-gray-100 z-10 sticky top-0 shadow-sm text-center">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center"><ClipboardEdit className="w-6 h-6 mr-2 text-purple-600" />灵魂契合度问卷</h2>
            <span className="text-sm font-bold text-purple-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div></div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 pb-32">
          {MATCH_QUESTIONS.map((q, index) => {
            const currentAns = qaAnswers[q.id];
            return (
              <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
                <h3 className="font-bold text-gray-800 mb-3 leading-relaxed">{q.title}</h3>
                {q.type === 'text' && <input type="text" value={currentAns || ''} onChange={(e) => updateQaAnswer(q.id, e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder={q.placeholder} />}
                {q.type === 'select' && <select value={currentAns || ''} onChange={(e) => updateQaAnswer(q.id, e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"><option value="" disabled>请选择...</option>{q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>}
                {q.type === 'single' && <div className="flex flex-col space-y-2">{q.options.map(opt => <button key={opt} onClick={() => updateQaAnswer(q.id, opt)} className={`text-left px-4 py-3 rounded-xl text-sm transition-all border ${currentAns === opt ? 'bg-purple-50 border-purple-300 text-purple-700 font-bold' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}>{opt}</button>)}</div>}
                {q.type === 'multi' && <div className="flex flex-wrap gap-2">{q.options.map(opt => { const isArrAns = Array.isArray(currentAns) ? currentAns : []; const isSelected = isArrAns.includes(opt); return (<button key={opt} onClick={() => toggleQaArrayItem(q.id, opt, null)} className={`px-4 py-2 rounded-full text-sm border ${isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}>{opt}</button>)})}</div>}
                {(q.type === 'multi-limit' || q.type === 'multi-other') && (<div><div className="flex flex-wrap gap-2">{q.options.map(opt => { const isArrAns = Array.isArray(currentAns) ? currentAns : []; const isSelected = isArrAns.includes(opt); return (<button key={opt} onClick={() => toggleQaArrayItem(q.id, opt, q.limit)} className={`px-4 py-2 rounded-full text-sm border ${isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}>{opt}</button>)})}</div>{q.type === 'multi-other' && (Array.isArray(currentAns) && currentAns.includes('其他')) && (<div className="mt-3"><input type="text" value={qaAnswers[`${q.id}_other`] || ''} onChange={(e) => updateQaAnswer(`${q.id}_other`, e.target.value)} className="w-full bg-purple-50/50 border border-purple-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="请输入具体的内容..." /></div>)}</div>)}
              </div>
            );
          })}
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"><div className="flex items-center space-x-3"><div className={`p-2 rounded-full ${isQaPublic ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{isQaPublic ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}</div><div><p className="font-bold text-gray-900 text-sm">公开问卷资料</p><p className="text-xs text-gray-500">允许喜欢的人直接查看你的资料</p></div></div><button onClick={() => setIsQaPublic(!isQaPublic)} className={`w-12 h-6 rounded-full relative transition-colors ${isQaPublic ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${isQaPublic ? 'left-6' : 'left-0.5'}`}></div></button></div>
            <button onClick={handleSaveToCloud} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform">保存并同步至云端大厅</button>
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
    const themeColor = profile.color || 'from-purple-500 to-pink-500';
    return (
      <div className="relative w-full h-full flex flex-col pt-4 pb-2">
        <div onClick={() => setViewedProfile(profile)} className="flex-1 w-full bg-white rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col relative border border-gray-100 cursor-pointer group p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-pink-50 px-3 py-1.5 rounded-full text-xs font-black flex items-center text-pink-600 border border-pink-100"><Percent className="w-3 h-3 mr-1" /> 契合度 {profile.matchScore || 90}%</div>
            {profile.isPublic ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-orange-400" />}
          </div>
          <div className="flex-1 flex flex-col justify-center items-center text-center relative mt-4">
             <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden"><span className="text-[18rem] font-black leading-none">{profile.name?.[0]}</span></div>
             <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${themeColor} flex items-center justify-center mb-6 shadow-lg transform -rotate-3`}><span className="text-4xl font-black text-white">{profile.name?.[0]}</span></div>
             <h2 className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${themeColor} tracking-tight mb-2`}>{profile.name}</h2>
             <span className="text-xl font-bold text-gray-400">{profile.age || '20'} 岁</span>
          </div>
          <div className="mt-auto pt-6 border-t border-gray-50 flex flex-col space-y-3 relative z-10">
            <div className="flex items-center text-gray-600 font-medium text-sm"><div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center mr-3"><BookOpen className="w-4 h-4 text-gray-400" /></div>{profile.major || '未选择'}</div>
            <div className="flex items-center text-gray-600 font-medium text-sm"><div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center mr-3"><MapPin className="w-4 h-4 text-gray-400" /></div>{profile.location || '紫荆校园'}</div>
            <div className="flex flex-wrap gap-2 pt-2">
              {(() => {
                const tagsToDisplay = (profile.tagMode || []).filter(t => t !== '其他');
                if ((profile.tagMode || []).includes('其他') && profile.customTag) tagsToDisplay.push(profile.customTag);
                if (tagsToDisplay.length === 0) return <span className="text-xs text-gray-400">未设置属性标签</span>;
                return tagsToDisplay.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl text-xs font-bold border border-purple-100">{tag}</span>
                ));
              })()}
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center space-x-10 py-5">
          <button onClick={handlePass} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 hover:text-red-500 active:scale-90 transition-all"><X className="w-6 h-6" /></button>
          <button onClick={handleLike} className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl text-white active:scale-90 transition-all"><Heart className="w-8 h-8 fill-current" /></button>
        </div>
        {showMatchAnim && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-3xl"><h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-400 mb-6 italic">It's a Match!</h2><p className="text-white">你和 {profile.name} 互相喜欢了对方</p></div>}
      </div>
    );
  };

  const renderProfileModal = () => {
    if (!viewedProfile) return null;
    const pName = viewedProfile.name || '?';
    const themeColor = viewedProfile.color || 'from-purple-500 to-pink-500';
    
    const hasAnswers = viewedProfile.answers && Object.keys(viewedProfile.answers).length > 0;
    const hasQaPermission = viewedProfile.id === currentUser?.uid || viewedProfile.isPublic || allRequests.some(r => r.senderId === currentUser?.uid && r.receiverId === viewedProfile.id && r.type === 'view_qa' && r.status === 'accepted');
    const isFriend = viewedProfile.id === currentUser?.uid || (!unfriendedUids.has(viewedProfile.id) && allRequests.some(r => (r.type === 'add_friend' || r.type === 'like') && r.status === 'accepted' && ((r.senderId === currentUser?.uid && r.receiverId === viewedProfile.id) || (r.senderId === viewedProfile.id && r.receiverId === currentUser?.uid))));

    return (
      <div className="absolute inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden">
        <div className={`relative h-64 bg-gradient-to-br ${themeColor} flex-shrink-0 flex items-center justify-center`}>
           <span className="text-[12rem] font-black text-white opacity-10 absolute">{pName[0]}</span>
           <button onClick={() => setViewedProfile(null)} className="absolute top-6 left-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white"><ChevronLeft className="w-6 h-6" /></button>
           <div className="absolute bottom-4 left-4 text-white z-10"><h2 className="text-3xl font-black">{pName}</h2><p className="opacity-90 font-medium">{viewedProfile.major || '未选择'}</p></div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 pb-20">
          <div className="bg-white p-5 rounded-2xl shadow-sm space-y-5">
             <h3 className="font-black text-xl text-gray-900 border-b pb-3 flex items-center"><ClipboardEdit className="w-5 h-5 mr-2 text-purple-600" /> 灵魂档案</h3>
             
             {!hasAnswers ? (
               <div className="flex flex-col items-center justify-center py-8 text-gray-400"><ClipboardEdit className="w-12 h-12 mb-3 opacity-20" /><p className="text-sm">对方尚未填写匹配问卷</p></div>
             ) : !hasQaPermission ? (
               <div className="flex flex-col items-center justify-center py-8 text-gray-400"><Lock className="w-12 h-12 mb-3 opacity-20" /><p className="text-sm mb-5">对方未公开问卷，需申请后查看</p><button onClick={() => handleSendRequest(viewedProfile.id, 'view_qa')} className="bg-purple-100 text-purple-600 hover:bg-purple-200 px-6 py-2.5 rounded-full font-bold text-sm active:scale-95 transition-all">申请查看匹配问卷</button></div>
             ) : (
               MATCH_QUESTIONS.map(q => {
                 const ans = viewedProfile.answers?.[q.id];
                 if (ans === undefined || ans === null || (Array.isArray(ans) && ans.length === 0) || ans === '') return null;
                 let displayAns = Array.isArray(ans) ? ans.join('、') : ans;
                 return (<div key={q.id} className="flex flex-col space-y-1"><span className="text-sm font-bold text-gray-500">{q.title.replace(/^\d+\.\s*/, '')}</span><span className="text-base text-gray-900 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">{displayAns}</span></div>);
               })
             )}
          </div>

          {viewedProfile.id !== currentUser?.uid && (
            <div className="flex flex-col space-y-3 mt-8 border-t border-gray-100 pt-5">
              {isFriend ? (
                <button onClick={() => handleUnfriendUser(viewedProfile.id)} className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold flex items-center justify-center active:scale-95 transition-all">
                   取消关注 / 解除好友
                </button>
              ) : (
                <button onClick={() => handleSendRequest(viewedProfile.id, 'add_friend')} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold flex items-center justify-center shadow-lg active:scale-95 transition-all">
                   <User className="w-5 h-5 mr-2"/> 申请添加对方好友
                </button>
              )}
              <button onClick={() => handleBlockUser(viewedProfile.id)} className="w-full py-4 bg-red-50 text-red-500 hover:bg-red-100 rounded-2xl font-bold flex items-center justify-center active:scale-95 transition-all">
                 拉黑此用户
              </button>
            </div>
          )}
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
          <button onClick={() => { setIsLocating(true); if ("geolocation" in navigator) { navigator.geolocation.getCurrentPosition((position) => { setUserLoc([position.coords.latitude, position.coords.longitude]); setIsLocating(false); setLocationEnabled(true); showToast('成功获取您的精确位置！'); }, (error) => { setUserLoc([40.0000, 116.3265]); setIsLocating(false); setLocationEnabled(true); showToast('定位受限，已启用清华默认坐标'); }, { timeout: 5000, enableHighAccuracy: true }); } else { setUserLoc([40.0000, 116.3265]); setIsLocating(false); setLocationEnabled(true); showToast('环境不支持定位'); } }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg active:scale-95" disabled={isLocating}>{isLocating ? "正在搜索信号..." : "开启真实地图"}</button>
        </div>
      );
    }
    return (
      <div className="relative w-full h-full bg-[#f4f7f6] overflow-hidden rounded-3xl border border-gray-100 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0 outline-none"></div>
        <div className="absolute right-4 bottom-4 z-20"><button onClick={() => showToast('雷达扫描已更新')} className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-blue-600 border border-blue-50"><Navigation className="w-6 h-6" /></button></div>
      </div>
    );
  };

  const renderCreateGroupModal = () => {
    if (!isCreatingGroup) return null;
    
    // 获取我的好友列表 (基于互相关注或相互添加好友)
    const acceptedFriendIds = allRequests
      .filter(r => (r.type === 'add_friend' || r.type === 'like') && r.status === 'accepted' && (r.senderId === currentUser?.uid || r.receiverId === currentUser?.uid))
      .map(r => r.senderId === currentUser?.uid ? String(r.receiverId) : String(r.senderId));
    
    const myFriends = displayProfiles.filter(p => !unfriendedUids.has(p.id) && acceptedFriendIds.includes(String(p.id)));

    return (
      <div className="absolute inset-0 bg-white z-40 flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <button onClick={() => { setIsCreatingGroup(false); setSelectedGroupMembers([]); setGroupNameInput(''); }} className="p-2 -ml-2 text-gray-600"><X className="w-6 h-6" /></button>
          <h2 className="text-lg font-bold text-gray-900">发起群聊</h2>
          <button onClick={handleCreateGroup} disabled={selectedGroupMembers.length === 0} className="text-purple-600 font-bold text-sm disabled:opacity-50">创建 ({selectedGroupMembers.length})</button>
        </div>
        <div className="p-4 bg-gray-50 border-b border-gray-100">
           <input type="text" value={groupNameInput} onChange={e => setGroupNameInput(e.target.value)} placeholder="给群聊起个名字 (选填)" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {myFriends.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400"><Users className="w-10 h-10 mb-2 opacity-20" /><p className="text-sm">暂无可拉入群聊的好友</p></div>
          ) : (
            myFriends.map(friend => {
              const isSelected = selectedGroupMembers.includes(friend.id);
              const themeColor = friend.color || 'from-blue-400 to-blue-600';
              return (
                <div key={friend.id} onClick={() => setSelectedGroupMembers(prev => isSelected ? prev.filter(id => id !== friend.id) : [...prev, friend.id])} className="flex items-center space-x-3 p-3 hover:bg-purple-50 rounded-2xl cursor-pointer">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 ${isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}`}>
                     {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${themeColor} flex items-center justify-center text-white font-black`}>{friend.name?.[0]}</div>
                  <span className="font-bold text-gray-900">{friend.name}</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    );
  };

  const renderGroupSettingsModal = () => {
    if (!showGroupSettings || !currentChatGroup) return null;
    
    // 动态从 allGroups 获取最新的群数据，以便实时刷新管理员等状态
    const activeGroup = allGroups.find(g => g.id === currentChatGroup.id) || currentChatGroup;
    const isOwner = activeGroup.ownerId === currentUser.uid;
    const isAdmin = isOwner || (activeGroup.adminIds || []).includes(currentUser.uid);
    const isPinned = (userProfile.pinnedChats || []).includes(activeGroup.id);

    return (
      <div className="absolute inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100 shadow-sm">
          <button onClick={() => setShowGroupSettings(false)} className="p-2 -ml-2 text-gray-600"><ChevronLeft className="w-6 h-6" /></button>
          <h2 className="text-lg font-bold text-gray-900">群聊设置</h2>
          <div className="w-8"></div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* 成员列表 */}
          <div className="bg-white p-4 mb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 mb-4">群成员 ({activeGroup.memberIds?.length || 0})</h3>
            <div className="grid grid-cols-5 gap-y-4">
              {(activeGroup.memberIds || []).map(uid => {
                 const isMemOwner = activeGroup.ownerId === uid;
                 const isMemAdmin = (activeGroup.adminIds || []).includes(uid);
                 const p = displayProfiles.find(x => x.id === uid) || (uid === currentUser.uid ? userProfile : {name: '未知用户', color: 'from-gray-300 to-gray-400'});
                 const themeColor = p.color || 'from-gray-400 to-gray-500';

                 return (
                   <div key={uid} className="flex flex-col items-center relative group">
                     <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${themeColor} flex items-center justify-center text-white font-black shadow-sm mb-1`}>
                       {p.name?.[0] || '?'}
                     </div>
                     <span className="text-[10px] text-gray-600 truncate w-14 text-center">{p.name}</span>
                     
                     {/* 身份徽章 */}
                     {isMemOwner && <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5"><Crown className="w-3 h-3 text-white" /></div>}
                     {!isMemOwner && isMemAdmin && <div className="absolute -top-1 -right-1 bg-blue-400 rounded-full p-0.5"><Shield className="w-3 h-3 text-white" /></div>}

                     {/* 群主操作菜单 (悬浮展示，实际移动端需点击弹出，此处简化为点击直接触发操作框) */}
                     {isOwner && uid !== currentUser.uid && (
                        <div className="mt-2 flex flex-col space-y-1 w-full px-1">
                          <button onClick={() => handleGroupAction(isMemAdmin ? 'remove_admin' : 'set_admin', uid)} className="text-[9px] bg-gray-100 text-gray-600 py-1 rounded">
                            {isMemAdmin ? '取消管理' : '设管理员'}
                          </button>
                          <button onClick={() => { if(window.confirm('确认转移群主？')) handleGroupAction('transfer_owner', uid); }} className="text-[9px] bg-red-50 text-red-500 py-1 rounded">
                            转群主
                          </button>
                        </div>
                     )}
                   </div>
                 );
              })}
            </div>
          </div>

          {/* 设置项 */}
          <div className="bg-white border-y border-gray-100 mb-6">
             <div onClick={() => handleTogglePin(activeGroup.id)} className="flex justify-between items-center px-5 py-4 border-b border-gray-50 cursor-pointer active:bg-gray-50">
                <span className="font-medium text-gray-900">置顶群聊</span>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${isPinned ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${isPinned ? 'left-6' : 'left-0.5'}`}></div></div>
             </div>
          </div>

          {/* 退出按钮 */}
          <div className="px-5">
             <button onClick={() => { if(window.confirm('确定退出群聊吗？')) handleGroupAction('leave'); }} className="w-full py-4 bg-white border border-red-100 text-red-500 hover:bg-red-50 rounded-2xl font-bold flex items-center justify-center active:scale-95 transition-all">
                <LogOut className="w-5 h-5 mr-2" /> 退出群聊
             </button>
             {isOwner && <p className="text-xs text-gray-400 text-center mt-3">提示：作为群主，退出前建议先移交群主身份哦</p>}
          </div>
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    // === 1对1聊天逻辑 ===
    const chattedUserIds = new Set(allMessages.filter(m => m.senderId === currentUser?.uid || m.receiverId === currentUser?.uid).map(m => m.senderId === currentUser?.uid ? String(m.receiverId) : String(m.senderId)));
    const acceptedFriendIds = allRequests.filter(r => (r.type === 'add_friend' || r.type === 'like') && r.status === 'accepted' && (r.senderId === currentUser?.uid || r.receiverId === currentUser?.uid)).map(r => r.senderId === currentUser?.uid ? String(r.receiverId) : String(r.senderId));
    const privateProfiles = displayProfiles.filter(p => !unfriendedUids.has(p.id) && (matches.some(m => m.id === p.id) || chattedUserIds.has(String(p.id)) || acceptedFriendIds.includes(String(p.id))));
    
    // === 群聊逻辑 ===
    const myGroups = allGroups.filter(g => (g.memberIds || []).includes(currentUser?.uid));

    // === 统一聊天列表项 ===
    let unifiedChatList = [];

    // 加入私聊
    privateProfiles.forEach(p => {
       const chatId = [String(currentUser?.uid), String(p.id)].sort().join('_'); 
       const msgs = allMessages.filter(m => m.chatId === chatId); 
       const lastMsgObj = msgs.length > 0 ? msgs[msgs.length - 1] : null;
       unifiedChatList.push({
          isGroup: false,
          target: p,
          chatId: chatId,
          lastTime: lastMsgObj ? lastMsgObj.timestamp : 0,
          lastText: lastMsgObj ? lastMsgObj.text : '现在可以开始聊天啦！',
          isUnread: lastMsgObj && lastMsgObj.receiverId === currentUser?.uid && !lastMsgObj.read,
          themeColor: p.color || 'from-blue-400 to-blue-600',
          avatarText: p.name?.[0] || '?',
          title: p.name || '同学'
       });
    });

    // 加入群聊
    myGroups.forEach(g => {
       const msgs = allMessages.filter(m => m.chatId === g.id); 
       const lastMsgObj = msgs.length > 0 ? msgs[msgs.length - 1] : null;
       let lastText = '群聊已创建';
       if (lastMsgObj) {
           const senderName = lastMsgObj.senderId === currentUser.uid ? '你' : (displayProfiles.find(p => p.id === lastMsgObj.senderId)?.name || '某人');
           lastText = `${senderName}: ${lastMsgObj.text}`;
       }
       
       unifiedChatList.push({
          isGroup: true,
          target: g,
          chatId: g.id,
          lastTime: lastMsgObj ? lastMsgObj.timestamp : (g.createdAt || 0),
          lastText: lastText,
          isUnread: false, // 群聊暂时不计入精确的个人已读未读红点，避免过度打扰
          themeColor: 'from-indigo-400 to-blue-500',
          avatarText: <Users className="w-6 h-6 text-white"/>,
          title: `${g.name || '群聊'} (${g.memberIds?.length || 0})`
       });
    });

    // === 排序引擎：置顶优先，时间其次 ===
    const pinnedChats = userProfile.pinnedChats || [];
    unifiedChatList.sort((a, b) => {
       const aPinned = pinnedChats.includes(a.chatId) ? 1 : 0;
       const bPinned = pinnedChats.includes(b.chatId) ? 1 : 0;
       if (aPinned !== bPinned) return bPinned - aPinned; // 置顶的排前面
       return b.lastTime - a.lastTime; // 都是置顶或都不是置顶，按时间倒序
    });

    const myPendingReqs = allRequests.filter(r => r.receiverId === currentUser?.uid && r.status === 'pending' && !blockedUids.has(r.senderId));

    return (
      <div className="h-full flex flex-col relative">
        <div className="py-4 border-b border-gray-100 flex justify-between items-center px-1">
           <h2 className="text-2xl font-bold text-gray-900">消息与通知</h2>
           <button onClick={() => setIsCreatingGroup(true)} className="w-8 h-8 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-600 transition-colors">
              <Plus className="w-5 h-5" />
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto pt-4 pb-10">
          
          {myPendingReqs.length > 0 && (
            <div className="mb-6 px-1">
              <h3 className="text-sm font-bold text-gray-500 mb-3 px-1">收到的申请 ({myPendingReqs.length})</h3>
              <div className="space-y-2">
                {myPendingReqs.map(req => {
                   const sender = displayProfiles.find(p => p.id === req.senderId);
                   if (!sender) return null;
                   const reqLabel = req.type === 'view_qa' ? '请求查看你的匹配问卷' : req.type === 'add_friend' ? '请求添加你为好友' : '在探索页面关注了你';
                   const acceptLabel = req.type === 'like' ? '互关' : '同意';

                   return (
                     <div key={req.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                       <div className="flex items-center space-x-3">
                         <div onClick={() => setViewedProfile(sender)} className={`w-10 h-10 rounded-full bg-gradient-to-br ${sender.color || 'from-blue-400 to-blue-600'} flex items-center justify-center text-white font-black shadow-sm cursor-pointer`}>{sender.name?.[0] || '?'}</div>
                         <div>
                           <p onClick={() => setViewedProfile(sender)} className="text-sm font-bold text-gray-900 cursor-pointer">{sender.name}</p>
                           <p className="text-xs text-purple-600 font-medium">{reqLabel}</p>
                         </div>
                       </div>
                       <div className="flex space-x-2">
                         <button onClick={() => handleProcessRequest(req.id, 'accepted')} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold active:scale-90">{acceptLabel}</button>
                         <button onClick={() => handleProcessRequest(req.id, 'rejected')} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-90">拒绝</button>
                       </div>
                     </div>
                   );
                })}
              </div>
            </div>
          )}

          <div className="px-1">
            <h3 className="text-sm font-bold text-gray-500 mb-3 px-1">聊天列表</h3>
            {unifiedChatList.length > 0 ? (
              <div className="space-y-2">
                {unifiedChatList.map(chat => { 
                  const isPinned = pinnedChats.includes(chat.chatId);
                  
                  return (
                    <div key={chat.chatId} onClick={() => chat.isGroup ? setCurrentChatGroup(chat.target) : setCurrentChatUser(chat.target)} className={`flex items-center space-x-4 p-3 rounded-2xl cursor-pointer transition-colors active:scale-95 border border-transparent hover:border-purple-100 relative ${isPinned ? 'bg-purple-50' : 'bg-white hover:bg-gray-50'}`}>
                      {chat.isUnread && <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></div>}
                      
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${chat.themeColor} flex items-center justify-center flex-shrink-0 shadow-sm border border-white ml-2`}>
                         <span className="text-white text-xl font-black">{chat.avatarText}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center mb-0.5">
                            <h4 className={`text-base font-bold truncate pr-2 ${chat.isUnread ? 'text-gray-900' : 'text-gray-700'}`}>{chat.title}</h4>
                            {isPinned && <Star className="w-3.5 h-3.5 text-purple-400 fill-current flex-shrink-0" />}
                         </div>
                         <p className={`text-sm truncate ${chat.isUnread ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>{chat.lastText}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400"><MessageCircle className="w-10 h-10 mb-2 opacity-20" /><p className="text-sm">暂无聊天记录，快去探索或建群吧</p></div>
            )}
          </div>
        </div>

        {renderCreateGroupModal()}
      </div>
    );
  };

  const renderChatView = () => {
    if (!currentChatUser && !currentChatGroup) return null;
    
    const isGroup = !!currentChatGroup;
    const targetObj = isGroup ? currentChatGroup : currentChatUser;
    
    // 如果是群组，从 allGroups 拉取最新状态
    const activeGroup = isGroup ? (allGroups.find(g => g.id === targetObj.id) || targetObj) : null;
    
    const chatId = isGroup ? activeGroup.id : [String(currentUser?.uid), String(currentChatUser.id)].sort().join('_');
    const chatMsgs = allMessages.filter(m => m.chatId === chatId);
    const themeColor = isGroup ? 'from-indigo-400 to-blue-500' : (currentChatUser.color || 'from-purple-400 to-pink-500');
    
    const title = isGroup ? `${activeGroup.name || '群聊'} (${activeGroup.memberIds?.length || 0})` : currentChatUser.name;

    return (
      <div className="absolute inset-0 bg-gray-50 z-30 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100 shadow-sm z-10">
          <button onClick={() => { setCurrentChatUser(null); setCurrentChatGroup(null); }} className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition"><ChevronLeft className="w-6 h-6" /></button>
          
          <div onClick={() => !isGroup && setViewedProfile(currentChatUser)} className={`flex items-center space-x-2 ${!isGroup ? 'cursor-pointer active:scale-95' : ''}`}>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br ${themeColor} border border-white`}>
                {isGroup ? <Users className="w-4 h-4 text-white" /> : <span className="text-white font-bold text-sm">{currentChatUser.name?.[0]}</span>}
             </div>
             <h2 className="text-lg font-bold text-gray-900 truncate max-w-[150px]">{title}</h2>
          </div>
          
          {isGroup ? (
            <button onClick={() => setShowGroupSettings(true)} className="p-2 -mr-2 text-gray-600 hover:bg-gray-50 rounded-full transition"><MoreHorizontal className="w-6 h-6" /></button>
          ) : <div className="w-8"></div>}
        </div>

        {/* 聊天消息区 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#f4f7f6]">
          {chatMsgs.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60"><Sparkles className="w-12 h-12 mb-2" /><p className="text-sm">发个消息打个招呼吧！</p></div>) : (
            chatMsgs.map(msg => { 
              const isMe = msg.senderId === currentUser?.uid; 
              const msgTime = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
              
              let senderProfile = isMe ? userProfile : (displayProfiles.find(p => p.id === msg.senderId) || {name: '某人'});
              const msgThemeColor = senderProfile.color || 'from-purple-400 to-pink-500';

              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full animate-in fade-in slide-in-from-bottom-2`}>
                  {!isMe && (
                    <div onClick={() => {if(senderProfile.id) setViewedProfile(senderProfile)}} className={`w-9 h-9 rounded-full bg-gradient-to-br ${msgThemeColor} flex items-center justify-center flex-shrink-0 mr-3 mt-1 shadow-sm border border-white cursor-pointer`}>
                       <span className="text-white text-sm font-black">{senderProfile.name?.[0] || '?'}</span>
                    </div>
                  )}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {/* 群聊中如果是别人发的消息，在气泡上方显示名字 */}
                    {isGroup && !isMe && <span className="text-[10px] text-gray-400 mb-1 ml-1">{senderProfile.name}</span>}
                    
                    <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm break-all ${isMe ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'}`}>{msg.text}</div>
                    <span className="text-[10px] text-gray-400 mt-1.5 px-1">{msgTime}</span>
                  </div>
                  {isMe && (
                    <div onClick={() => setViewedProfile({id: currentUser.uid, ...userProfile})} className={`w-9 h-9 rounded-full bg-gradient-to-br ${msgThemeColor} flex items-center justify-center flex-shrink-0 ml-3 mt-1 shadow-sm border border-white cursor-pointer`}>
                       <span className="text-white text-sm font-black">{senderProfile.name?.[0] || '?'}</span>
                    </div>
                  )}
                </div>
              )
            })
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 bg-white border-t border-gray-100"><div className="flex items-center space-x-2 relative"><input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="发送消息..." className="flex-1 bg-gray-50 border border-gray-200 rounded-full pl-5 pr-14 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /><button onClick={handleSendMessage} disabled={!inputText.trim()} className="absolute right-1.5 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white active:scale-95"><ArrowRight className="w-5 h-5" /></button></div></div>
        
        {renderGroupSettingsModal()}
      </div>
    );
  };

  const renderProfile = () => {
    return (
      <div className="h-full flex flex-col items-center pt-8 overflow-y-auto pb-6">
        <div className="w-full flex justify-end px-4 mb-2"><Settings className="w-6 h-6 text-gray-400 cursor-pointer" /></div>
        <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-6 shadow-inner border-2 border-white transform rotate-3"><span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-purple-600 to-pink-500 -rotate-3">{userProfile.name?.[0]}</span></div>
        <div className="flex items-center space-x-3 mb-2">
          {isEditingName ? (
            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-200"><input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="text-2xl font-black text-gray-900 focus:outline-none bg-transparent w-32 text-center" autoFocus /><button onClick={() => { setUserProfile({...userProfile, name: tempName}); setIsEditingName(false); }} className="bg-purple-600 p-2 rounded-full text-white shadow-md"><Check className="w-4 h-4" /></button></div>
          ) : (
            <div className="flex items-center space-x-2"><h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">{userProfile.name}</h2><button onClick={() => setIsEditingName(true)} className="text-gray-300 hover:text-purple-600 p-1"><Edit2 className="w-5 h-5" /></button></div>
          )}
        </div>
        <p className="text-purple-600 font-bold mb-8 tracking-widest text-sm bg-purple-50 px-4 py-1.5 rounded-full">清华大学 • {userProfile.major}</p>
        <div className="w-full px-5 space-y-3">
          <button onClick={() => setCurrentView('editProfile')} className="w-full py-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-left px-6 font-bold text-gray-700 flex justify-between items-center active:scale-[0.98]">编辑个人档案 <span className="text-gray-300">›</span></button>
          <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="w-full py-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-left px-6 font-bold text-purple-600 flex justify-between items-center active:scale-[0.98]">{copied ? "✅ 链接已复制" : "🔗 邀请同学加入"}</button>
          <button onClick={handleLogout} className="w-full py-4 bg-red-50/50 rounded-2xl text-red-500 font-bold flex justify-center items-center mt-6 active:scale-[0.98]">退出登录</button>
        </div>
      </div>
    );
  };

  const renderEditProfile = () => {
    return (
      <div className="absolute inset-0 bg-gray-50 z-20 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
          <button onClick={() => setCurrentView('main')} className="p-2 text-gray-600"><ChevronLeft className="w-6 h-6" /></button>
          <h2 className="text-lg font-bold text-gray-900">编辑个人资料</h2>
          <button onClick={handleSaveProfileInfo} className="text-purple-600 font-bold text-sm">完成</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <label className="block text-sm font-medium text-gray-500 mb-2">性别</label>
            <select value={userProfile.gender} onChange={(e) => setUserProfile({...userProfile, gender: e.target.value})} className="w-full bg-transparent text-gray-900 font-medium focus:outline-none"><option value="男">男</option><option value="女">女</option><option value="其他">其他</option></select>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <label className="block text-sm font-medium text-gray-500 mb-2">年龄</label>
            <input type="number" value={userProfile.age} onChange={(e) => setUserProfile({...userProfile, age: e.target.value})} className="w-full bg-transparent text-gray-900 font-medium focus:outline-none" placeholder="20" />
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <label className="block text-sm font-medium text-gray-500 mb-2">专业/学院</label>
            <select value={userProfile.major} onChange={(e) => setUserProfile({...userProfile, major: e.target.value})} className="w-full bg-transparent text-gray-900 font-medium focus:outline-none"><option value="" disabled>请选择所属院系...</option>{MAJOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-50"><label className="block text-sm font-medium text-gray-500 mb-2">身高 (cm)</label><input type="number" value={userProfile.height} onChange={(e) => setUserProfile({...userProfile, height: e.target.value})} className="w-full bg-transparent text-gray-900 font-medium focus:outline-none" /></div>
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-50"><label className="block text-sm font-medium text-gray-500 mb-2">体重 (kg)</label><input type="number" value={userProfile.weight} onChange={(e) => setUserProfile({...userProfile, weight: e.target.value})} className="w-full bg-transparent text-gray-900 font-medium focus:outline-none" /></div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <label className="block text-sm font-medium text-gray-500 mb-3">标签属性 (可多选)</label>
            <div className="flex flex-wrap gap-2 mb-3">{TAG_OPTIONS.map(tag => { const isSelected = userProfile.tagMode.includes(tag); return (<button key={tag} onClick={() => { setUserProfile(prev => { const newTags = isSelected ? prev.tagMode.filter(t => t !== tag) : [...prev.tagMode, tag]; return {...prev, tagMode: newTags}; }); }} className={`px-4 py-2 rounded-full text-sm font-medium ${isSelected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{tag}</button>)})}</div>
            {userProfile.tagMode.includes('其他') && (<div className="mt-3"><input type="text" value={userProfile.customTag} onChange={(e) => setUserProfile({...userProfile, customTag: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="请输入专属标签..." /></div>)}
          </div>
          <p className="text-xs text-gray-400 text-center pt-4 pb-8">完善资料能让更多人了解你哦</p>
        </div>
      </div>
    );
  };

  const renderToast = () => toastMsg && <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full shadow-2xl z-50 font-medium text-sm text-center min-w-[200px] animate-in fade-in zoom-in pointer-events-none">{toastMsg}</div>;

  if (!isAuthenticated) return (<div className="min-h-screen bg-gray-100 flex items-center justify-center sm:p-4 font-sans"><div className="w-full h-[100dvh] sm:h-[800px] sm:max-h-[90vh] sm:max-w-[400px] bg-white sm:rounded-[2.5rem] sm:shadow-2xl overflow-hidden flex flex-col relative sm:border-8 sm:border-white">{renderAuth()}</div></div>);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center sm:p-4 font-sans selection:bg-purple-200">
      <div className="w-full h-[100dvh] sm:h-[800px] sm:max-h-[90vh] sm:max-w-[400px] bg-gray-50 sm:rounded-[2.5rem] sm:shadow-2xl overflow-hidden flex flex-col relative sm:border-8 sm:border-white">
        {currentView === 'editProfile' ? renderEditProfile() : (
          <>
            {renderToast()}
            {renderChatView()} 
            <header className="px-5 pt-8 pb-3 flex justify-between items-center bg-gray-50 z-10"><div className="flex items-center space-x-2"><div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center transform rotate-12"><span className="text-white font-black text-sm -rotate-12">THU</span></div><h1 className="text-xl font-black text-gray-900 tracking-tight">Purpled</h1></div></header>
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
              <button onClick={() => setActiveTab('match')} className={`flex flex-col items-center space-y-1 w-1/5 ${activeTab === 'match' ? 'text-pink-500' : 'text-gray-400'}`}><ClipboardEdit className="w-6 h-6" /><span className="text-[10px] font-bold transform scale-90">匹配</span></button>
              
              <button onClick={() => setActiveTab('messages')} className={`flex flex-col items-center space-y-1 relative w-1/5 ${activeTab === 'messages' ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className="relative">
                  <MessageCircle className="w-6 h-6" />
                  {hasUnread && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                </div>
                <span className="text-[10px] font-bold transform scale-90">消息</span>
              </button>
              
              <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center space-y-1 w-1/5 ${activeTab === 'profile' ? 'text-purple-600' : 'text-gray-400'}`}><User className="w-6 h-6" /><span className="text-[10px] font-bold transform scale-90">我的</span></button>
            </nav>
          </>
        )}
      </div>
    </div>
  );
}