(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,91323,56420,44200,49882,51757,16327,74544,e=>{"use strict";var t=e.i(71645);let r=(...e)=>e.filter((e,t,r)=>!!e&&""!==e.trim()&&r.indexOf(e)===t).join(" ").trim(),n=e=>{let t=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,r)=>r?r.toUpperCase():t.toLowerCase());return t.charAt(0).toUpperCase()+t.slice(1)};var a={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let i=(0,t.createContext)({}),o=(0,t.forwardRef)(({color:e,size:n,strokeWidth:o,absoluteStrokeWidth:l,className:c="",children:s,iconNode:d,...p},u)=>{let{size:h=24,strokeWidth:f=2,absoluteStrokeWidth:m=!1,color:y="currentColor",className:g=""}=(0,t.useContext)(i)??{},x=l??m?24*Number(o??f)/Number(n??h):o??f;return(0,t.createElement)("svg",{ref:u,...a,width:n??h??a.width,height:n??h??a.height,stroke:e??y,strokeWidth:x,className:r("lucide",g,c),...!s&&!(e=>{for(let t in e)if(t.startsWith("aria-")||"role"===t||"title"===t)return!0;return!1})(p)&&{"aria-hidden":"true"},...p},[...d.map(([e,r])=>(0,t.createElement)(e,r)),...Array.isArray(s)?s:[s]])}),l=(e,a)=>{let i=(0,t.forwardRef)(({className:i,...l},c)=>(0,t.createElement)(o,{ref:c,iconNode:a,className:r(`lucide-${n(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,i),...l}));return i.displayName=n(e),i};e.s(["default",0,l],56420);let c=l("badge-check",[["path",{d:"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",key:"3c2336"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["BadgeCheck",0,c],91323);let s=l("calculator",[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",key:"1nb95v"}],["line",{x1:"8",x2:"16",y1:"6",y2:"6",key:"x4nwl0"}],["line",{x1:"16",x2:"16",y1:"14",y2:"18",key:"wjye3r"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M8 18h.01",key:"lrp35t"}]]);e.s(["Calculator",0,s],44200);let d=l("calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);e.s(["Calendar",0,d],49882);let p=l("circle-check",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["CheckCircle2",0,p],51757);let u=l("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);e.s(["ChevronDown",0,u],16327);let h=l("clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]]);e.s(["Clock",0,h],74544)},12796,7219,e=>{"use strict";var t=e.i(56420);let r=(0,t.default)("loader",[["path",{d:"M12 2v4",key:"3427ic"}],["path",{d:"m16.2 7.8 2.9-2.9",key:"r700ao"}],["path",{d:"M18 12h4",key:"wj9ykh"}],["path",{d:"m16.2 16.2 2.9 2.9",key:"1bxg5t"}],["path",{d:"M12 18v4",key:"jadmvz"}],["path",{d:"m4.9 19.1 2.9-2.9",key:"bwix9q"}],["path",{d:"M2 12h4",key:"j09sii"}],["path",{d:"m4.9 4.9 2.9 2.9",key:"giyufr"}]]);e.s(["Loader",0,r],12796);let n=(0,t.default)("trending-up",[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]]);e.s(["TrendingUp",0,n],7219)},95057,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n={formatUrl:function(){return l},formatWithValidation:function(){return s},urlObjectKeys:function(){return c}};for(var a in n)Object.defineProperty(r,a,{enumerable:!0,get:n[a]});let i=e.r(90809)._(e.r(98183)),o=/https?|ftp|gopher|file/;function l(e){let{auth:t,hostname:r}=e,n=e.protocol||"",a=e.pathname||"",l=e.hash||"",c=e.query||"",s=!1;t=t?encodeURIComponent(t).replace(/%3A/i,":")+"@":"",e.host?s=t+e.host:r&&(s=t+(~r.indexOf(":")?`[${r}]`:r),e.port&&(s+=":"+e.port)),c&&"object"==typeof c&&(c=String(i.urlQueryToSearchParams(c)));let d=e.search||c&&`?${c}`||"";return n&&!n.endsWith(":")&&(n+=":"),e.slashes||(!n||o.test(n))&&!1!==s?(s="//"+(s||""),a&&"/"!==a[0]&&(a="/"+a)):s||(s=""),l&&"#"!==l[0]&&(l="#"+l),d&&"?"!==d[0]&&(d="?"+d),a=a.replace(/[?#]/g,encodeURIComponent),d=d.replace("#","%23"),`${n}${s}${a}${d}${l}`}let c=["auth","hash","host","hostname","href","path","pathname","port","protocol","query","search","slashes"];function s(e){return l(e)}},18581,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"useMergedRef",{enumerable:!0,get:function(){return a}});let n=e.r(71645);function a(e,t){let r=(0,n.useRef)(null),a=(0,n.useRef)(null);return(0,n.useCallback)(n=>{if(null===n){let e=r.current;e&&(r.current=null,e());let t=a.current;t&&(a.current=null,t())}else e&&(r.current=i(e,n)),t&&(a.current=i(t,n))},[e,t])}function i(e,t){if("function"!=typeof e)return e.current=t,()=>{e.current=null};{let r=e(t);return"function"==typeof r?r:()=>e(null)}}("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},73668,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"isLocalURL",{enumerable:!0,get:function(){return i}});let n=e.r(18967),a=e.r(52817);function i(e){if(!(0,n.isAbsoluteUrl)(e))return!0;try{let t=(0,n.getLocationOrigin)(),r=new URL(e,t);return r.origin===t&&(0,a.hasBasePath)(r.pathname)}catch(e){return!1}}},84508,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"errorOnce",{enumerable:!0,get:function(){return n}});let n=e=>{}},22016,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n={default:function(){return g},useLinkStatus:function(){return v}};for(var a in n)Object.defineProperty(r,a,{enumerable:!0,get:n[a]});let i=e.r(90809),o=e.r(43476),l=i._(e.r(71645)),c=e.r(95057),s=e.r(8372),d=e.r(18581),p=e.r(18967),u=e.r(5550);e.r(33525);let h=e.r(88540),f=e.r(91949),m=e.r(73668),y=e.r(9396);function g(t){var r,n;let a,i,g,[v,b]=(0,l.useOptimistic)(f.IDLE_LINK_STATUS),k=(0,l.useRef)(null),{href:w,as:C,children:T,prefetch:S=null,passHref:A,replace:_,shallow:j,scroll:M,onClick:P,onMouseEnter:O,onTouchStart:E,legacyBehavior:I=!1,onNavigate:L,transitionTypes:N,ref:R,unstable_dynamicOnHover:z,...U}=t;a=T,I&&("string"==typeof a||"number"==typeof a)&&(a=(0,o.jsx)("a",{children:a}));let $=l.default.useContext(s.AppRouterContext),B=!1!==S,D=!1!==S?null===(n=S)||"auto"===n?y.FetchStrategy.PPR:y.FetchStrategy.Full:y.FetchStrategy.PPR,V="string"==typeof(r=C||w)?r:(0,c.formatUrl)(r);if(I){if(a?.$$typeof===Symbol.for("react.lazy"))throw Object.defineProperty(Error("`<Link legacyBehavior>` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's `<a>` tag."),"__NEXT_ERROR_CODE",{value:"E863",enumerable:!1,configurable:!0});i=l.default.Children.only(a)}let G=I?i&&"object"==typeof i&&i.ref:R,K=l.default.useCallback(e=>(null!==$&&(k.current=(0,f.mountLinkInstance)(e,V,$,D,B,b)),()=>{k.current&&((0,f.unmountLinkForCurrentNavigation)(k.current),k.current=null),(0,f.unmountPrefetchableInstance)(e)}),[B,V,$,D,b]),F={ref:(0,d.useMergedRef)(K,G),onClick(t){I||"function"!=typeof P||P(t),I&&i.props&&"function"==typeof i.props.onClick&&i.props.onClick(t),!$||t.defaultPrevented||function(t,r,n,a,i,o,c){if("u">typeof window){let s,{nodeName:d}=t.currentTarget;if("A"===d.toUpperCase()&&((s=t.currentTarget.getAttribute("target"))&&"_self"!==s||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey||t.nativeEvent&&2===t.nativeEvent.which)||t.currentTarget.hasAttribute("download"))return;if(!(0,m.isLocalURL)(r)){a&&(t.preventDefault(),location.replace(r));return}if(t.preventDefault(),o){let e=!1;if(o({preventDefault:()=>{e=!0}}),e)return}let{dispatchNavigateAction:p}=e.r(99781);l.default.startTransition(()=>{p(r,a?"replace":"push",!1===i?h.ScrollBehavior.NoScroll:h.ScrollBehavior.Default,n.current,c)})}}(t,V,k,_,M,L,N)},onMouseEnter(e){I||"function"!=typeof O||O(e),I&&i.props&&"function"==typeof i.props.onMouseEnter&&i.props.onMouseEnter(e),$&&B&&(0,f.onNavigationIntent)(e.currentTarget,!0===z)},onTouchStart:function(e){I||"function"!=typeof E||E(e),I&&i.props&&"function"==typeof i.props.onTouchStart&&i.props.onTouchStart(e),$&&B&&(0,f.onNavigationIntent)(e.currentTarget,!0===z)}};return(0,p.isAbsoluteUrl)(V)?F.href=V:I&&!A&&("a"!==i.type||"href"in i.props)||(F.href=(0,u.addBasePath)(V)),g=I?l.default.cloneElement(i,F):(0,o.jsx)("a",{...U,...F,children:a}),(0,o.jsx)(x.Provider,{value:v,children:g})}e.r(84508);let x=(0,l.createContext)(f.IDLE_LINK_STATUS),v=()=>(0,l.useContext)(x);("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},37827,e=>{"use strict";let t=(0,e.i(56420).default)("chart-no-axes-combined",[["path",{d:"M12 16v5",key:"zza2cw"}],["path",{d:"M16 14.639V21",key:"1s85h0"}],["path",{d:"M20 10.656V21",key:"q45596"}],["path",{d:"m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15",key:"1fw8x9"}],["path",{d:"M4 18.463V21",key:"1otddq"}],["path",{d:"M8 14.656V21",key:"1t2idw"}]]);e.s(["ChartNoAxesCombined",0,t],37827)},69644,e=>{"use strict";let t=(0,e.i(56420).default)("folder-open",[["path",{d:"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",key:"usdka0"}]]);e.s(["FolderOpen",0,t],69644)},25045,e=>{"use strict";var t=e.i(43476),r=e.i(22016),n=e.i(18566),a=e.i(37827),i=e.i(69644),o=e.i(97053);let l=o.default.div.withConfig({displayName:"AppShell__Shell",componentId:"sc-6494f848-0"})`
  min-height: 100vh;
`,c=o.default.aside.withConfig({displayName:"AppShell__Sidebar",componentId:"sc-6494f848-1"})`
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 20;
  display: flex;
  width: 84px;
  flex-direction: column;
  border-right: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.88);
  padding: 28px 14px 22px;
  backdrop-filter: blur(18px);

  @media (max-width: 860px) {
    inset: 0 0 auto;
    width: auto;
    height: 76px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border-right: 0;
    border-bottom: 1px solid var(--line);
    padding: 13px 18px;
  }

  @media (max-width: 640px) {
    inset: auto auto max(14px, env(safe-area-inset-bottom)) 50%;
    width: min(230px, calc(100vw - 28px));
    height: auto;
    border: 0.5px solid rgba(0, 0, 0, 0.06);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: 4px;
    transform: translateX(-50%);

    body.profile-modal-open & {
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    }
  }
`,s=o.default.nav.withConfig({displayName:"AppShell__Navigation",componentId:"sc-6494f848-2"})`
  display: grid;
  gap: 7px;
  width: 100%;

  @media (max-width: 860px) {
    display: flex;
    width: auto;
    justify-content: center;
  }

  @media (max-width: 640px) {
    width: 100%;
    gap: 3px;
  }
`,d=(0,o.default)(r.default).withConfig({displayName:"AppShell__NavItem",componentId:"sc-6494f848-3"})`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  border-radius: 13px;
  padding: 0;
  background: ${({$active:e})=>e?"#edf0ff":"transparent"};
  color: ${({$active:e})=>e?"var(--primary)":"#5f6779"};
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
  transition: 150ms ease;

  span {
    display: none;
  }

  &::after {
    position: absolute;
    left: calc(100% + 12px);
    top: 50%;
    z-index: 30;
    width: max-content;
    border: 1px solid var(--line);
    border-radius: 9px;
    padding: 7px 10px;
    background: #ffffff;
    box-shadow: 0 8px 24px rgba(32, 39, 55, 0.12);
    color: var(--ink);
    content: attr(aria-label);
    font-size: 13px;
    font-weight: 600;
    line-height: 1;
    opacity: 0;
    pointer-events: none;
    transform: translate(-5px, -50%);
    transition: opacity 150ms ease, transform 150ms ease;
  }

  &:hover {
    background: ${({$active:e})=>e?"#edf0ff":"#f3f4f8"};
    color: ${({$active:e})=>e?"var(--primary)":"var(--ink)"};
  }

  &:hover::after,
  &:focus-visible::after {
    opacity: 1;
    transform: translate(0, -50%);
  }

  @media (max-width: 860px) {
    min-height: 44px;
    width: 48px;

    &::after {
      display: none;
    }
  }

  @media (max-width: 640px) {
    width: auto;
    min-height: 46px;
    flex: 1 1 0;
    flex-direction: column;
    gap: 1px;
    border-radius: 999px;
    background: ${({$active:e})=>e?"#edf0ff":"transparent"};
    font-size: 10px;
    line-height: 1;

    span {
      display: block;
    }

    svg {
      width: 21px;
      height: 21px;
    }
  }
`,p=o.default.main.withConfig({displayName:"AppShell__Main",componentId:"sc-6494f848-4"})`
  min-height: 100vh;
  margin-left: 84px;
  padding: 24px clamp(16px, 2vw, 32px) 56px;

  @media (max-width: 860px) {
    margin-left: 0;
    padding: 94px 20px 56px;
  }

  @media (max-width: 640px) {
    padding: 22px 14px calc(92px + env(safe-area-inset-bottom));
  }
`,u=o.default.div.withConfig({displayName:"AppShell__MainInner",componentId:"sc-6494f848-5"})`
  width: min(1300px, 100%);
  margin: 0 auto;
`;e.s(["AppShell",0,function({children:e}){let r=(0,n.usePathname)(),o="/"===r?r:r.replace(/\/+$/,"");return(0,t.jsxs)(l,{children:[(0,t.jsx)(c,{children:(0,t.jsxs)(s,{"aria-label":"Điều hướng chính",children:[(0,t.jsxs)(d,{href:"/",$active:"/"===o,"aria-current":"/"===o?"page":void 0,"aria-label":"Hồ sơ",title:"Hồ sơ",children:[(0,t.jsx)(i.FolderOpen,{size:19}),(0,t.jsx)("span",{children:"Hồ sơ"})]}),(0,t.jsxs)(d,{href:"/doanh-thu",$active:"/doanh-thu"===o,"aria-current":"/doanh-thu"===o?"page":void 0,"aria-label":"Doanh thu",title:"Doanh thu",children:[(0,t.jsx)(a.ChartNoAxesCombined,{size:19}),(0,t.jsx)("span",{children:"Doanh thu"})]})]})}),(0,t.jsx)(p,{children:(0,t.jsx)(u,{children:e})})]})}])},41225,e=>{"use strict";let t=["Ô tô con","Đầu kéo","Tải có mui","Sơ mi rơ mooc","Xe máy chuyên dùng","Xe máy","Tải tự đổ"],r=["Bình Hòa","Tân Đông Hiệp","Tân Khánh","Rạch Chiết","Lái Thiêu","Giao Thông Bắc Tân Uyên","Giao Thông QL13","An Phú","Bình Cơ","Giao Thông An Sương","Hòa Lợi","CSGT Đồng Nai","CSGT Bắc Tân Uyên","CSGT Quốc Lộ 13","PC08","Phòng CSGT Đồng Nai","Thanh An","Đông Hưng Thuận","Dĩ An"],n=["Thu hồi","Đăng ký sang tên","Thu hồi và sang tên","Phạt nguội","Cấp lại","Cấp đổi","Đăng ký lần đầu","Cấp đổi và cải tạo"],a=["Đang xử lí","Đang chờ thanh toán","Đã thanh toán","Hoàn tất"],i="https://script.google.com/macros/s/AKfycbzv0TOLz1fiff42H4Rs2GGm3K7rcQTrzLhc994TUmI21aaCAzREVBLV1Ze2h21rDwdOyA/exec".trim()||"https://script.google.com/macros/s/AKfycbzv0TOLz1fiff42H4Rs2GGm3K7rcQTrzLhc994TUmI21aaCAzREVBLV1Ze2h21rDwdOyA/exec";function o(){return{customerName:"",vehicleOwnerName:"",vehiclePlate:"",vehicleType:t[0],receivingAgency:r[0],serviceType:n[0],cost:0,registrationFeeCost:0,otherCost:0,blackBoxBadgeCost:0,otherIncidentalCost:0,initialCost:0,status:a[0],newVehiclePlate:"",owesVehiclePlate:!1,owesRegistration:!1}}function l(e){let t=c(e.cost)+c(e.registrationFeeCost)+c(e.otherCost)+c(e.blackBoxBadgeCost)+c(e.otherIncidentalCost);return{totalCost:t,profit:t-c(e.initialCost)}}function c(e){let t=Number(e);return Number.isFinite(t)?t:0}function s(e){return{...o(),...e,vehicleType:"SMRM"===e.vehicleType?"Sơ mi rơ mooc":e.vehicleType||t[0],receivingAgency:e.receivingAgency||r[0],serviceType:e.serviceType||n[0],status:e.status||a[0],cost:c(e.cost),registrationFeeCost:c(e.registrationFeeCost),otherCost:c(e.otherCost),blackBoxBadgeCost:c(e.blackBoxBadgeCost),otherIncidentalCost:c(e.otherIncidentalCost),initialCost:c(e.initialCost),owesVehiclePlate:!0===e.owesVehiclePlate,owesRegistration:!0===e.owesRegistration}}function d(e){let t=s(e),r=l(t);return{id:String(e.id||crypto.randomUUID()),...t,totalCost:c(e.totalCost)||r.totalCost,profit:Number.isFinite(Number(e.profit))?Number(e.profit):r.profit,createdAt:String(e.createdAt||new Date().toISOString()),updatedAt:String(e.updatedAt||e.createdAt||new Date().toISOString())}}async function p(e,t){let r=t?await fetch(i,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:e,...t}),redirect:"follow"}):await fetch(`${i}?action=${encodeURIComponent(e)}&t=${Date.now()}`,{method:"GET",redirect:"follow",cache:"no-store"});if(!r.ok)throw Error(`Kh\xf4ng thể kết nối Google Sheets (${r.status}).`);let n=await r.json();if(!n.success)throw Error(n.message||"Google Apps Script trả về lỗi.");return n.data}e.s(["PROFILE_STATUSES",0,a,"RECEIVING_AGENCIES",0,r,"SERVICE_TYPES",0,n,"VEHICLE_TYPES",0,t,"calculateProfileCosts",0,l,"createEmptyProfileInput",0,o,"profileService",0,{list:async()=>(await p("list")).map(d),async create(e){let t=s(e);return d(await p("create",{record:t}))},async update(e,t){let r=s(t);return d(await p("update",{id:e,record:r}))},async remove(e){await p("delete",{id:e})}}])}]);