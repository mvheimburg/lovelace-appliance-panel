/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,e$2=t$1.ShadowRoot&&(void 0===t$1.ShadyCSS||t$1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$3=new WeakMap;let n$2 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$3.set(s,t));}return t}toString(){return this.cssText}};const r$2=t=>new n$2("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$2(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$1.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$1,getOwnPropertySymbols:o$2,getPrototypeOf:n$1}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$1(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$1(t),...o$2(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i$1=t=>t,s$1=t.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$1=`lit$${Math.random().toFixed(9).slice(2)}$`,n="?"+o$1,r=`<${n}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e?e.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$1+x):s+o$1+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$1),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$1)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$1),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$1,t+1));)d.push({type:7,index:l}),t+=o$1.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$1(t).nextSibling;i$1(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t.litHtmlPolyfillSupport;B?.(S,k),(t.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o=s.litElementPolyfillSupport;o?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.2");

const CARD_KINDS = {
    "oven-card": "oven",
    "dishwasher-card": "dishwasher",
    "coffee-machine-card": "coffee",
    "refrigerator-card": "cooling",
    "appliance-card": "unknown",
};
function validateConfig(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
        throw new Error("Card configuration must be an object.");
    const kind = typeof raw.type === "string" ? raw.type.replace(/^custom:/, "") : "";
    if (!Object.prototype.hasOwnProperty.call(CARD_KINDS, kind) &&
        kind !== "kitchen-panel-card")
        throw new Error("Unsupported appliance card type.");
    for (const field of ["device", "area", "title"]) {
        if (raw[field] !== undefined && typeof raw[field] !== "string")
            throw new Error(`${field} must be a string.`);
    }
    if (kind !== "kitchen-panel-card" &&
        (typeof raw.device !== "string" || !raw.device.trim()))
        throw new Error("Select a Home Connect Local device (ID or name).");
    if (raw.devices !== undefined &&
        (!Array.isArray(raw.devices) ||
            raw.devices.some((value) => typeof value !== "string" || !value.trim())))
        throw new Error("devices must be an array of device IDs or names.");
    for (const field of ["expand", "confirm_start"]) {
        if (raw[field] !== undefined && typeof raw[field] !== "boolean")
            throw new Error(`${field} must be true or false.`);
    }
    if (raw.appearance !== undefined &&
        raw.appearance !== "default" &&
        raw.appearance !== "bubble")
        throw new Error("appearance must be default or bubble.");
    const modules = raw.oven_modules ?? "auto";
    if (raw.oven_modules === null ||
        (modules !== "auto" &&
            (!Array.isArray(modules) ||
                modules.some((value) => value !== "microwave" && value !== "steam"))))
        throw new Error("oven_modules must be auto or an array containing microwave and/or steam.");
    return {
        ...raw,
        type: raw.type,
        appearance: raw.appearance ?? "default",
        expand: raw.expand ?? true,
        confirm_start: raw.confirm_start ?? true,
        oven_modules: Array.isArray(modules) ? [...new Set(modules)] : modules,
    };
}

// Home Connect Local descriptions at 27ee7995d722e0a339cd4946e6f127d4c302150d.
const exact = {
    // Legacy semantic aliases, not current upstream description keys.
    number_fridge_temperature: "cooling_setpoint",
    number_freezer_temperature: "cooling_setpoint",
    switch_super_mode_fridge: "super_mode",
    switch_super_mode_freezer: "super_mode",
    connection: "connection",
    sensor_operation_state: "operation",
    select_program: "selected_program",
    sensor_active_program: "active_program",
    select_active_program: "active_program",
    button_start_program: "start",
    button_pause_program: "pause",
    button_resume_program: "resume",
    button_abort_program: "abort",
    binary_remote_start_allowed: "remote_start",
    select_remote_control_level: "remote_control",
    switch_power_state: "power",
    select_power_state: "power",
    sensor_power_state: "power",
    button_mains_power_off: "power",
    sensor_program_progress: "progress",
    sensor_remaining_program_time: "remaining",
    sensor_elapsed_program_time: "elapsed",
    sensor_start_in: "start_delay",
    number_start_in: "start_delay",
    number_duration: "duration",
    sensor_program_phase: "phase",
    sensor_coffeemaker_process_phase: "phase",
    binary_sensor_program_finished: "finished",
    switch_child_lock: "child_lock",
    select_oven_child_lock_setting: "child_lock",
    number_oven_setpoint_temperature: "target_temperature",
    switch_refrigerator_vacation: "vacation",
    sensor_salt: "attention",
    sensor_rinse_aid: "attention",
    sensor_water_tank: "attention",
    sensor_drip_tray: "attention",
};
const optionKeys = new Set([
    "select_oven_level",
    "select_oven_used_heating_mode",
    "select_pyrolysis_level",
    "switch_oven_fast_pre_heat",
    "select_coffee_temperature",
    "select_bean_amount",
    "select_beverage_size",
    "select_coffee_milk_ratio",
    "select_hot_water_temperature",
    "select_flow_rate",
    "select_coarsness",
    "select_coffee_strength",
    "select_aroma_select",
    "select_bean_container",
    "select_shot_count",
    "select_cups",
    "number_fill_quantity",
    "switch_multiple_beverages",
    "switch_cup_warmer",
    "switch_extra_dry_option",
    "switch_hygiene_plus",
    "switch_intensiv_zone",
    "switch_vario_speed_plus",
    "switch_silence_on_demand",
    "switch_brilliance_dry",
    "switch_zeolite_dry",
    "switch_half_load",
    "switch_extra_rinse",
    "switch_pretreatment",
    // Explicit capability extensions; absent from current upstream description catalog.
    "select_microwave_power",
    "number_microwave_power",
    "select_oven_microwave_power",
    "number_oven_microwave_power",
    "select_steam_level",
    "select_oven_steam_level",
    "select_added_steam",
    "switch_added_steam",
]);
function semanticKey(entry) {
    const unique = entry.unique_id.toLowerCase();
    const match = unique.match(/(?:^|-)((?:binary_sensor_|binary_remote_|sensor_|select_|number_|switch_|button_|light_|fan_).+)$/);
    if (match)
        return match[1];
    if (/(?:^|-)connection$/.test(unique))
        return "connection";
    return "";
}
function roleForKey(key) {
    if (exact[key])
        return exact[key];
    if (/^(?:binary_sensor|sensor)_(?:(?:freezer|fridge|chiller_common)_)?door_state$/.test(key))
        return "door";
    if (/^sensor_oven_current_(?:temperature|meatprobe_temperature)(?:_\d+)?$/.test(key))
        return "current_temperature";
    if (/^sensor_temperature_(?:ambient|memory_freezer)$/.test(key))
        return "current_temperature";
    if (/^sensor_oven_water_tank(?:_\d+)?$/.test(key))
        return "attention";
    if (/^number_setpoint_(?:freezer|refrigerator|chiller_common)(?:_fahrenheit)?$/.test(key))
        return "cooling_setpoint";
    if (/^switch_super_(?:freezer|refrigerator)$/.test(key))
        return "super_mode";
    if (/^binary_sensor_(?:door_alarm|temperature_alarm)_(?:freezer|fridge|chiller_common)$/.test(key))
        return "attention";
    if (/^sensor_(?:countdown_(?:calc_n_clean|cleaning|descaling|water_filter)|machinecare_remaining_runs)$/.test(key))
        return "attention";
    if (/^binary_sensor_(?:.*(?:alarm|error|lack|empty|low_water_pressure|aqua_stop|water_filter_(?:almost_)?full)|program_aborted)$/.test(key))
        return "attention";
    if (optionKeys.has(key) || /^select_flexspray_/.test(key))
        return "option";
    return undefined;
}
function resolveRole(entry, state) {
    const key = semanticKey(entry);
    // A known unique-key namespace wins even when the entity was renamed to another command.
    if (key)
        return (roleForKey(key) ??
            (state?.attributes.device_class === "problem" &&
                entry.entity_id.startsWith("binary_sensor.")
                ? "attention"
                : "other"));
    const [domain, objectId = ""] = entry.entity_id.split(".");
    const candidates = new Set();
    for (const suffix of Object.keys(exact).concat([...optionKeys])) {
        const short = suffix.replace(/^(?:binary_sensor|binary|sensor|select|number|switch|button)_/, "");
        const expected = suffix.startsWith("binary_")
            ? "binary_sensor"
            : suffix.split("_")[0];
        if ((domain === expected ||
            (suffix === "connection" && domain === "binary_sensor")) &&
            (objectId === short || objectId.endsWith(`_${short}`)))
            candidates.add(exact[suffix] ?? "option");
    }
    const parts = objectId.split("_");
    for (let i = 0; i < parts.length; i++) {
        const inferred = roleForKey(`${domain}_${parts.slice(i).join("_")}`);
        if (inferred)
            candidates.add(inferred);
    }
    if (candidates.size === 1)
        return [...candidates][0];
    if (candidates.size > 1)
        return "other";
    if (domain === "binary_sensor" && state?.attributes.device_class === "door")
        return "door";
    if (domain === "binary_sensor" &&
        state?.attributes.device_class === "problem")
        return "attention";
    return "other";
}
function humanize(value) {
    const text = value
        .replace(/^(?:binary_sensor|binary_remote|sensor|select|number|switch|button)_/, "")
        .replace(/[_.]+/g, " ")
        .trim();
    return text ? text[0].toUpperCase() + text.slice(1) : value;
}

function kindOf(device, keys) {
    const evidence = keys.join(" ");
    if (/oven_|microwave|steam_level/.test(evidence))
        return "oven";
    if (/setpoint_(?:freezer|refrigerator|chiller)|super_freezer|fridge_door/.test(evidence))
        return "cooling";
    if (/coffee_|bean_amount|beverage|drip_tray/.test(evidence))
        return "coffee";
    if (/sensor_salt|sensor_rinse_aid|flexspray|vario_speed|half_load/.test(evidence))
        return "dishwasher";
    const name = `${device.model ?? ""} ${device.name}`.toLowerCase();
    if (/dishwasher/.test(name))
        return "dishwasher";
    if (/coffee|coffeemaker/.test(name))
        return "coffee";
    if (/refrigerator|fridge|freezer/.test(name))
        return "cooling";
    if (/oven|microwave/.test(name))
        return "oven";
    if (/washer|washing machine/.test(name))
        return "washer";
    if (/dryer/.test(name))
        return "dryer";
    return "unknown";
}
function discoverAppliances(snapshot, states) {
    const supported = snapshot.entities.filter((e) => e.platform === "homeconnect_ws" && e.device_id);
    return snapshot.devices.flatMap((device) => {
        const entries = supported.filter((e) => e.device_id === device.id);
        if (!entries.length)
            return [];
        const area = snapshot.areas.find((a) => a.area_id === device.area_id);
        return [
            {
                id: device.id,
                name: device.name_by_user || device.name,
                kind: kindOf(device, entries.map(semanticKey)),
                area: area ? { id: area.area_id, name: area.name } : undefined,
                registry: device,
                disabledCount: entries.filter((e) => e.disabled_by || device.disabled_by).length,
                entities: entries
                    .filter((e) => !e.disabled_by && !device.disabled_by)
                    .map((registry) => ({
                    entityId: registry.entity_id,
                    role: resolveRole(registry, states[registry.entity_id]),
                    registry,
                    name: registry.name ||
                        registry.original_name ||
                        states[registry.entity_id]?.attributes.friendly_name ||
                        humanize(semanticKey(registry) || registry.entity_id.split(".")[1]),
                })),
            },
        ];
    });
}
const normalized = (value) => (value ?? "").split(".").pop().toLowerCase().replace(/[ _-]/g, "");
const valid = (state) => !!state &&
    !["unknown", "unavailable", ""].includes(state.state.toLowerCase());
function numeric(state) {
    if (!valid(state))
        return undefined;
    const value = Number(state.state);
    return Number.isFinite(value) ? value : undefined;
}
function seconds(state) {
    const value = numeric(state);
    if (value === undefined || value < 0)
        return undefined;
    const unit = String(state.attributes.unit_of_measurement ?? "s").toLowerCase();
    const scale = {
        s: 1,
        sec: 1,
        second: 1,
        seconds: 1,
        min: 60,
        minute: 60,
        minutes: 60,
        h: 3600,
        hr: 3600,
        hour: 3600,
        hours: 3600,
        ms: 0.001,
        d: 86400,
    };
    return scale[unit] === undefined ? undefined : value * scale[unit];
}
function applianceStatus(appliance, states, now = Date.now()) {
    const entities = appliance.entities;
    const get = (role) => entities
        .filter((e) => e.role === role)
        .map((e) => states[e.entityId])
        .find(valid);
    const connection = entities.find((e) => e.role === "connection");
    const connectionState = connection ? states[connection.entityId] : undefined;
    const reported = entities
        .map((e) => states[e.entityId])
        .filter((s) => !!s);
    let online = "unknown";
    if (connectionState &&
        ["off", "unavailable", "disconnected"].includes(connectionState.state))
        online = "offline";
    else if (connectionState?.state === "on")
        online = "online";
    else if (!connection && reported.some(valid))
        online = "online";
    else if (!connection &&
        reported.length > 0 &&
        reported.every((s) => s.state === "unavailable"))
        online = "offline";
    const operationEntities = entities.filter((e) => e.role === "operation");
    if (operationEntities.length &&
        operationEntities.every((e) => states[e.entityId]?.state === "unavailable"))
        online = "offline";
    const operationMap = {
        inactive: "off",
        off: "off",
        ready: "ready",
        delayedstart: "delayed",
        delayed: "delayed",
        run: "running",
        running: "running",
        pause: "paused",
        paused: "paused",
        finished: "finished",
        error: "error",
        actionrequired: "action_required",
        aborting: "aborting",
    };
    let operation = operationMap[normalized(get("operation")?.state)] ?? "unknown";
    if (online === "offline")
        operation = "offline";
    const busy = [
        "running",
        "delayed",
        "paused",
        "action_required",
        "aborting",
    ].includes(operation);
    const attention = [];
    if (online === "offline")
        attention.push({ message: "Appliance offline", severity: "error" });
    else if (operation === "unknown" && appliance.kind !== "cooling")
        attention.push({
            message: "Appliance status unknown",
            severity: "unknown",
        });
    if (operation === "error" || operation === "action_required")
        attention.push({
            message: humanize(operation),
            severity: operation === "error" ? "error" : "warning",
        });
    for (const entity of entities.filter((e) => e.role === "attention" || e.role === "door")) {
        const state = states[entity.entityId];
        if (!valid(state)) {
            attention.push({
                entityId: entity.entityId,
                message: `${entity.name}: ${state?.state ?? "not reported"}`,
                severity: "unknown",
            });
            continue;
        }
        const value = normalized(state.state);
        const key = semanticKey(entity.registry) || entity.entityId;
        if (/sensor_(?:countdown_|machinecare_remaining_runs)/.test(key)) {
            const count = numeric(state);
            if (count === undefined || count <= 0)
                attention.push({
                    entityId: entity.entityId,
                    message: `${entity.name}: ${count === undefined ? "unknown" : "due"}`,
                    severity: count === undefined ? "unknown" : "warning",
                });
            continue;
        }
        const bad = entity.role === "door"
            ? ["on", "open", "ajar"].includes(value)
            : [
                "on",
                "present",
                "empty",
                "low",
                "nearlyempty",
                "notinserted",
                "unplugged",
                "error",
                "alarm",
                "required",
            ].includes(value) ||
                (value === "full" && /drip_tray/.test(key));
        const healthy = entity.role === "door"
            ? ["off", "closed", "locked"].includes(value)
            : ["off", "confirmed", "ok", "normal", "none"].includes(value) ||
                (value === "full" && !/drip_tray/.test(key));
        if (bad || !healthy)
            attention.push({
                entityId: entity.entityId,
                message: `${entity.name}: ${humanize(state.state)}`,
                severity: bad ? "warning" : "unknown",
            });
    }
    const progress = numeric(get("progress"));
    const remainingSeconds = seconds(get("remaining"));
    const delaySeconds = seconds(get("start_delay"));
    const dates = reported
        .flatMap((s) => [s.last_updated, s.last_changed])
        .filter((s) => !!s && Number.isFinite(Date.parse(s)))
        .sort((a, b) => Date.parse(b) - Date.parse(a));
    const finished = entities
        .filter((e) => e.role === "finished")
        .map((e) => states[e.entityId])
        .find((s) => s?.state === "on");
    return {
        operation,
        busy,
        online,
        attention,
        progress: progress !== undefined && progress >= 0 && progress <= 100
            ? progress
            : undefined,
        remainingSeconds,
        delaySeconds,
        estimatedFinish: (operation === "running" || operation === "delayed") &&
            remainingSeconds !== undefined
            ? now +
                (remainingSeconds +
                    (operation === "delayed" ? (delaySeconds ?? 0) : 0)) *
                    1000
            : undefined,
        phase: get("phase")?.state,
        program: get("active_program")?.state ?? get("selected_program")?.state,
        lastReported: dates[0],
        finishedAt: finished?.last_changed,
    };
}
function selectAppliances(appliances, config, snapshot) {
    let candidates = appliances;
    if (config.area) {
        const id = snapshot.areas.find((a) => a.area_id === config.area);
        const matches = id
            ? [id]
            : snapshot.areas.filter((a) => a.name.toLowerCase() === config.area.toLowerCase());
        if (matches.length !== 1)
            return {
                devices: [],
                error: matches.length
                    ? `Area name is ambiguous: ${config.area}`
                    : `Area not found: ${config.area}`,
            };
        candidates = candidates.filter((d) => d.area?.id === matches[0].area_id);
    }
    const requested = config.device ? [config.device] : config.devices;
    if (!requested)
        return { devices: candidates };
    const devices = [];
    for (const value of requested) {
        const id = candidates.find((d) => d.id === value);
        const matches = id
            ? [id]
            : candidates.filter((d) => d.name.toLowerCase() === value.toLowerCase());
        if (matches.length !== 1)
            return {
                devices: [],
                error: matches.length
                    ? `Device name is ambiguous: ${value}`
                    : `Device not found: ${value}`,
            };
        if (!devices.includes(matches[0]))
            devices.push(matches[0]);
    }
    return { devices };
}

const deny = (reason) => ({
    allowed: false,
    reason,
    confirmation: false,
});
const allowed = (confirmation = false, reason) => ({
    allowed: true,
    confirmation,
    ...(reason ? { reason } : {}),
});
const finite = (value) => typeof value === "number" && Number.isFinite(value);
/** Disabled diagnostics are normally absent from HA's state machine, not a denial. */
function permission(appliance, states, role) {
    const entries = appliance.entities.filter((e) => e.role === role && !e.registry.disabled_by);
    if (!entries.length)
        return "unverified";
    return entries.every((e) => {
        if (e.registry.platform !== "homeconnect_ws" ||
            e.registry.device_id !== appliance.id)
            return false;
        const value = states[e.entityId]?.state.toLowerCase().split(".").pop();
        return role === "remote_start"
            ? value === "on"
            : ["on", "manualremotestart", "permanentremotestart"].includes(value ?? "");
    })
        ? "yes"
        : "no";
}
/** Pure policy shared by all UI paths; dispatch repeats it against current HA state. */
function actionPolicy(appliance, states, action) {
    if (appliance.registry.disabled_by)
        return deny("This appliance is disabled.");
    const entries = appliance.entities.filter((e) => e.entityId === action.entityId);
    if (entries.length !== 1)
        return deny("The control is missing or ambiguous on this appliance.");
    const entity = entries[0];
    if (entity.registry.device_id !== appliance.id ||
        entity.registry.platform !== "homeconnect_ws" ||
        entity.registry.entity_id !== action.entityId)
        return deny("The control does not belong to this Home Connect Local appliance.");
    if (entity.registry.disabled_by)
        return deny("This control is disabled in Home Assistant.");
    const domain = entity.entityId.split(".")[0];
    if (!["button", "select", "number", "switch"].includes(domain))
        return deny("This entity is read-only; its domain has no supported appliance action.");
    const state = states[entity.entityId];
    // Local HCProgram returns no current option before the first selection; it can
    // still expose available programmes. Retain every selection/start guard below.
    const unselectedProgram = domain === "select" &&
        entity.role === "selected_program" &&
        Array.isArray(state?.attributes.options) &&
        state.attributes.options.length > 0;
    // HA buttons have state "unknown" until their first press: this is available.
    if (!state ||
        state.state === "unavailable" ||
        (state.state === "unknown" && domain !== "button" && !unselectedProgram))
        return deny("This control is unavailable or its state is unknown.");
    const transport = ["start", "pause", "resume", "abort"];
    if (transport.includes(entity.role) && domain !== "button")
        return deny("This transport control has an unsupported entity domain.");
    if (["selected_program", "active_program"].includes(entity.role) &&
        domain !== "select")
        return deny("This programme entity is not a supported selector.");
    if (domain === "select") {
        if (typeof action.value !== "string" ||
            !Array.isArray(state.attributes.options) ||
            !state.attributes.options.includes(action.value))
            return deny("Choose an option currently exposed by this selector.");
    }
    if (domain === "number") {
        const { min, max, step } = state.attributes;
        if (!finite(action.value))
            return deny("Enter a finite numeric value.");
        if (!Number.isInteger(action.value))
            return deny("Home Connect Local requires an integer value for this number control.");
        if (!finite(min) ||
            !finite(max) ||
            min > max ||
            (step != null && (!finite(step) || step <= 0)))
            return deny("This control does not expose valid numeric limits or step.");
        if (action.value < min || action.value > max)
            return deny(`Enter a value between ${min} and ${max}.`);
        // Local's number implementation coerces to int; HA defaults the absent step to 1.
        const increment = step ?? 1;
        const steps = (action.value - min) / increment;
        if (Math.abs(steps - Math.round(steps)) > 1e-7)
            return deny(`Enter a value aligned with the ${increment} step from ${min}.`);
    }
    if (domain === "switch" && typeof action.value !== "boolean")
        return deny("Switch controls require an explicit on or off value.");
    const status = applianceStatus(appliance, states);
    if (status.online === "offline" || status.operation === "offline")
        return deny("The appliance is offline.");
    const operation = status.operation;
    if (entity.role === "abort") {
        return [
            "delayed",
            "running",
            "paused",
            "error",
            "action_required",
            "aborting",
        ].includes(operation)
            ? allowed()
            : deny("Abort is available only for an active or interrupted programme.");
    }
    const remoteControl = permission(appliance, states, "remote_control");
    if (entity.role === "pause") {
        if (!["running", "delayed"].includes(operation))
            return deny("Pause requires a running or delayed programme.");
        if (remoteControl === "no")
            return deny("Remote control is disabled or unavailable.");
        return allowed(remoteControl === "unverified", remoteControl === "unverified"
            ? "Remote control permission is unverified; confirm this action."
            : undefined);
    }
    const starts = ["start", "resume", "selected_program", "active_program"].includes(entity.role) ||
        (entity.role === "other" && ["button", "select"].includes(domain));
    if (starts) {
        if (entity.role === "resume"
            ? operation !== "paused"
            : !["ready", "finished"].includes(operation))
            return deny(entity.role === "resume"
                ? "Resume requires a paused programme."
                : "This action requires a ready or finished appliance.");
        if (permission(appliance, states, "remote_start") === "no")
            return deny("Remote start is disabled, unknown or unavailable.");
        if (remoteControl === "no")
            return deny("Remote control is disabled, unknown or unavailable.");
        const unverified = remoteControl === "unverified" ||
            permission(appliance, states, "remote_start") === "unverified";
        return allowed(true, unverified
            ? "Remote permission is unverified; this action may start the appliance. Confirm before proceeding."
            : "This action may start the appliance. Confirm before proceeding.");
    }
    return allowed();
}
async function executeAction(hass, appliance, action, confirmed) {
    if (!hass.connection.connected)
        throw new Error("Home Assistant is disconnected. Reconnect before controlling this appliance.");
    const policy = actionPolicy(appliance, hass.states, action);
    if (!policy.allowed)
        throw new Error(policy.reason ?? "This action is not permitted.");
    if (policy.confirmation && !confirmed)
        throw new Error(policy.reason ?? "Confirm this action before proceeding.");
    if (!hass.callService)
        throw new Error("Home Assistant service calls are unavailable.");
    const domain = action.entityId.split(".")[0];
    const data = { entity_id: action.entityId };
    let service;
    if (domain === "button")
        service = "press";
    else if (domain === "select") {
        service = "select_option";
        data.option = action.value;
    }
    else if (domain === "number") {
        service = "set_value";
        data.value = action.value;
    }
    else
        service = action.value ? "turn_on" : "turn_off";
    await hass.callService(domain, service, data);
}

const UPDATE_EVENTS = [
    "entity_registry_updated",
    "device_registry_updated",
    "area_registry_updated",
    "label_registry_updated",
];
const sharedByConnection = new WeakMap();
function errorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string") {
        return error.message;
    }
    return String(error);
}
function isUnsupportedCommand(error) {
    return (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "unknown_command");
}
class SharedRegistryWatcher {
    constructor(connection) {
        this.connection = connection;
        this.callbacks = new Set();
        this.subscriptions = new Map(UPDATE_EVENTS.map((eventType) => [eventType, { pending: false }]));
        this.generation = 0;
        this.stopped = false;
        this.handleDisconnected = () => {
            this.connected = false;
            this.generation += 1;
            this.snapshot = undefined;
            this.fetchError = undefined;
            this.publish({ disconnected: true });
        };
        this.handleReady = () => {
            if (this.stopped)
                return;
            this.connected = true;
            // Missed registry events are not replayed after HA restores the socket.
            this.snapshot = undefined;
            this.fetchError = undefined;
            this.publish({});
            void this.refresh();
        };
        this.connected = connection.connected;
        connection.addEventListener("disconnected", this.handleDisconnected);
        connection.addEventListener("ready", this.handleReady);
        if (this.connected)
            void this.refresh();
        else
            this.handleDisconnected();
    }
    ensureSubscriptions() {
        for (const eventType of UPDATE_EVENTS) {
            const subscription = this.subscriptions.get(eventType);
            if (subscription.pending || subscription.unsubscribe)
                continue;
            subscription.pending = true;
            void this.connection
                .subscribeEvents(() => {
                void this.refresh();
            }, eventType)
                .then((unsubscribe) => {
                subscription.pending = false;
                if (this.stopped) {
                    unsubscribe();
                    return;
                }
                subscription.unsubscribe = unsubscribe;
                subscription.error = undefined;
                this.publishCurrent();
            })
                .catch((error) => {
                subscription.pending = false;
                if (this.stopped)
                    return;
                subscription.error = errorMessage(error);
                this.publishCurrent();
            });
        }
    }
    add(callback) {
        this.callbacks.add(callback);
        if (this.value)
            callback(this.value);
        let active = true;
        return () => {
            if (!active)
                return;
            active = false;
            this.callbacks.delete(callback);
            if (this.callbacks.size === 0)
                this.destroy();
        };
    }
    async refresh() {
        if (this.stopped)
            return;
        if (!this.connected || !this.connection.connected) {
            this.handleDisconnected();
            return;
        }
        // HA restores successful and pending subscriptions itself. Only retry failures.
        this.ensureSubscriptions();
        const generation = ++this.generation;
        const send = (type) => this.connection.sendMessagePromise({ type });
        const entities = send("config/entity_registry/list");
        const devices = send("config/device_registry/list");
        const areas = send("config/area_registry/list");
        const labels = send("config/label_registry/list").catch((error) => {
            if (isUnsupportedCommand(error))
                return [];
            throw error;
        });
        try {
            const [resolvedEntities, resolvedDevices, resolvedAreas, resolvedLabels] = await Promise.all([entities, devices, areas, labels]);
            if (generation !== this.generation || this.stopped)
                return;
            this.snapshot = {
                entities: resolvedEntities,
                devices: resolvedDevices,
                areas: resolvedAreas,
                labels: resolvedLabels,
            };
            this.fetchError = undefined;
            this.publishCurrent();
        }
        catch (error) {
            if (generation !== this.generation || this.stopped)
                return;
            this.fetchError = errorMessage(error);
            this.publishCurrent();
        }
    }
    publishCurrent() {
        if (!this.connected || !this.connection.connected) {
            this.publish({ disconnected: true });
            return;
        }
        const subscriptionError = [...this.subscriptions.values()].find((state) => state.error)?.error;
        const error = subscriptionError ?? this.fetchError;
        if (error)
            this.publish({ error });
        else if (this.snapshot)
            this.publish({ snapshot: this.snapshot });
    }
    publish(value) {
        if (this.stopped)
            return;
        this.value = value;
        for (const callback of this.callbacks)
            callback(value);
    }
    destroy() {
        if (this.stopped)
            return;
        this.stopped = true;
        this.generation += 1;
        this.connection.removeEventListener("disconnected", this.handleDisconnected);
        this.connection.removeEventListener("ready", this.handleReady);
        for (const subscription of this.subscriptions.values()) {
            subscription.unsubscribe?.();
            subscription.unsubscribe = undefined;
        }
        sharedByConnection.delete(this.connection);
    }
}
function watchRegistries(hass, callback) {
    let watcher = sharedByConnection.get(hass.connection);
    if (!watcher) {
        watcher = new SharedRegistryWatcher(hass.connection);
        sharedByConnection.set(hass.connection, watcher);
    }
    return watcher.add(callback);
}
/** Explicit retry also recovers subscriptions that failed during startup. */
function refreshRegistries(hass) {
    void sharedByConnection.get(hass.connection)?.refresh();
}

const styles = i$3 `
  :host {
    display: block;
    --ap-accent: var(--primary-color, #2563eb);
    --ap-bg: var(--ha-card-background, var(--card-background-color, #fff));
    --ap-surface: var(--secondary-background-color, #f3f5f8);
    --ap-text: var(--primary-text-color, #192435);
    --ap-muted: var(--secondary-text-color, #607086);
    --ap-border: var(--divider-color, #dce2eb);
    --ap-radius: 20px;
    --ap-icon-radius: 15px;
    --ap-button-radius: 12px;
    --ap-icon-bg: var(--ap-surface);
    --ap-button-bg: var(--ap-surface);
    --ap-card-border: 1px solid var(--ap-border);
    --ap-shadow: none;
    --ap-error: #b42330;
    --ap-warning: #9b5900;
    color: var(--ap-text);
    font-family: var(--paper-font-body1_-_font-family, system-ui, sans-serif);
  }
  :host([appearance="bubble"]) {
    --ap-bg: var(
      --bubble-main-background-color,
      var(--card-background-color, #fff)
    );
    --ap-surface: var(
      --bubble-secondary-background-color,
      var(--secondary-background-color, #f1f4f8)
    );
    --ap-accent: var(--bubble-accent-color, var(--primary-color, #2563eb));
    --ap-radius: var(--bubble-border-radius, 28px);
    --ap-icon-radius: var(--bubble-icon-border-radius, 15px);
    --ap-button-radius: var(--bubble-sub-button-border-radius, 12px);
    --ap-icon-bg: var(--bubble-icon-background-color, var(--ap-surface));
    --ap-button-bg: var(
      --bubble-sub-button-background-color,
      var(--ap-surface)
    );
    --ap-card-border: var(--bubble-border, 1px solid var(--ap-border));
    --ap-shadow: var(--bubble-box-shadow, none);
  }
  * {
    box-sizing: border-box;
  }
  ha-card {
    display: block;
    background: var(--ap-bg);
    border: var(--ap-card-border);
    border-radius: var(--ap-radius);
    box-shadow: var(--ap-shadow);
    padding: 20px;
    overflow: hidden;
  }
  header {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    margin-bottom: 16px;
  }
  .heading {
    flex: 1;
    min-width: 0;
  }
  h2 {
    font-size: 1.1rem;
    line-height: 1.35;
    margin: 0;
    overflow-wrap: anywhere;
  }
  h3 {
    font-size: 0.82rem;
    letter-spacing: 0.03em;
    margin: 0 0 12px;
    font-weight: 650;
    color: var(--ap-muted);
  }
  .eyebrow {
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ap-muted);
    margin: 0 0 5px;
  }
  .icon {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: var(--ap-icon-radius);
    color: var(--ap-accent);
    background: var(--ap-icon-bg);
  }
  .icon ha-icon {
    --mdc-icon-size: 24px;
  }
  .status {
    font-size: 0.78rem;
    color: var(--ap-muted);
    margin-top: 3px;
  }
  .badge {
    padding: 4px 9px;
    border-radius: 12px;
    font-size: 0.75rem;
    background: var(--ap-surface);
    white-space: nowrap;
  }
  section {
    margin-top: 18px;
  }
  .surface {
    padding: 14px;
    background: var(--ap-surface);
    border-radius: 16px;
  }
  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(170px, 100%), 1fr));
    gap: 12px;
  }
  .control {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-width: 0;
  }
  .control > span {
    font-size: 0.8rem;
    color: var(--ap-muted);
    overflow-wrap: anywhere;
  }
  input,
  select,
  button {
    font: inherit;
    color: var(--ap-text);
  }
  input,
  select {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    min-height: 42px;
    padding: 8px 10px;
    border: 1px solid var(--ap-border);
    border-radius: 10px;
    background: var(--ap-bg);
  }
  button {
    min-height: 40px;
    padding: 9px 13px;
    border: 1px solid var(--ap-border);
    background: var(--ap-button-bg);
    border-radius: var(--ap-button-radius);
    cursor: pointer;
    overflow-wrap: anywhere;
  }
  button:hover:enabled {
    filter: brightness(0.96);
  }
  button:disabled,
  input:disabled,
  select:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
  button.primary {
    background: var(--ap-accent);
    color: #fff;
    border-color: transparent;
  }
  button.danger {
    background: #b42330;
    color: #fff;
    border-color: transparent;
  }
  .transport,
  .dialog-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    margin-top: 16px;
  }
  .transport button {
    flex: 1;
  }
  .feedback {
    font-size: 0.84rem;
    border-left: 3px solid var(--ap-error);
    padding: 10px 12px;
    color: var(--ap-error);
    overflow-wrap: anywhere;
  }
  .muted,
  .note {
    font-size: 0.78rem;
    color: var(--ap-muted);
    line-height: 1.5;
  }
  .note {
    margin: 10px 0 0;
  }
  .reading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    font-size: 0.86rem;
    min-width: 0;
    padding: 7px 0;
  }
  .reading span {
    overflow-wrap: anywhere;
  }
  .reading strong {
    font-weight: 550;
    overflow-wrap: anywhere;
    text-align: right;
  }
  .progress-head {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
    overflow-wrap: anywhere;
  }
  .progress-head strong {
    font-size: 1.3rem;
    font-weight: 550;
  }
  .progress-head span {
    color: var(--ap-muted);
    font-size: 0.8rem;
  }
  progress {
    display: block;
    width: 100%;
    height: 8px;
    accent-color: var(--ap-accent);
    border: 0;
    border-radius: 10px;
    overflow: hidden;
  }
  progress::-webkit-progress-bar {
    background: var(--ap-border);
  }
  progress::-webkit-progress-value {
    background: var(--ap-accent);
    border-radius: 10px;
  }
  .phase {
    margin-top: 8px;
    font-size: 0.8rem;
    color: var(--ap-muted);
  }
  .attention {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 8px;
  }
  .attention li {
    border-radius: 10px;
    background: var(--ap-surface);
    padding: 10px 12px;
    font-size: 0.82rem;
    overflow-wrap: anywhere;
    border-left: 3px solid var(--ap-warning);
  }
  .attention li.error {
    border-left-color: var(--ap-error);
  }
  .attention li.unknown {
    border-left-color: var(--ap-muted);
  }
  .row {
    width: 100%;
    display: flex;
    text-align: left;
    align-items: center;
    gap: 12px;
    padding: 12px;
    margin-bottom: 8px;
    background: var(--ap-surface);
    border: 0;
  }
  .row .heading {
    display: block;
  }
  .row strong {
    display: block;
    font-size: 0.87rem;
    font-weight: 600;
  }
  .row small {
    display: block;
    color: var(--ap-muted);
    margin-top: 4px;
  }
  .row .end {
    font-size: 0.8rem;
    white-space: nowrap;
  }
  .quiet {
    padding: 12px 0;
    color: var(--ap-muted);
    font-size: 0.87rem;
  }
  details {
    margin-top: 16px;
    border-top: 1px solid var(--ap-border);
    padding-top: 12px;
  }
  summary {
    cursor: pointer;
    font-size: 0.86rem;
    color: var(--ap-muted);
    padding: 4px 0 10px;
  }
  .compact {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    text-align: left;
    background: none;
    border: 0;
    padding: 0;
  }
  .compact .heading {
    flex: 1;
  }
  .compact .status {
    display: block;
  }
  dialog {
    color: var(--ap-text);
    background: var(--ap-bg);
    border: 1px solid var(--ap-border);
    border-radius: var(--ap-radius);
    width: min(560px, calc(100vw - 24px));
    max-width: calc(100vw - 24px);
    max-height: calc(100dvh - 32px);
    padding: 22px;
    overflow: auto;
  }
  dialog::backdrop {
    background: #10182780;
  }
  dialog h2 {
    padding-right: 10px;
  }
  .dialog-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 15px;
  }
  .dialog-actions {
    justify-content: flex-end;
  }
  .icon-button {
    flex: none;
    min-width: 40px;
    padding: 8px;
  }
  .empty {
    font-size: 0.85rem;
    color: var(--ap-muted);
  }
  .permission {
    font-size: 0.77rem;
    color: var(--ap-muted);
    margin-top: 10px;
  }
  .control.switch {
    flex-direction: row;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .switch input {
    width: 22px;
    height: 22px;
    min-height: 0;
    accent-color: var(--ap-accent);
  }
  a {
    color: var(--ap-accent);
  }
  @media (max-width: 380px) {
    ha-card {
      padding: 15px;
    }
    header {
      gap: 9px;
    }
    .icon {
      width: 38px;
      height: 38px;
    }
    dialog {
      padding: 16px;
    }
    .controls {
      grid-template-columns: 1fr;
    }
    .badge {
      font-size: 0.69rem;
    }
    .row .end {
      white-space: normal;
      text-align: right;
    }
  }
`;

const labels = {
    off: "Off",
    ready: "Ready",
    delayed: "Delayed start",
    running: "Running",
    paused: "Paused",
    finished: "Finished",
    error: "Error",
    action_required: "Needs attention",
    aborting: "Stopping",
    offline: "Offline",
    unknown: "Status unknown",
};
const kindNames = {
    oven: "Oven",
    dishwasher: "Dishwasher",
    coffee: "Coffee machine",
    cooling: "Refrigerator",
    washer: "Washer",
    dryer: "Dryer",
    unknown: "Appliance",
};
const icons = {
    oven: "mdi:stove",
    dishwasher: "mdi:dishwasher",
    coffee: "mdi:coffee-maker",
    cooling: "mdi:fridge-outline",
    washer: "mdi:washing-machine",
    dryer: "mdi:tumble-dryer",
    unknown: "mdi:home-outline",
};
function duration(seconds) {
    if (seconds === undefined || !Number.isFinite(seconds))
        return "Time unknown";
    const mins = Math.ceil(Math.max(0, seconds) / 60);
    return mins >= 60
        ? `${Math.floor(mins / 60)} h${mins % 60 ? ` ${mins % 60} min` : ""}`
        : `${mins} min`;
}
function titleCase(value) {
    return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function moduleOf(entity) {
    const key = semanticKey(entity.registry) ||
        entity.entityId
            .toLowerCase()
            .match(/(?:^|_)((?:microwave_power|micro_wave_power|steam_level|added_steam|water_tank)(?:_\d+)?)$/)?.[1] ||
        "";
    return /microwave|micro_wave/.test(key)
        ? "microwave"
        : /steam|water_tank/.test(key)
            ? "steam"
            : undefined;
}
class ApplianceCard extends i {
    constructor() {
        super(...arguments);
        this.registry = {};
        this.epoch = 0;
        this.busy = false;
        this.error = "";
        this.notice = "";
    }
    set hass(value) {
        const replaced = this.ha?.connection !== value.connection;
        this.ha = value;
        if (replaced) {
            this.unsubscribe?.();
            this.unsubscribe = undefined;
            this.invalidate();
            if (this.isConnected)
                this.watch();
        }
        this.requestUpdate();
    }
    get hass() {
        return this.ha;
    }
    setConfig(value) {
        const next = validateConfig(value);
        if (this.config &&
            (this.config.device !== next.device ||
                this.config.type !== next.type ||
                JSON.stringify(this.config.devices) !== JSON.stringify(next.devices) ||
                this.config.area !== next.area)) {
            this.closeDialogs();
            this.pending = undefined;
            this.detailId = undefined;
            this.error = "";
            this.notice = "";
            this.epoch++;
        }
        this.config = next;
        this.setAttribute("appearance", next.appearance);
        this.requestUpdate();
    }
    getCardSize() {
        return this.config?.expand === false ? 1 : this.isOverview ? 4 : 6;
    }
    connectedCallback() {
        super.connectedCallback();
        this.watch();
        this.timer = setInterval(() => this.requestUpdate(), 15000);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.unsubscribe?.();
        this.unsubscribe = undefined;
        clearInterval(this.timer);
        this.closeDialogs();
        this.invalidate();
    }
    get isOverview() {
        return this.config?.type.replace("custom:", "") === "kitchen-panel-card";
    }
    watch() {
        if (this.ha && !this.unsubscribe)
            this.unsubscribe = watchRegistries(this.ha, (value) => {
                this.epoch++;
                this.registry = value;
                if (!value.snapshot) {
                    this.pending = undefined;
                    this.closeDialogs();
                }
                this.requestUpdate();
            });
    }
    invalidate() {
        this.registry = {};
        this.epoch++;
        this.pending = undefined;
        this.closeDialogs();
    }
    closeDialogs() {
        this.shadowRoot?.querySelectorAll("dialog").forEach((d) => d.close());
    }
    selection() {
        if (!this.registry.snapshot || !this.ha || !this.config)
            return { devices: [] };
        return selectAppliances(discoverAppliances(this.registry.snapshot, this.ha.states), this.config, this.registry.snapshot);
    }
    kind(device) {
        return CARD_KINDS[this.config.type.replace("custom:", "")] === undefined || this.config.type.endsWith("appliance-card")
            ? device.kind
            : CARD_KINDS[this.config.type.replace("custom:", "")];
    }
    status(device) {
        return applianceStatus(device, this.ha.states, Date.now());
    }
    statusLabel(device) {
        const status = this.status(device);
        return this.kind(device) === "cooling" &&
            status.online === "online" &&
            status.operation === "unknown"
            ? "Cooling"
            : labels[status.operation];
    }
    reading(entity) {
        const state = this.ha?.states[entity.entityId];
        if (!state)
            return "Not reported";
        if (state.state === "unavailable")
            return "Unavailable";
        if (state.state === "unknown")
            return "Unknown";
        const value = state.attributes.device_class === "door"
            ? state.state === "on"
                ? "Open"
                : state.state === "off"
                    ? "Closed"
                    : titleCase(state.state)
            : titleCase(state.state);
        return `${value}${state.attributes.unit_of_measurement ? ` ${state.attributes.unit_of_measurement}` : ""}`;
    }
    signature(device, action) {
        return JSON.stringify([
            this.status(device).operation,
            device.entities
                .filter((e) => [
                "selected_program",
                "active_program",
                "remote_start",
                "remote_control",
                "connection",
            ].includes(e.role) || e.entityId === action.entityId)
                .map((e) => [
                e.entityId,
                this.ha?.states[e.entityId]?.state,
                this.ha?.states[e.entityId]?.attributes.options,
            ]),
        ]);
    }
    async requestAction(device, action) {
        if (this.busy)
            return;
        this.error = "";
        this.notice = "";
        const policy = actionPolicy(device, this.ha.states, action);
        if (!policy.allowed) {
            this.error = policy.reason ?? "This control is unavailable.";
            this.requestUpdate();
            return;
        }
        if (policy.confirmation && this.config.confirm_start) {
            this.pending = {
                deviceId: device.id,
                reason: policy.reason,
                action,
                epoch: this.epoch,
                signature: this.signature(device, action),
                label: device.entities.find((e) => e.entityId === action.entityId)?.name ??
                    "Action",
            };
            this.requestUpdate();
            await this.updateComplete;
            this.shadowRoot
                ?.querySelector("#confirmation")
                ?.showModal();
            return;
        }
        await this.perform(device, action, true);
    }
    async perform(device, action, confirmed) {
        this.busy = true;
        this.error = "";
        this.requestUpdate();
        try {
            if (!this.registry.snapshot ||
                this.registry.disconnected ||
                this.registry.error)
                throw new Error("Device discovery is unavailable. Try again after reconnecting.");
            await executeAction(this.ha, device, action, confirmed);
            this.notice = "Command sent. Waiting for appliance status.";
        }
        catch (error) {
            this.error = error instanceof Error ? error.message : String(error);
        }
        finally {
            this.busy = false;
            this.requestUpdate();
        }
    }
    async confirm() {
        const pending = this.pending;
        this.pending = undefined;
        this.shadowRoot?.querySelector("#confirmation")?.close();
        if (!pending)
            return;
        const device = this.selection().devices.find((d) => d.id === pending.deviceId);
        if (!device ||
            pending.epoch !== this.epoch ||
            pending.signature !== this.signature(device, pending.action)) {
            this.error =
                "The appliance changed. Review its current status and try again.";
            this.requestUpdate();
            return;
        }
        await this.perform(device, pending.action, true);
    }
    cancelConfirm() {
        this.pending = undefined;
        this.shadowRoot?.querySelector("#confirmation")?.close();
        this.requestUpdate();
    }
    async openDetails(device) {
        this.detailId = device.id;
        this.requestUpdate();
        await this.updateComplete;
        this.shadowRoot?.querySelector("#details")?.showModal();
    }
    retry() {
        this.registry = {};
        this.error = "";
        this.epoch++;
        if (this.ha)
            refreshRegistries(this.ha);
        this.requestUpdate();
    }
    control(device, entity) {
        const state = this.ha.states[entity.entityId];
        const domain = entity.entityId.split(".")[0];
        const unavailable = !state ||
            state.state === "unavailable" ||
            (state.state === "unknown" &&
                domain !== "button" &&
                !(domain === "select" &&
                    entity.role === "selected_program" &&
                    Array.isArray(state.attributes.options) &&
                    state.attributes.options.length));
        const sample = domain === "select"
            ? String(state?.attributes.options?.[0] ?? "")
            : domain === "number"
                ? Number(state?.attributes.min)
                : domain === "switch"
                    ? state?.state !== "on"
                    : undefined;
        const policy = actionPolicy(device, this.ha.states, {
            entityId: entity.entityId,
            value: sample,
        });
        const disabled = this.busy || unavailable || !policy.allowed;
        const reason = unavailable ? "Unavailable" : policy.reason;
        const act = (value) => void this.requestAction(device, { entityId: entity.entityId, value });
        if (domain === "select" && Array.isArray(state?.attributes.options))
            return b `<label class="control"
        ><span>${entity.name}</span
        ><select
          data-entity=${entity.entityId}
          aria-label=${entity.name}
          .value=${state.state}
          ?disabled=${disabled}
          title=${reason ?? ""}
          @change=${(e) => {
                act(e.target.value);
                e.target.value = state.state;
            }}
        >
          ${!state.attributes.options.includes(state.state) ? b `<option value=${state.state}>${this.reading(entity)}</option>` : A}${state.attributes.options.map((option) => b `<option value=${option} ?selected=${option === state.state}>${titleCase(option)}</option>`)}</select
        >${!policy.allowed && reason ? b `<small class="muted">${reason}</small>` : A}</label
      >`;
        if (domain === "number")
            return b `<label class="control"
        ><span
          >${entity.name}${state?.attributes.unit_of_measurement ? ` · ${state.attributes.unit_of_measurement}` : ""}</span
        ><input
          data-entity=${entity.entityId}
          aria-label=${entity.name}
          type="number"
          .value=${!unavailable ? state.state : ""}
          min=${state?.attributes.min ?? ""}
          max=${state?.attributes.max ?? ""}
          step=${state?.attributes.step ?? "any"}
          ?disabled=${disabled}
          title=${reason ?? ""}
          @change=${(e) => {
                const input = e.target;
                if (input.value !== "" && input.reportValidity())
                    act(Number(input.value));
                else
                    this.error = "Enter a valid value within the appliance limits.";
                this.requestUpdate();
            }}
        />${!policy.allowed && reason ? b `<small class="muted">${reason}</small>` : A}</label
      >`;
        if (domain === "switch")
            return b `<label class="control switch"
        ><span>${entity.name}</span
        ><input
          data-entity=${entity.entityId}
          aria-label=${entity.name}
          type="checkbox"
          .checked=${state?.state === "on"}
          ?disabled=${disabled}
          title=${reason ?? ""}
          @change=${(e) => {
                act(e.target.checked);
                e.target.checked = state?.state === "on";
            }}
        />${!policy.allowed && reason ? b `<small class="muted">${reason}</small>` : A}</label
      >`;
        if (domain === "button")
            return b `<button
        data-entity=${entity.entityId}
        ?disabled=${disabled}
        title=${reason ?? ""}
        @click=${() => act()}
      >
        ${entity.name}
      </button>`;
        return b `<div class="reading" data-reading=${entity.entityId}>
      <span>${entity.name}</span><strong>${this.reading(entity)}</strong>
    </div>`;
    }
    group(device, title, entities, section) {
        return entities.length
            ? b `<section data-section=${section ?? ""}>
          <h3>${title}</h3>
          <div class="controls">
            ${entities.map((entity) => this.control(device, entity))}
          </div>
        </section>`
            : A;
    }
    transport(device, status) {
        const roles = status.operation === "running"
            ? ["pause", "abort"]
            : status.operation === "paused"
                ? ["resume", "abort"]
                : ["delayed", "error", "action_required", "aborting"].includes(status.operation)
                    ? ["abort"]
                    : ["ready", "finished", "off"].includes(status.operation)
                        ? ["start"]
                        : [];
        const entities = device.entities.filter((e) => roles.includes(e.role));
        return b `<div class="transport">
        ${entities.map((entity) => {
            const policy = actionPolicy(device, this.ha.states, {
                entityId: entity.entityId,
            });
            return b `<button
            data-role=${entity.role}
            class=${entity.role === "abort" ? "danger" : entity.role === "start" ? "primary" : ""}
            ?disabled=${this.busy || !policy.allowed}
            title=${policy.reason ?? ""}
            @click=${() => this.requestAction(device, { entityId: entity.entityId })}
          >
            ${entity.role === "abort" ? "Stop" : titleCase(entity.role)}
          </button>`;
        })}
      </div>
      ${entities.map((entity) => {
            const policy = actionPolicy(device, this.ha.states, {
                entityId: entity.entityId,
            });
            return !policy.allowed && policy.reason
                ? b `<p class="permission">${policy.reason}</p>`
                : A;
        })}`;
    }
    attention(device, status) {
        return status.attention.length
            ? b `<section>
          <h3>Needs attention</h3>
          <ul class="attention">
            ${status.attention.map((item) => b `<li class=${item.severity}>${item.message}</li>`)}
          </ul>
        </section>`
            : A;
    }
    feedback() {
        return b `${this.error ? b `<p class="feedback" role="alert">${this.error}</p>` : A}${this.notice ? b `<p class="note" role="status">${this.notice}</p>` : A}`;
    }
    deviceBody(device) {
        const kind = this.kind(device);
        const status = this.status(device);
        const roles = (...values) => device.entities.filter((e) => values.includes(e.role));
        const modules = this.config?.oven_modules ?? "auto";
        const moduleEntries = (which) => kind === "oven" &&
            (modules === "auto" ||
                (Array.isArray(modules) && modules.includes(which)))
            ? device.entities.filter((e) => moduleOf(e) === which)
            : [];
        const moduleCandidates = new Set(kind === "oven"
            ? device.entities.filter((e) => moduleOf(e)).map((e) => e.entityId)
            : []);
        const options = roles("option").filter((e) => !moduleCandidates.has(e.entityId));
        const picker = ["ready", "off", "finished"].includes(status.operation);
        return b `
      ${status.operation === "error" || status.operation === "action_required" ? b `<p class="feedback" role="alert">${labels[status.operation]}</p>` : A}
      ${kind !== "cooling"
            ? b `${picker
                ? this.group(device, kind === "coffee" ? "Choose your drink" : "Programme", roles("selected_program"), "programme")
                : b `<section class="surface">
                    <div class="progress-head">
                      <div>
                        <strong
                          >${status.operation === "delayed" ? duration(status.delaySeconds) : duration(status.remainingSeconds)}</strong
                        ><br /><span
                          >${status.operation === "delayed" ? "Until start" : status.operation === "paused" ? "Paused · remaining" : "Remaining"}</span
                        >
                      </div>
                      <span
                        >${status.program ? titleCase(status.program) : labels[status.operation]}</span
                      >
                    </div>
                    ${status.progress !== undefined ? b `<progress max="100" value=${status.progress} aria-label="Programme progress"></progress>` : A}${status.phase ? b `<div class="phase">${titleCase(status.phase)}</div>` : A}
                  </section>`}${status.operation === "finished" && status.finishedAt ? b `<p class="note">Finished ${duration((Date.now() - Date.parse(status.finishedAt)) / 1000)} ago</p>` : A}${this.transport(device, status)}`
            : A}
      ${kind === "oven"
            ? b `${this.group(device, "Oven", roles("target_temperature", "current_temperature", "duration"), "oven")}${["microwave", "steam"].map((which) => moduleEntries(which).length
                ? b `<section data-module=${which}>
                    <h3>${which === "microwave" ? "Microwave" : "Steam"}</h3>
                    <div class="controls">
                      ${moduleEntries(which).map((e) => this.control(device, e))}
                    </div>
                  </section>`
                : A)}`
            : A}
      ${kind === "cooling" ? b `${this.group(device, "Temperature zones", roles("cooling_setpoint", "target_temperature", "current_temperature"), "cooling")}${this.group(device, "Doors", roles("door"))}${this.group(device, "Cooling modes", roles("super_mode", "vacation"), "cooling-modes")}` : A}
      ${kind === "coffee" ? this.group(device, "Your coffee", options, "coffee") : kind === "dishwasher" ? this.group(device, "Wash options", options, "dishwasher") : kind !== "oven" && kind !== "cooling" ? this.group(device, "Programme options", options) : A}
      ${kind !== "cooling" ? this.group(device, "Door & temperature", roles("door", ...(kind !== "oven" ? ["current_temperature"] : []))) : A}
      ${status.busy ? this.group(device, "Programme timing", roles("elapsed")) : A}
      ${this.attention(device, status)}
      ${roles("attention").filter((e) => !moduleCandidates.has(e.entityId))
            .length
            ? b `<details>
              <summary>Consumables & care</summary>
              ${roles("attention")
                .filter((e) => !moduleCandidates.has(e.entityId))
                .map((e) => this.control(device, e))}
            </details>`
            : A}
      <details>
        <summary>Settings</summary>
        <div class="controls">
          ${roles("power", "child_lock", "remote_control", "start_delay").map((e) => this.control(device, e))}${kind === "oven" || kind === "cooling" ? options.map((e) => this.control(device, e)) : A}${kind !== "oven" && kind !== "cooling" ? roles("target_temperature", "duration").map((e) => this.control(device, e)) : A}
        </div>
        ${!roles("remote_start").length ? b `<p class="permission">Remote-start permission is not exposed. The appliance must permit remote operation.</p>` : roles("remote_start").map((e) => b `<div class="reading"><span>Remote start</span><strong>${this.reading(e)}</strong></div>`)}
      </details>
      ${roles("other").filter((e) => !moduleCandidates.has(e.entityId)).length
            ? b `<details>
              <summary>
                Other ·
                ${roles("other").filter((e) => !moduleCandidates.has(e.entityId)).length}
              </summary>
              <div class="controls">
                ${roles("other")
                .filter((e) => !moduleCandidates.has(e.entityId))
                .map((e) => this.control(device, e))}
              </div>
            </details>`
            : A}
      ${device.disabledCount ? b `<p class="note"><a href="/config/entities">${device.disabledCount} disabled ${device.disabledCount === 1 ? "entity" : "entities"}</a> · enable needed capabilities in Home Assistant.</p>` : A}
      ${status.online !== "online" && status.lastReported ? b `<p class="note">Last reported: ${new Date(status.lastReported).toLocaleString(this.ha?.language)}</p>` : A}
    `;
    }
    heading(device) {
        const kind = this.kind(device);
        return b `<header>
      <div class="icon"><ha-icon icon=${icons[kind]}></ha-icon></div>
      <div class="heading">
        <div class="eyebrow">${kindNames[kind]}</div>
        <h2>
          ${!this.isOverview ? (this.config?.title ?? device.name) : device.name}
        </h2>
        <div class="status">${this.statusLabel(device)}</div>
      </div>
      ${device.entities
            .filter((e) => e.role === "power")
            .slice(0, 1)
            .map((e) => b `<span class="badge">${this.reading(e)}</span>`)}
    </header>`;
    }
    compact(device) {
        const status = this.status(device);
        return b `<button
      class="compact"
      @click=${() => this.openDetails(device)}
    >
      <span class="icon"
        ><ha-icon icon=${icons[this.kind(device)]}></ha-icon></span
      ><span class="heading"
        ><strong>${this.config?.title ?? device.name}</strong
        ><span class="status"
          >${this.statusLabel(device)}${status.busy ? ` · ${duration(status.remainingSeconds)}` : ""}</span
        ></span
      ><span aria-hidden="true">›</span>
    </button>`;
    }
    overview(devices) {
        const busy = devices
            .map((device) => ({ device, status: this.status(device) }))
            .filter((v) => v.status.busy)
            .sort((a, b) => (a.status.estimatedFinish ?? Infinity) -
            (b.status.estimatedFinish ?? Infinity) ||
            a.device.name.localeCompare(b.device.name));
        const alerts = devices.flatMap((device) => this.status(device).attention.map((item) => ({ device, item })));
        const unobserved = devices.filter((d) => d.kind === "cooling"
            ? this.status(d).online !== "online"
            : ["offline", "unknown"].includes(this.status(d).operation));
        return b `<header>
        <div class="icon">
          <ha-icon icon="mdi:silverware-fork-knife"></ha-icon>
        </div>
        <div class="heading">
          <div class="eyebrow">Home Connect Local</div>
          <h2>${this.config?.title ?? "Kitchen"}</h2>
        </div>
        <span class="badge">${devices.length} appliances</span>
      </header>
      <section>
        <h3>In progress</h3>
        ${busy.length
            ? busy.map(({ device, status }) => b `<button
                    class="row"
                    data-busy=${device.id}
                    @click=${() => this.openDetails(device)}
                  >
                    <span class="icon"
                      ><ha-icon icon=${icons[device.kind]}></ha-icon></span
                    ><span class="heading"
                      ><strong>${device.name}</strong
                      ><small
                        >${labels[status.operation]}${status.program ? ` · ${titleCase(status.program)}` : ""}</small
                      ></span
                    ><span class="end"
                      >${status.operation === "delayed" ? `Starts in ${duration(status.delaySeconds)}` : duration(status.remainingSeconds)}</span
                    >
                  </button>`)
            : b `<p class="quiet">
                ${unobserved.length ? "No running programmes reported. Some appliance states are unavailable." : "Nothing is running."}
              </p>`}
      </section>
      <section>
        <h3>Needs attention</h3>
        ${alerts.length
            ? b `<ul class="attention">
                ${alerts.map(({ device, item }) => b `<li class=${item.severity}>
                      <button
                        class="row"
                        @click=${() => this.openDetails(device)}
                      >
                        <span
                          ><strong>${device.name}</strong
                          ><small>${item.message}</small></span
                        >
                      </button>
                    </li>`)}
              </ul>`
            : b `<p class="quiet">
                ${unobserved.length ? "Some appliance states are unavailable." : "All clear."}
              </p>`}${unobserved.filter((d) => !alerts.some((a) => a.device.id === d.id && a.item.severity === "unknown")).map((device) => b `<p class="note">${device.name}: ${this.statusLabel(device)}</p>`)}
      </section>
      <details>
        <summary>All appliances</summary>
        ${devices.map((device) => b `<button class="row" @click=${() => this.openDetails(device)}>
              <span class="heading"
                ><strong>${device.name}</strong
                ><small>${this.statusLabel(device)}</small></span
              ><span>›</span>
            </button>`)}
      </details>
      ${devices.some((d) => d.disabledCount) ? b `<p class="note" data-disabled-count><a href="/config/entities">${devices.reduce((sum, d) => sum + d.disabledCount, 0)} disabled entities</a> across these appliances.</p>` : A}`;
    }
    render() {
        if (!this.config)
            return A;
        const { devices, error } = this.selection();
        const individual = devices.length === 1 ? devices[0] : undefined;
        const detail = devices.find((d) => d.id === this.detailId);
        return b `<ha-card
        >${this.registry.disconnected
            ? b `<p role="status">Disconnected from Home Assistant.</p>`
            : this.registry.error
                ? b `<p class="feedback" role="alert">${this.registry.error}</p>
                  <button @click=${this.retry}>Retry discovery</button>`
                : !this.registry.snapshot
                    ? b `<p class="quiet">Finding your appliances…</p>`
                    : error
                        ? b `<p class="feedback" role="alert">${error}</p>`
                        : this.isOverview
                            ? this.overview(devices)
                            : individual
                                ? this.config.expand
                                    ? b `${this.heading(individual)}${this.deviceBody(individual)}`
                                    : this.compact(individual)
                                : b `<p class="empty">
                          No matching Home Connect Local appliance.
                        </p>`}${this.feedback()}</ha-card
      >
      <dialog
        id="details"
        @click=${(e) => {
            if (e.target === e.currentTarget) {
                const r = e.currentTarget.getBoundingClientRect();
                if (e.clientX < r.left ||
                    e.clientX > r.right ||
                    e.clientY < r.top ||
                    e.clientY > r.bottom)
                    e.currentTarget.close();
            }
        }}
      >
        <div class="dialog-head">
          <h2>${detail?.name ?? "Appliance"}</h2>
          <button
            class="icon-button"
            aria-label="Close details"
            @click=${() => this.shadowRoot?.querySelector("#details")?.close()}
          >
            ✕
          </button>
        </div>
        ${detail ? this.deviceBody(detail) : A}${this.feedback()}
      </dialog>
      <dialog id="confirmation" @cancel=${this.cancelConfirm}>
        <h2>Confirm appliance command</h2>
        <p>
          ${this.pending?.label}${this.pending?.action.value !== undefined ? `: ${titleCase(String(this.pending.action.value))}` : ""}
        </p>
        <p class="note">
          This may start the appliance. Check that it is ready for remote
          operation.
        </p>
        ${this.pending?.reason ? b `<p class="note">${this.pending.reason}</p>` : A}
        <div class="dialog-actions">
          <button @click=${this.cancelConfirm}>Cancel</button
          ><button class="primary" data-confirm @click=${this.confirm}>
            Confirm
          </button>
        </div>
      </dialog>`;
    }
}
ApplianceCard.styles = styles;

/** Editors keep the original YAML fields intact and change only the chosen field. */
class ApplianceEditor extends i {
    constructor() {
        super(...arguments);
        this.raw = {};
        this.registry = {};
        this.change = (event) => {
            const input = event.target;
            this.updateConfig({
                [input.name]: input.type === "checkbox" ? input.checked : input.value,
            });
        };
    }
    setConfig(raw) {
        this.raw = { ...raw };
        this.requestUpdate();
    }
    set hass(value) {
        const changed = this.currentHass?.connection !== value.connection;
        this.currentHass = value;
        if (changed) {
            this.stop?.();
            this.stop = undefined;
            this.registry = {};
        }
        this.watch();
        this.requestUpdate();
    }
    get hass() {
        return this.currentHass;
    }
    connectedCallback() {
        super.connectedCallback();
        this.watch();
    }
    disconnectedCallback() {
        this.stop?.();
        this.stop = undefined;
        super.disconnectedCallback();
    }
    watch() {
        if (this.isConnected && this.currentHass && !this.stop)
            this.stop = watchRegistries(this.currentHass, (value) => {
                this.registry = value;
                this.requestUpdate();
            });
    }
    updateConfig(patch, remove = []) {
        this.raw = { ...this.raw, ...patch };
        for (const field of remove)
            delete this.raw[field];
        this.dispatchEvent(new CustomEvent("config-changed", {
            detail: { config: { ...this.raw } },
            bubbles: true,
            composed: true,
        }));
        this.requestUpdate();
    }
    checkbox(name, label, checked) {
        return b `<label class="check"
      ><input
        type="checkbox"
        name=${name}
        .checked=${checked}
        @change=${this.change}
      />${label}</label
    >`;
    }
    render() {
        const overview = String(this.raw.type).replace(/^custom:/, "") === "kitchen-panel-card";
        const oven = String(this.raw.type).replace(/^custom:/, "") === "oven-card";
        const snapshot = this.registry.snapshot;
        const appliances = snapshot
            ? discoverAppliances(snapshot, this.currentHass?.states ?? {})
            : [];
        const device = typeof this.raw.device === "string" ? this.raw.device : "";
        const area = typeof this.raw.area === "string" ? this.raw.area : "";
        const selected = Array.isArray(this.raw.devices)
            ? this.raw.devices
            : [];
        const explicit = Array.isArray(this.raw.devices);
        const modules = Array.isArray(this.raw.oven_modules)
            ? this.raw.oven_modules
            : [];
        const choices = appliances.map((item) => ({
            value: item.id,
            label: item.name,
        }));
        const areas = (snapshot?.areas ?? []).map((item) => ({
            value: item.area_id,
            label: item.name,
        }));
        const isMissing = device &&
            snapshot &&
            !appliances.some((item) => item.id === device ||
                item.name.toLowerCase() === device.toLowerCase());
        const option = (value, label, current) => b `<option value=${value} ?selected=${current === value}>
        ${label}
      </option>`;
        const retained = (value, options) => value && !options.some((item) => item.value === value)
            ? option(value, `${value} (configured name or missing ID)`, value)
            : A;
        return b `<form @submit=${(event) => event.preventDefault()}>
      <p class="hint">
        Devices are discovered from Home Connect Local. Configured names stay
        unchanged until you select another device.
      </p>
      ${this.registry.error
            ? b `<p role="alert">${this.registry.error}</p>
              <button
                type="button"
                @click=${() => this.currentHass && refreshRegistries(this.currentHass)}
              >
                Retry discovery
              </button>`
            : A}
      ${this.registry.disconnected ? b `<p role="status">Home Assistant is disconnected. Reconnect to refresh devices.</p>` : A}
      ${!snapshot && !this.registry.error ? b `<p role="status">${this.currentHass ? "Loading appliance registries…" : "Connect to Home Assistant to discover devices."}</p>` : A}
      ${snapshot && !appliances.length ? b `<p role="status">No Home Connect Local appliances found. Check the integration and enabled entities.</p>` : A}
      ${overview
            ? b `
              <label
                >Appliance selection<select
                  name="selection_mode"
                  @change=${(event) => (event.target.value === "devices" ? this.updateConfig({ devices: [] }, ["area", "device"]) : this.updateConfig({}, ["devices"]))}
                >
                  ${option("area", "All devices or area", explicit ? "devices" : "area")}${option("devices", "Choose devices", explicit ? "devices" : "area")}
                </select></label
              >
              ${explicit
                ? b `<label
                        >Devices<select
                          name="devices"
                          multiple
                          @change=${(event) => this.updateConfig({ devices: Array.from(event.target.selectedOptions, (entry) => entry.value) })}
                        >
                          ${selected.filter((value) => !choices.some((item) => item.value === value)).map((value) => b `<option value=${value} selected>${value} (configured name or missing ID)</option>`)}
                          ${choices.map((item) => b `<option value=${item.value} ?selected=${selected.includes(item.value)}>${item.label}</option>`)}
                        </select></label
                      >
                      <p class="hint">
                        An empty selection displays no appliances. Use
                        Ctrl/Command or Shift to select multiple devices.
                      </p>`
                : b ` <label
                      >Area<select
                        name="area"
                        @change=${(event) => {
                    const value = event.target
                        .value;
                    this.updateConfig(value ? { area: value } : {}, value ? [] : ["area"]);
                }}
                      >
                        ${option("", "All areas", area)}${retained(area, areas)}${areas.map((item) => option(item.value, item.label, area))}
                      </select></label
                    >`}
            `
            : b `<label
                >Device<select name="device" @change=${this.change}>
                  ${option("", "Select a Local appliance", device)}${retained(device, choices)}${choices.map((item) => option(item.value, item.label, device))}
                </select></label
              >${isMissing ? b `<p role="status">Configured device not found. Choose a Home Connect Local appliance or check its name and integration.</p>` : A}
              ${!device ? b `<p class="hint">A device is required before this card can display an appliance.</p>` : A}`}
      <label
        >Title<input
          name="title"
          .value=${typeof this.raw.title === "string" ? this.raw.title : ""}
          @change=${this.change}
      /></label>
      <label
        >Appearance<select name="appearance" @change=${this.change}>
          ${option("default", "Default", String(this.raw.appearance ?? "default"))}${option("bubble", "Bubble", String(this.raw.appearance ?? "default"))}
        </select></label
      >
      ${this.checkbox("expand", "Expand appliance details", this.raw.expand !== false)}
      ${this.checkbox("confirm_start", "Confirm programme selection and start", this.raw.confirm_start !== false)}
      ${oven
            ? b `<fieldset>
              <legend>Oven modules</legend>
              <label
                >Module detection<select
                  name="module_mode"
                  @change=${(event) => this.updateConfig({ oven_modules: event.target.value === "auto" ? "auto" : [] })}
                >
                  ${option("auto", "Detect automatically", Array.isArray(this.raw.oven_modules) ? "manual" : "auto")}${option("manual", "Choose modules", Array.isArray(this.raw.oven_modules) ? "manual" : "auto")}
                </select></label
              >${Array.isArray(this.raw.oven_modules) ? ["microwave", "steam"].map((module) => b `<label class="check"><input type="checkbox" name=${module} .checked=${modules.includes(module)} @change=${(event) => this.updateConfig({ oven_modules: event.target.checked ? [...new Set([...modules, module])] : modules.filter((value) => value !== module) })} />${module === "steam" ? "Steam" : "Microwave"}</label>`) : A}
              <p class="hint">
                Both modules can be enabled together. No modules selected means
                a standard oven. Controls appear only when exposed by your
                appliance.
              </p>
            </fieldset>`
            : A}
    </form>`;
    }
}
ApplianceEditor.styles = i$3 `
    :host {
      display: block;
      color: var(--primary-text-color, #20252b);
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
    }
    form {
      display: grid;
      gap: 16px;
      min-width: 0;
    }
    label {
      display: grid;
      gap: 6px;
      min-width: 0;
    }
    input,
    select,
    button {
      font: inherit;
      color: inherit;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #bbb);
      border-radius: 8px;
      padding: 10px;
      min-width: 0;
      width: 100%;
      box-sizing: border-box;
    }
    input[type="checkbox"] {
      width: 20px;
      height: 20px;
      margin: 0;
    }
    .check {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    p {
      margin: 0;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }
    .hint {
      color: var(--secondary-text-color, #606873);
      font-size: 0.9em;
    }
    fieldset {
      display: grid;
      gap: 12px;
      min-width: 0;
      border: 1px solid var(--divider-color, #bbb);
      border-radius: 8px;
    }
    select[multiple] {
      min-height: 130px;
    }
    :focus-visible {
      outline: 2px solid var(--primary-color, #2879b9);
      outline-offset: 2px;
    }
  `;
for (const type of [...Object.keys(CARD_KINDS), "kitchen-panel-card"]) {
    if (!customElements.get(`${type}-editor`))
        customElements.define(`${type}-editor`, class extends ApplianceEditor {
        });
}

const cards = [
    ["oven-card", "Oven", "Oven with optional microwave and steam modules"],
    ["dishwasher-card", "Dishwasher", "Programme, wash options and care"],
    [
        "coffee-machine-card",
        "Coffee machine",
        "Drinks, preferences and consumables",
    ],
    [
        "refrigerator-card",
        "Refrigerator",
        "Temperature zones, doors and cooling modes",
    ],
    ["appliance-card", "Appliance", "Other Home Connect Local appliances"],
    [
        "kitchen-panel-card",
        "Kitchen panel",
        "Running appliances and attention across your kitchen",
    ],
];
for (const [type, name, description] of cards) {
    class Card extends ApplianceCard {
        static getConfigElement() {
            return document.createElement(`${type}-editor`);
        }
        static getStubConfig() {
            return {
                type: `custom:${type}`,
                ...(type === "kitchen-panel-card" ? {} : { device: "" }),
            };
        }
    }
    customElements.define(type, Card);
    const host = window;
    host.customCards ?? (host.customCards = []);
    host.customCards.push({ type, name, description, preview: true });
}
//# sourceMappingURL=appliance-panel-card.js.map
