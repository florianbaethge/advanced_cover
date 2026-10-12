/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$2=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$3=new WeakMap;let n$2 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$3.set(s,t));}return t}toString(){return this.cssText}};const r$2=t=>new n$2("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$2(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

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
const t$1=globalThis,i$1=t=>t,s$1=t$1.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$1=`lit$${Math.random().toFixed(9).slice(2)}$`,n="?"+o$1,r=`<${n}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e?e.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$1+x):s+o$1+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$1),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$1)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$1),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$1,t+1));)d.push({type:7,index:l}),t+=o$1.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$1(t).nextSibling;i$1(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t$1.litHtmlPolyfillSupport;B?.(S,k),(t$1.litHtmlVersions??=[]).push("3.3.3");const D$1=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D$1(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o=s.litElementPolyfillSupport;o?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.2");

function fireEvent(node, type, detail) {
    const event = new CustomEvent(type, {
        bubbles: true,
        composed: true,
        detail: detail ?? {},
    });
    node.dispatchEvent(event);
}

/** Must match `DOMAIN` in the Python integration. */
const TRANSLATION_DOMAIN = "advanced_cover";
/** Flat key under `component.advanced_cover.*` (e.g. `config_panel.tab_today`). */
function t(hass, path, placeholders) {
    if (!hass?.localize) {
        return path;
    }
    const fullKey = `component.${TRANSLATION_DOMAIN}.${path}`;
    const hasValues = Boolean(placeholders && Object.keys(placeholders).length);
    // HA uses IntlMessageFormat; placeholders must be passed here, not substituted afterward.
    let s = hasValues
        ? hass.localize(fullKey, placeholders)
        : hass.localize(fullKey);
    if (!s || s === fullKey) {
        s = path;
        if (placeholders) {
            for (const [k, v] of Object.entries(placeholders)) {
                s = s.split(`{${k}}`).join(String(v));
            }
        }
    }
    return s;
}

/** Home Assistant may put a string or structured object in `error`. */
function formatApiError(value, hass) {
    const fallback = hass?.localize != null
        ? t(hass, "config_panel.errors_request_failed")
        : "Request failed";
    if (value == null || value === "") {
        return fallback;
    }
    if (typeof value === "string") {
        return value;
    }
    if (value instanceof Error) {
        return value.message;
    }
    if (typeof value === "object") {
        const o = value;
        if (typeof o.message === "string") {
            return o.message;
        }
        if (typeof o.error === "string") {
            return o.error;
        }
        try {
            return JSON.stringify(value);
        }
        catch {
            return fallback;
        }
    }
    return String(value);
}
/** Safe when the panel bundle runs twice (navigation, scoped custom element registry). */
function defineCustomElementOnce(name, constructor, options) {
    if (customElements.get(name) !== undefined) {
        return;
    }
    customElements.define(name, constructor, options);
}
const navigate = (_node, path, replace = false) => {
    if (replace) {
        history.replaceState(null, "", path);
    }
    else {
        history.pushState(null, "", path);
    }
    fireEvent(window, "location-changed", { replace });
};
/** "HH:MM" for an ISO timestamp in the user's locale. */
function formatTime(iso) {
    if (!iso)
        return "–";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return "–";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
/** Minutes since local midnight for an ISO timestamp (for timeline placement). */
function minutesOfDay(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return null;
    return d.getHours() * 60 + d.getMinutes();
}

const BASE = "advanced-cover";
const exportPath = (entryId, page) => `/${BASE}/${entryId}/${page}`;

/** Localized one-line summary of one evaluated condition. */
function condSummary(hass, cond) {
    const values = { ...cond.summary_values };
    // The backend sends the raw operator ("above"/"below"/"between"); localize it.
    if (typeof values.op === "string") {
        values.op = t(hass, `config_panel.cond_op_${values.op}`);
    }
    // Translate the abstract contact states used in expected/actual.
    for (const field of ["actual", "expected"]) {
        if (cond.type === "contact" &&
            typeof values[field] === "string" &&
            values[field]) {
            values[field] = String(values[field])
                .split(", ")
                .map((s) => t(hass, `config_panel.contact_${s}`))
                .join(", ");
        }
    }
    return t(hass, cond.summary_key, values);
}
/** Verdict of one occurrence: the block's own conditions plus every cover's.

    Cover-scoped conditions (position, contact, relative sun) live in the
    per-cover preflights, so a block whose own conditions all pass can still
    end up with no cover running — the badge has to say so. */
function occVerdict(occ) {
    const block = occ.preflight?.verdict ?? "would_run";
    if (block !== "would_run" || !occ.assignments.length)
        return block;
    if (occ.covers_would_run > 0)
        return "would_run";
    const kinds = occ.assignments.map((r) => r.preflight?.verdict ?? "would_run");
    if (kinds.includes("would_skip"))
        return "would_skip";
    return kinds.includes("unknown") ? "unknown" : "would_run";
}
/** The occurrence's blocking reason: from the block, else from its covers. */
function occPreflightReason(hass, occ) {
    const fromBlock = preflightReason(hass, occ.preflight);
    if (fromBlock)
        return fromBlock;
    for (const run of occ.assignments) {
        const reason = preflightReason(hass, run.preflight);
        if (reason)
            return reason;
    }
    return null;
}
/** Plain-text reason for a would_skip/unknown verdict ("… and N more"). */
function preflightReason(hass, pf) {
    if (!pf)
        return null;
    const fails = pf.conditions.filter((c) => c.ok === false);
    const source = fails.length
        ? fails
        : pf.conditions.filter((c) => c.ok === null);
    if (!source.length)
        return null;
    const first = condSummary(hass, source[0]);
    if (source.length === 1)
        return first;
    return `${first} · ${t(hass, "config_panel.preflight_and_more", {
        n: source.length - 1,
    })}`;
}

/** Localize a backend run/log reason into a human-readable explanation.

    The backend stores technical English strings (entity ids, service
    errors). Recognized patterns are mapped to translated texts; anything
    unknown is shown verbatim so no reason is ever lost. */
function formatReason(hass, reason) {
    if (!reason)
        return null;
    let m = reason.match(/^(\S+) is unavailable$/);
    if (m)
        return t(hass, "config_panel.reason_entity_unavailable", { entity: m[1] });
    if (reason === "trigger time already passed")
        return t(hass, "config_panel.reason_trigger_passed");
    m = reason.match(/^already at (\d+)% \(min delta (\d+)%\)$/);
    if (m)
        return t(hass, "config_panel.reason_already_at", {
            pos: m[1],
            delta: m[2],
        });
    m = reason.match(/^contact is (\w+); closing below (\d+)% is blocked$/);
    if (m)
        return t(hass, "config_panel.cond_sum_safety", { ventilation: m[2] });
    m = reason.match(/^clamped to the ventilation position (\d+)% while the contact is open$/);
    if (m)
        return t(hass, "config_panel.reason_safety_clamped", {
            ventilation: m[1],
        });
    m = reason.match(/^(?:service|script) call failed: ([\s\S]*)$/);
    if (m)
        return t(hass, "config_panel.reason_service_failed", { error: m[1] });
    if (reason === "waiting for the sun to reach the facade direction")
        return t(hass, "config_panel.reason_waiting_facade");
    if (reason === "no facade direction configured")
        return t(hass, "config_panel.reason_no_facade");
    if (reason === "sun does not reach this facade today")
        return t(hass, "config_panel.reason_sun_not_reaching");
    if (reason === "master switch is off")
        return t(hass, "config_panel.reason_master_off");
    if (reason === "cover automation is off")
        return t(hass, "config_panel.reason_cover_off");
    if (reason === "scenario or assignment removed" || reason === "cover removed")
        return t(hass, "config_panel.reason_removed");
    // Condition reasons from the engine ("sensor.x is 'on', expected …") are
    // already descriptive; possibly a "; "-joined list.
    return reason;
}
/** Classify a backend reason for display prominence.

    "noise" = expected everyday outcomes (trigger already passed, cover was
    already in position) that the status badge fully covers — hidden from
    the reason lines. "error" = something is actually wrong and deserves
    color. Everything else is "info": useful context, rendered muted. */
function reasonSeverity(reason) {
    if (!reason)
        return "info";
    // The safety reason itself contains "; " — match it before splitting.
    if (/^contact is \w+; closing below \d+% is blocked$/.test(reason)) {
        return "error";
    }
    let severity = "noise";
    for (const part of reason.split("; ")) {
        if (/ is unavailable$/.test(part) ||
            /^(?:service|script) call failed:/.test(part)) {
            return "error";
        }
        if (part !== "trigger time already passed" &&
            !/^already at \d+% \(min delta \d+%\)$/.test(part)) {
            severity = "info";
        }
    }
    return severity;
}

/* Display status of today's plan blocks — shared by the panel's Today view
   and the Lovelace card, so both always tell the same story. */
/** Aggregate display kind of a block: preflight verdict, or real result. */
function occKind(occ) {
    if (!occ.fired)
        return occVerdict(occ);
    const runs = occ.assignments;
    if (runs.some((r) => r.status === "armed"))
        return "armed";
    if (runs.some((r) => r.result === "blocked_safety"))
        return "blocked_safety";
    if (runs.some((r) => r.result === "unavailable"))
        return "unavailable";
    if (runs.some((r) => r.result === "executed"))
        return "executed";
    if (runs.some((r) => r.result === "expired"))
        return "expired";
    return "skipped";
}
/** Most common reason among a fired block's non-executed runs, localized.

    Everyday outcomes ("trigger already passed", "already in position") are
    left out entirely — the status badge says it all; a wall of orange text
    on every block would drown out the reasons that matter. Shown collapsed
    only when the whole block failed: as soon as one cover executed, the
    problem is per-cover, the count badges tell the story and the details
    live in the expanded view. */
function occReasonSummary(hass, occ) {
    if (!occ.fired)
        return null;
    if (occ.assignments.some((r) => r.result === "executed"))
        return null;
    const counts = new Map();
    for (const r of occ.assignments) {
        if (r.result === "executed" || !r.reason)
            continue;
        if (reasonSeverity(r.reason) === "noise")
            continue;
        counts.set(r.reason, (counts.get(r.reason) ?? 0) + 1);
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!top)
        return null;
    const text = formatReason(hass, top[0]);
    if (!text)
        return null;
    return top[1] > 1 ? `${text} (${top[1]}×)` : text;
}
/** Map a block to a timeline marker color class.

    A fired block with executed covers *and* real problems (blocked /
    unavailable) renders as a green dot with a red ring: mostly fine, but
    something needs attention. */
function timelineClass(occ) {
    const kind = occKind(occ);
    if (kind === "would_run")
        return "will_run";
    if (occ.fired && occ.assignments.some((r) => r.result === "executed")) {
        const problems = occ.assignments.some((r) => ["blocked_safety", "unavailable"].includes(r.result ?? ""));
        if (problems)
            return "executed_partial";
    }
    return kind;
}
/** Per-cover run kind for the grouped list. */
function runKind(occ, run) {
    if (!occ.fired)
        return run.preflight?.verdict ?? "would_run";
    if (run.status === "armed")
        return "armed";
    return run.result ?? "skipped";
}
/** Retry window of a block as an end minute on today's strip, or null.

    Drawn only while it still matters: for upcoming blocks and for blocks
    with armed runs. A window past midnight clamps to the end of the strip. */
function retrySpanEnd(occ) {
    if (!occ.retry_until ||
        !(!occ.fired || occ.assignments.some((r) => r.status === "armed"))) {
        return null;
    }
    const start = minutesOfDay(occ.planned_at);
    if (start == null)
        return null;
    const end = minutesOfDay(occ.retry_until);
    return end == null || end <= start ? 1440 : end;
}

/** Night → day → night gradient derived from the real sun times. */
function dayGradient(sunriseMin, sunsetMin) {
    const night = "var(--ac-timeline-night)";
    const day = "var(--ac-timeline-day)";
    if (sunriseMin == null || sunsetMin == null || sunriseMin >= sunsetMin) {
        return night;
    }
    const p = (m) => Math.max(0, Math.min(100, (m / 1440) * 100));
    const sr = p(sunriseMin);
    const ss = p(sunsetMin);
    const f = 2.5; // fade width in %
    return (`linear-gradient(90deg, ${night} 0%, ${night} ${Math.max(0, sr - f)}%, ` +
        `${day} ${sr + f}%, ${day} ${Math.max(sr + f, ss - f)}%, ` +
        `${night} ${ss + f}%, ${night} 100%)`);
}
/**
 * Assign a stacking row (0 or 1) to each event so two markers closer than
 * 40 min never visually overlap (plan §4 timeline).
 */
function assignRows(events) {
    const rows = new Map();
    const sorted = [...events].sort((a, b) => a.minute - b.minute);
    let prevMin = -1e3;
    let prevRow = 1;
    for (const ev of sorted) {
        const row = ev.minute - prevMin < 40 ? (prevRow === 0 ? 1 : 0) : 0;
        rows.set(ev.id, row);
        prevMin = ev.minute;
        prevRow = row;
    }
    return rows;
}
function renderTimeline(opts) {
    const rows = assignRows(opts.events);
    const ticks = [];
    for (let h = 0; h <= 24; h += opts.axisEveryH)
        ticks.push(h);
    const gradient = dayGradient(opts.sunriseMin, opts.sunsetMin);
    return b `
    <div class="tl-scroll">
      <div class="tl" style="background:${gradient}">
        ${ticks.map((h) => b `<span
            class="tl-tick"
            style="left:${(h / 24) * 100}%"
          ></span>`)}
        <div class="tl-now" style="left:${(opts.nowMin / 1440) * 100}%">
          <span class="tl-now-dot"></span>
        </div>
        ${opts.events.map((ev) => {
        if (ev.spanEndMinute == null || ev.spanEndMinute <= ev.minute) {
            return A;
        }
        const left = (ev.minute / 1440) * 100;
        const width = ((Math.min(ev.spanEndMinute, 1440) - ev.minute) / 1440) * 100;
        return b `<span
            class="tl-span"
            style="left:${left}%;width:${width}%"
          ></span>`;
    })}
        ${opts.events.map((ev) => {
        const left = (ev.minute / 1440) * 100;
        const row = rows.get(ev.id) ?? 0;
        return b `
            <button
              type="button"
              class="tl-marker ${ev.colorClass} row-${row}"
              style="left:${left}%"
              title=${ev.label}
              aria-label=${ev.label}
              @click=${ev.onClick}
            >
              ${A}
              <span class="tl-dot"></span>
            </button>
          `;
    })}
      </div>
      <div class="tl-axis">
        ${ticks.map((h) => b `<span class="tl-axis-label" style="left:${(h / 24) * 100}%"
              >${h}</span
            >`)}
      </div>
    </div>
  `;
}
const timelineStyles = i$3 `
  :host {
    --ac-timeline-night: color-mix(
      in srgb,
      var(--primary-text-color) 10%,
      var(--card-background-color)
    );
    --ac-timeline-day: color-mix(
      in srgb,
      var(--warning-color, #f0b23a) 20%,
      var(--card-background-color)
    );
  }
  .tl-scroll {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 2px;
  }
  .tl {
    position: relative;
    height: 96px;
    min-width: 100%;
    border-radius: 10px;
    border: 1px solid var(--divider-color);
    box-sizing: border-box;
  }
  .tl-tick {
    position: absolute;
    top: 0;
    bottom: 18px;
    width: 1px;
    background: color-mix(in srgb, var(--divider-color) 70%, transparent);
  }
  .tl-now {
    position: absolute;
    top: 4px;
    bottom: 4px;
    width: 2px;
    background: var(--primary-color);
    transform: translateX(-1px);
    z-index: 3;
  }
  .tl-now-dot {
    position: absolute;
    top: -3px;
    left: 50%;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary-color);
    transform: translateX(-50%);
    animation: tl-pulse 2s ease-in-out infinite;
  }
  @keyframes tl-pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary-color) 55%, transparent);
    }
    50% {
      box-shadow: 0 0 0 5px transparent;
    }
  }
  .tl-marker {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    transform: translateX(-50%);
    color: var(--secondary-text-color);
    z-index: 2;
  }
  .tl-marker.row-0 {
    top: 10px;
  }
  .tl-marker.row-1 {
    top: 42px;
  }
  .tl-time {
    font-size: 0.66rem;
    font-variant-numeric: tabular-nums;
    background: var(--card-background-color);
    padding: 0 3px;
    border-radius: 4px;
    white-space: nowrap;
  }
  .tl-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--primary-color);
    border: 2px solid var(--card-background-color);
    box-sizing: border-box;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: transform 0.12s ease;
  }
  .tl-marker:hover .tl-dot {
    transform: scale(1.3);
  }
  .tl-marker.executed .tl-dot {
    background: var(--success-color, #43a047);
  }
  .tl-marker.will_run .tl-dot,
  .tl-marker.planned .tl-dot {
    background: var(--primary-color);
  }
  .tl-marker.would_skip .tl-dot,
  .tl-marker.armed .tl-dot {
    background: var(--warning-color, #f0b23a);
  }
  .tl-marker.skipped .tl-dot,
  .tl-marker.expired .tl-dot,
  .tl-marker.unknown .tl-dot {
    background: var(--disabled-text-color, #6d7476);
  }
  .tl-marker.blocked_safety .tl-dot,
  .tl-marker.unavailable .tl-dot {
    background: var(--error-color, #d93025);
  }
  /* Partially fine: executed covers next to blocked/unavailable ones. */
  .tl-marker.executed_partial .tl-dot {
    background: var(--success-color, #43a047);
    border-color: var(--error-color, #d93025);
  }
  /* Retry window: the span in which a missed occurrence still re-tries. */
  .tl-span {
    position: absolute;
    top: 4px;
    bottom: 4px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--warning-color, #f0b23a) 16%, transparent);
    border: 1px dashed color-mix(in srgb, var(--warning-color, #f0b23a) 45%, transparent);
    box-sizing: border-box;
    pointer-events: none;
    z-index: 1;
  }
  .tl-axis {
    position: relative;
    height: 14px;
    margin-top: 3px;
  }
  .tl-axis-label {
    position: absolute;
    transform: translateX(-50%);
    font-size: 0.68rem;
    color: var(--secondary-text-color);
    font-variant-numeric: tabular-nums;
  }

  @container acview (max-width: 900px) {
    .tl {
      height: 84px;
    }
  }
  @container acview (max-width: 620px) {
    .tl {
      height: 72px;
    }
    .tl-marker.row-1 {
      top: 34px;
    }
  }
`;

const D = "advanced_cover";
function withEntry(msg, entryId) {
    return entryId ? { ...msg, entry_id: entryId } : msg;
}
const listEntries = (hass) => hass.callWS({ type: `${D}/card/entries` });
/**
 * Subscribe to the card snapshot of one entry.
 *
 * Without the library's automatic resubscription: after a reconnect it sends
 * the command once and drops the subscription for good if that fails — which
 * it does while Home Assistant is still starting. The caller resubscribes
 * itself (on the connection's `ready` event, with retries).
 */
const subscribeSnapshot = (hass, callback, entryId) => hass.connection?.subscribeMessage(callback, withEntry({ type: `${D}/card/subscribe` }, entryId), { resubscribe: false });
const action = (hass, entryId, payload) => hass.callWS(withEntry({ type: `${D}/card/action`, ...payload }, entryId));
const runScenario = (hass, scenarioId, ignoreConditions, entryId) => action(hass, entryId, {
    action: "run_scenario",
    scenario_id: scenarioId,
    ignore_conditions: ignoreConditions,
});
const setEnabled = (hass, enabled, entryId) => action(hass, entryId, { action: "set_enabled", enabled });
const driveCover = (hass, coverItemId, command, entryId) => action(hass, entryId, {
    action: "cover",
    cover_item_id: coverItemId,
    command,
});

var translations = {"de":{"errors_request_failed":"Anfrage fehlgeschlagen","status_planned":"Geplant","status_executed":"Ausgeführt","status_skipped":"Übersprungen","status_armed":"Wartet","status_expired":"Abgelaufen","status_blocked_safety":"Blockiert","status_unavailable":"Nicht verfügbar","status_done":"Erledigt","status_idle":"Geplant","covers_no_area":"Ohne Raum","contact_closed":"Geschlossen","contact_tilted":"Gekippt","contact_open":"Offen","contact_unknown":"Unbekannt","cond_op_above":"über","cond_op_below":"unter","cond_op_between":"zwischen","preflight_would_run":"Würde jetzt greifen","preflight_would_skip":"Würde jetzt übersprungen","preflight_unknown":"Nicht auswertbar","preflight_reason":"Blockiert durch: {reason}","preflight_partial":"{n} von {total} Rollos würden greifen","preflight_evaluated_at":"Live-Prüfung um {time}","preflight_and_more":"und {n} weitere","preflight_show_all":"Alle {n} Bedingungen anzeigen","preflight_only_if":"Nur wenn","preflight_would_block":"würde blockieren","cond_sum_entity_state":"{entity} ist {actual} (braucht {expected})","cond_sum_entity_state_not":"{entity} darf nicht {expected} sein","cond_sum_cover_position":"Position {actual}% (braucht {op} {value}%)","cond_sum_contact":"Kontakt ist {actual} (braucht {expected})","cond_sum_numeric":"{entity} = {actual} (braucht {op} {value})","cond_sum_sun_position":"Sonnenstand {actual} (Höhe {elev_req}, Richtung {az_req})","cond_sum_safety":"Fenster offen — Sicherheitsregel blockiert Schließen unter {ventilation}%","cond_sum_safety_clamp":"Fenster offen — schließt nur bis zur Lüftungsposition {ventilation}%","cond_sum_safety_ignore":"Fenster offen — Übersteuerung schließt trotzdem komplett","cond_sum_unavailable":"{entity} ist nicht verfügbar","cond_sum_position_unknown":"Aktuelle Position des Rollos ist unbekannt","cond_sum_no_contact":"Kein Fensterkontakt für dieses Rollo hinterlegt","cond_sum_no_facade":"Keine Fassadenrichtung für dieses Rollo hinterlegt","cond_sum_automation_disabled":"Automatik ist deaktiviert","cond_sum_invalid":"Ungültige Bedingung","today_legend_executed":"ausgeführt","today_legend_will_run":"läuft noch","today_legend_would_skip":"würde überspringen","today_legend_skipped":"übersprungen","today_legend_partial":"teilweise OK","today_legend_retry":"Wiederholungsfenster","reason_entity_unavailable":"Entität {entity} war nicht verfügbar — zur Sicherheit wurde nichts bewegt","reason_trigger_passed":"Auslösezeit war bereits vorbei (z. B. Neustart oder Neuberechnung nach der geplanten Zeit)","reason_waiting_facade":"Wartet, bis die Sonne diese Fassade erreicht","reason_no_facade":"Keine Ausrichtung für dieses Cover hinterlegt","reason_sun_not_reaching":"Die Sonne erreicht diese Fassade heute nicht","reason_already_at":"Bereits auf {pos}% — Bewegungen unter {delta}% werden zum Schutz des Motors übersprungen","reason_safety_clamped":"Fenster offen — auf Lüftungsposition {ventilation}% gestoppt; schließt vollständig, wenn das Fenster im Nachlauf-Fenster geschlossen wird","reason_service_failed":"Home-Assistant-Serviceaufruf fehlgeschlagen: {error}","reason_master_off":"Der Automatik-Hauptschalter war ausgeschaltet","reason_cover_off":"Die Automatik ist für dieses Cover deaktiviert","reason_removed":"Das Cover oder Szenario wurde aus der Konfiguration entfernt","card_state_active":"Aktiv","card_state_off":"Aus","card_state_waiting":"Wartet","card_next_up":"Als Nächstes","card_in_h_min":"in {h} h {m} min","card_in_h":"in {h} h","card_in_min":"in {m} min","card_now":"jetzt","card_covers_target":"{n} Rollos → {pos}","card_covers_target_one":"1 Rollo → {pos}","card_nothing_more":"Heute nichts mehr geplant","card_nothing_more_hint":"{done} von {total} Läufen sind durch.","card_no_plan":"Heute nichts geplant","card_no_plan_hint":"Für heute ist kein Szenario eingeplant.","card_off_title":"Automatik ist aus","card_off_hint":"Nichts läuft von selbst. Manuelles Ausführen geht weiter.","card_action_run":"Jetzt ausführen","card_action_run_confirm":"Jetzt ausführen?","card_action_run_force":"Jetzt erzwingen?","card_action_disable":"Automatik pausieren","card_action_enable":"Einschalten","card_last_run":"Zuletzt","card_waiting":"{name} wartet bis {time} auf seine Bedingungen","card_trigger_fixed_time":"Feste Uhrzeit","card_trigger_sunrise":"Sonnenaufgang","card_trigger_sunset":"Sonnenuntergang","card_trigger_solar_noon":"Sonnenhöchststand","card_trigger_sun_azimuth":"Sonnenrichtung","card_trigger_sun_elevation":"Sonnenhöhe","card_timeline_empty":"Heute löst kein Szenario aus.","card_retry_until":"Nachlauf bis {time}","card_covers_empty":"Noch keine Rollos angelegt.","card_cover_next":"{time} → {pos} %","card_cover_waiting":"wartet bis {time}","card_cover_idle":"nichts geplant","card_cover_auto_off":"Automatik aus","card_cover_unavailable":"Nicht verfügbar","card_cover_window_open":"Fenster offen","card_cover_window_tilted":"Fenster gekippt","card_cover_open":"{name} öffnen","card_cover_stop":"{name} stoppen","card_cover_close":"{name} schließen","card_scenarios_empty":"Noch keine Szenarien angelegt.","card_scn_today":"Heute {time}","card_scn_not_today":"Heute nicht geplant","card_scn_disabled":"Deaktiviert","card_scn_no_covers":"Keine Rollos zugewiesen","card_scn_run":"{name} ausführen","card_scn_confirm":"Ausführen?","card_scn_confirm_force":"Erzwingen?","card_cancel":"Abbrechen","card_run_nothing":"Nichts zu tun","card_open_panel":"Advanced Cover öffnen","card_pick_entry":"Mehrere Advanced-Cover-Einträge — wähle einen in den Karteneinstellungen.","card_no_entry":"Advanced Cover ist nicht eingerichtet.","card_loading":"Lädt…","card_ed_title":"Advanced-Cover-Karte","card_ed_entry":"Eintrag","card_ed_entry_auto":"Automatisch","card_ed_card_title":"Titel","card_ed_header":"Kopfzeile anzeigen","card_ed_compact":"Kompaktes Layout","card_ed_compact_help":"Eine Kachelzeile mit dem nächsten Lauf statt der Bereiche.","card_ed_sections":"Bereiche","card_ed_sections_help":"Wähle, was die Karte zeigt und in welcher Reihenfolge.","card_ed_sec_next":"Als Nächstes","card_ed_sec_next_help":"Das nächste Szenario mit Countdown und Live-Check.","card_ed_sec_timeline":"Tagesverlauf","card_ed_sec_timeline_help":"Die heutigen Läufe auf dem Tag-Nacht-Band.","card_ed_sec_covers":"Rollos","card_ed_sec_covers_help":"Position, Fensterkontakt und Steuerung je Rollo.","card_ed_sec_scenarios":"Szenarien","card_ed_sec_scenarios_help":"Einzelne Szenarien von Hand ausführen.","card_ed_move_up":"Nach oben","card_ed_move_down":"Nach unten","card_ed_next_run":"Knopf „Jetzt ausführen“","card_ed_next_toggle":"Knopf Automatik an/aus","card_ed_last_run":"Letzten Lauf anzeigen","card_ed_tl_list":"Heutige Läufe auflisten","card_ed_tl_legend":"Legende anzeigen","card_ed_covers_which":"Angezeigte Rollos","card_ed_scn_which":"Angezeigte Szenarien","card_ed_all":"Alle","card_ed_pick":"Auswahl","card_ed_group_area":"Nach Raum gruppieren","card_ed_controls":"Knöpfe Auf, Stopp und Zu","card_ed_confirm":"Vor dem Ausführen nachfragen","card_ed_ignore":"Bedingungen ignorieren","card_ed_ignore_help":"Manuelle Läufe übergehen die Bedingungen des Szenarios. Die Sicherheitsregel am Fenster gilt weiter.","card_master_info":"Automatik-Schalter anzeigen","card_ed_runs":"Manuelle Läufe","card_ed_runs_help":"Gilt für jeden Ausführen-Knopf der Karte.","card_ed_entry_gone":"{id} (existiert nicht mehr)"},"en":{"errors_request_failed":"Request failed","status_planned":"Planned","status_executed":"Executed","status_skipped":"Skipped","status_armed":"Waiting","status_expired":"Expired","status_blocked_safety":"Blocked","status_unavailable":"Unavailable","status_done":"Done","status_idle":"Planned","covers_no_area":"No area","contact_closed":"Closed","contact_tilted":"Tilted","contact_open":"Open","contact_unknown":"Unknown","cond_op_above":"above","cond_op_below":"below","cond_op_between":"between","preflight_would_run":"Would run now","preflight_would_skip":"Would be skipped now","preflight_unknown":"Cannot be evaluated","preflight_reason":"Blocked by: {reason}","preflight_partial":"{n} of {total} covers would run","preflight_evaluated_at":"Live check at {time}","preflight_and_more":"and {n} more","preflight_show_all":"Show all {n} conditions","preflight_only_if":"Only if","preflight_would_block":"would block","cond_sum_entity_state":"{entity} is {actual} (needs {expected})","cond_sum_entity_state_not":"{entity} must not be {expected}","cond_sum_cover_position":"Position {actual}% (needs {op} {value}%)","cond_sum_contact":"Contact is {actual} (needs {expected})","cond_sum_numeric":"{entity} = {actual} (needs {op} {value})","cond_sum_sun_position":"Sun at {actual} (height {elev_req}, direction {az_req})","cond_sum_safety":"Window open — safety rule blocks closing below {ventilation}%","cond_sum_safety_clamp":"Window open — will only close down to the {ventilation}% ventilation position","cond_sum_safety_ignore":"Window open — override closes fully anyway","cond_sum_unavailable":"{entity} is unavailable","cond_sum_position_unknown":"Current cover position is unknown","cond_sum_no_contact":"No window contact configured for this cover","cond_sum_no_facade":"No facade direction configured for this cover","cond_sum_automation_disabled":"Automation is disabled","cond_sum_invalid":"Invalid condition","today_legend_executed":"executed","today_legend_will_run":"will run","today_legend_would_skip":"would skip","today_legend_skipped":"skipped","today_legend_partial":"partly OK","today_legend_retry":"retry window","reason_entity_unavailable":"Entity {entity} was unavailable — nothing was moved for safety","reason_trigger_passed":"Trigger time had already passed (e.g. restart or recalculation after the planned time)","reason_waiting_facade":"Waiting until the sun reaches this facade","reason_no_facade":"No facade direction set for this cover","reason_sun_not_reaching":"The sun does not reach this facade today","reason_already_at":"Already at {pos}% — moves smaller than {delta}% are skipped to protect the motor","reason_safety_clamped":"Window open — stopped at the ventilation position {ventilation}%; closes fully if the window is shut within the re-arm window","reason_service_failed":"Home Assistant service call failed: {error}","reason_master_off":"The automation master switch was off","reason_cover_off":"Automation is switched off for this cover","reason_removed":"The cover or scenario was removed from the configuration","card_state_active":"Active","card_state_off":"Off","card_state_waiting":"Waiting","card_next_up":"Next up","card_in_h_min":"in {h} h {m} min","card_in_h":"in {h} h","card_in_min":"in {m} min","card_now":"now","card_covers_target":"{n} covers → {pos}","card_covers_target_one":"1 cover → {pos}","card_nothing_more":"Nothing else planned today","card_nothing_more_hint":"{done} of {total} runs are through.","card_no_plan":"Nothing planned today","card_no_plan_hint":"No scenario is scheduled for today.","card_off_title":"Automation is off","card_off_hint":"Nothing runs on its own. Manual runs still work.","card_action_run":"Run now","card_action_run_confirm":"Run now?","card_action_run_force":"Force now?","card_action_disable":"Pause automation","card_action_enable":"Switch on","card_last_run":"Last","card_waiting":"{name} waits for its conditions until {time}","card_trigger_fixed_time":"Fixed time","card_trigger_sunrise":"Sunrise","card_trigger_sunset":"Sunset","card_trigger_solar_noon":"Solar noon","card_trigger_sun_azimuth":"Sun direction","card_trigger_sun_elevation":"Sun elevation","card_timeline_empty":"No scenario fires today.","card_retry_until":"retries until {time}","card_covers_empty":"No covers set up yet.","card_cover_next":"{time} → {pos} %","card_cover_waiting":"waits until {time}","card_cover_idle":"nothing planned","card_cover_auto_off":"automation off","card_cover_unavailable":"Unavailable","card_cover_window_open":"Window open","card_cover_window_tilted":"Window tilted","card_cover_open":"Open {name}","card_cover_stop":"Stop {name}","card_cover_close":"Close {name}","card_scenarios_empty":"No scenarios set up yet.","card_scn_today":"Today {time}","card_scn_not_today":"Not scheduled today","card_scn_disabled":"Disabled","card_scn_no_covers":"No covers assigned","card_scn_run":"Run {name}","card_scn_confirm":"Run?","card_scn_confirm_force":"Force?","card_cancel":"Cancel","card_run_nothing":"Nothing to do","card_open_panel":"Open Advanced Cover","card_pick_entry":"Several Advanced Cover entries — pick one in the card settings.","card_no_entry":"Advanced Cover is not set up.","card_loading":"Loading…","card_ed_title":"Advanced Cover card","card_ed_entry":"Entry","card_ed_entry_auto":"Automatic","card_ed_card_title":"Title","card_ed_header":"Show header","card_ed_compact":"Compact layout","card_ed_compact_help":"One tile-style row with the next run instead of the sections.","card_ed_sections":"Sections","card_ed_sections_help":"Pick what the card shows and in which order.","card_ed_sec_next":"Next up","card_ed_sec_next_help":"The next scenario with countdown and live check.","card_ed_sec_timeline":"Day timeline","card_ed_sec_timeline_help":"Today's runs on the day and night strip.","card_ed_sec_covers":"Covers","card_ed_sec_covers_help":"Position, window contact and controls per cover.","card_ed_sec_scenarios":"Scenarios","card_ed_sec_scenarios_help":"Run single scenarios by hand.","card_ed_move_up":"Move up","card_ed_move_down":"Move down","card_ed_next_run":"“Run now” button","card_ed_next_toggle":"Automation on/off button","card_ed_last_run":"Show the last run","card_ed_tl_list":"List today's runs","card_ed_tl_legend":"Show the legend","card_ed_covers_which":"Covers to list","card_ed_scn_which":"Scenarios to list","card_ed_all":"All","card_ed_pick":"Pick","card_ed_group_area":"Group by area","card_ed_controls":"Open, stop and close buttons","card_ed_confirm":"Ask before running","card_ed_ignore":"Ignore conditions","card_ed_ignore_help":"Manual runs skip the scenario's conditions. The window safety rule still applies.","card_master_info":"Show the automation switch","card_ed_runs":"Manual runs","card_ed_runs_help":"Applies to every run button on the card.","card_ed_entry_gone":"{id} (no longer exists)"},"nl":{"errors_request_failed":"Aanvraag mislukt","status_planned":"Gepland","status_executed":"Uitgevoerd","status_skipped":"Overgeslagen","status_armed":"Wachten","status_expired":"Verlopen","status_blocked_safety":"Geblokkeerd","status_unavailable":"Niet beschikbaar","status_done":"Klaar","status_idle":"Gepland","covers_no_area":"Geen ruimte","contact_closed":"Gesloten","contact_tilted":"Gekanteld","contact_open":"Open","contact_unknown":"Onbekend","cond_op_above":"boven","cond_op_below":"onder","cond_op_between":"tussen","preflight_would_run":"Zou nu uitvoeren","preflight_would_skip":"Zou nu worden overgeslagen","preflight_unknown":"Kan niet worden geëvalueerd","preflight_reason":"Geblokkeerd door: {reason}","preflight_partial":"{n} van {total} covers zouden uitvoeren","preflight_evaluated_at":"Live controle op {time}","preflight_and_more":"en {n} meer","preflight_show_all":"Toon alle {n} voorwaarden","preflight_only_if":"Alleen als","preflight_would_block":"zou blokkeren","cond_sum_entity_state":"{entity} is {actual} (moet {expected} zijn)","cond_sum_entity_state_not":"{entity} mag niet {expected} zijn","cond_sum_cover_position":"Positie {actual}% (moet {op} {value}% zijn)","cond_sum_contact":"Contact is {actual} (moet {expected} zijn)","cond_sum_numeric":"{entity} = {actual} (moet {op} {value} zijn)","cond_sum_sun_position":"Zon op {actual} (hoogte {elev_req}, richting {az_req})","cond_sum_safety":"Raam open — veiligheidsregel blokkeert sluiten onder {ventilation}%","cond_sum_safety_clamp":"Raam open — sluit alleen omlaag tot de {ventilation}% ventilatiepositie","cond_sum_safety_ignore":"Raam open — overschrijving sluit toch volledig","cond_sum_unavailable":"{entity} is niet beschikbaar","cond_sum_position_unknown":"Huidige coverpositie is onbekend","cond_sum_no_contact":"Geen raamcontact geconfigureerd voor deze cover","cond_sum_no_facade":"Geen gevelrichting geconfigureerd voor deze cover","cond_sum_automation_disabled":"Automatisering is uitgeschakeld","cond_sum_invalid":"Ongeldige voorwaarde","today_legend_executed":"uitgevoerd","today_legend_will_run":"zal uitvoeren","today_legend_would_skip":"zou overslaan","today_legend_skipped":"overgeslagen","today_legend_partial":"deels OK","today_legend_retry":"herkansingsvenster","reason_entity_unavailable":"Entiteit {entity} was niet beschikbaar — niets werd voor veiligheid verplaatst","reason_trigger_passed":"Trigger-moment was al voorbij (bijv. herstart of herberekening na het geplande moment)","reason_waiting_facade":"Wachten tot de zon deze gevel bereikt","reason_no_facade":"Geen gevelrichting ingesteld voor deze cover","reason_sun_not_reaching":"De zon bereikt deze gevel vandaag niet","reason_already_at":"Al op {pos}% — bewegingen kleiner dan {delta}% worden overgeslagen om de motor te beschermen","reason_safety_clamped":"Raam open — gestopt op ventilatiepositie {ventilation}%; sluit volledig als het raam binnen het re-arm venster wordt gesloten","reason_service_failed":"Home Assistant service call mislukt: {error}","reason_master_off":"De automatisering hoofdschakelaar was uit","reason_cover_off":"Automatisering is voor deze cover uitgeschakeld","reason_removed":"De cover of het scenario werd uit de configuratie verwijderd","card_state_active":"Actief","card_state_off":"Uit","card_state_waiting":"Wacht","card_next_up":"Volgende","card_in_h_min":"over {h} u {m} min","card_in_h":"over {h} u","card_in_min":"over {m} min","card_now":"nu","card_covers_target":"{n} covers → {pos}","card_covers_target_one":"1 cover → {pos}","card_nothing_more":"Vandaag niets meer gepland","card_nothing_more_hint":"{done} van {total} runs zijn klaar.","card_no_plan":"Vandaag niets gepland","card_no_plan_hint":"Voor vandaag is geen scenario ingepland.","card_off_title":"Automatisering staat uit","card_off_hint":"Niets loopt vanzelf. Handmatig uitvoeren werkt nog.","card_action_run":"Nu uitvoeren","card_action_run_confirm":"Nu uitvoeren?","card_action_run_force":"Nu forceren?","card_action_disable":"Automatisering pauzeren","card_action_enable":"Inschakelen","card_last_run":"Laatste","card_waiting":"{name} wacht tot {time} op zijn voorwaarden","card_trigger_fixed_time":"Vaste tijd","card_trigger_sunrise":"Zonsopkomst","card_trigger_sunset":"Zonsondergang","card_trigger_solar_noon":"Zonnemiddag","card_trigger_sun_azimuth":"Zonrichting","card_trigger_sun_elevation":"Zonhoogte","card_timeline_empty":"Vandaag start geen scenario.","card_retry_until":"herhaalt tot {time}","card_covers_empty":"Nog geen covers ingesteld.","card_cover_next":"{time} → {pos} %","card_cover_waiting":"wacht tot {time}","card_cover_idle":"niets gepland","card_cover_auto_off":"automatisering uit","card_cover_unavailable":"Niet beschikbaar","card_cover_window_open":"Raam open","card_cover_window_tilted":"Raam gekanteld","card_cover_open":"{name} openen","card_cover_stop":"{name} stoppen","card_cover_close":"{name} sluiten","card_scenarios_empty":"Nog geen scenario's ingesteld.","card_scn_today":"Vandaag {time}","card_scn_not_today":"Vandaag niet gepland","card_scn_disabled":"Uitgeschakeld","card_scn_no_covers":"Geen covers toegewezen","card_scn_run":"{name} uitvoeren","card_scn_confirm":"Uitvoeren?","card_scn_confirm_force":"Forceren?","card_cancel":"Annuleren","card_run_nothing":"Niets te doen","card_open_panel":"Advanced Cover openen","card_pick_entry":"Meerdere Advanced Cover-items — kies er een in de kaartinstellingen.","card_no_entry":"Advanced Cover is niet ingesteld.","card_loading":"Laden…","card_ed_title":"Advanced Cover-kaart","card_ed_entry":"Item","card_ed_entry_auto":"Automatisch","card_ed_card_title":"Titel","card_ed_header":"Koptekst tonen","card_ed_compact":"Compacte weergave","card_ed_compact_help":"Eén tegelrij met de volgende run in plaats van de secties.","card_ed_sections":"Secties","card_ed_sections_help":"Kies wat de kaart toont en in welke volgorde.","card_ed_sec_next":"Volgende","card_ed_sec_next_help":"Het volgende scenario met aftelling en live-check.","card_ed_sec_timeline":"Dagtijdlijn","card_ed_sec_timeline_help":"De runs van vandaag op de dag-nachtbalk.","card_ed_sec_covers":"Covers","card_ed_sec_covers_help":"Positie, raamcontact en bediening per cover.","card_ed_sec_scenarios":"Scenario's","card_ed_sec_scenarios_help":"Losse scenario's handmatig uitvoeren.","card_ed_move_up":"Omhoog","card_ed_move_down":"Omlaag","card_ed_next_run":"Knop ‘Nu uitvoeren’","card_ed_next_toggle":"Knop automatisering aan/uit","card_ed_last_run":"Laatste run tonen","card_ed_tl_list":"Runs van vandaag tonen","card_ed_tl_legend":"Legenda tonen","card_ed_covers_which":"Getoonde covers","card_ed_scn_which":"Getoonde scenario's","card_ed_all":"Alle","card_ed_pick":"Selectie","card_ed_group_area":"Groeperen per ruimte","card_ed_controls":"Knoppen open, stop en dicht","card_ed_confirm":"Vragen voor het uitvoeren","card_ed_ignore":"Voorwaarden negeren","card_ed_ignore_help":"Handmatige runs slaan de voorwaarden van het scenario over. De veiligheidsregel voor het raam blijft gelden.","card_master_info":"Automatiseringsschakelaar tonen","card_ed_runs":"Handmatige runs","card_ed_runs_help":"Geldt voor elke uitvoerknop op de kaart.","card_ed_entry_gone":"{id} (bestaat niet meer)"}};

const PREFIX = `component.${TRANSLATION_DOMAIN}.config_panel.`;
function language(hass) {
    const lang = hass.locale?.language ?? hass.language ?? "en";
    if (translations[lang])
        return lang;
    const base = lang.split("-")[0];
    return translations[base] ? base : "en";
}
function fill(text, values) {
    if (!values)
        return text;
    return text.replace(/\{(\w+)\}/g, (match, key) => key in values ? String(values[key]) : match);
}
const wrapped = new WeakMap();
/**
 * `hass` whose `localize` answers the card's keys from the bundle.
 *
 * The shared modules (timeline, preflight, reasons) and the card itself all
 * look their texts up through `t()` under `config_panel`. On a dashboard those
 * backend translations are not loaded, so the card hands them this view of
 * `hass` instead of the raw one; everything else falls through to Home
 * Assistant.
 */
function localizedHass(hass) {
    const known = wrapped.get(hass);
    if (known)
        return known;
    const table = translations[language(hass)] ?? {};
    const fallback = translations.en ?? {};
    const view = Object.create(hass);
    view.localize = (key, values) => {
        if (key.startsWith(PREFIX)) {
            const short = key.slice(PREFIX.length);
            const text = table[short] ?? fallback[short];
            if (text !== undefined)
                return fill(text, values);
        }
        return hass.localize ? hass.localize(key, values) : key;
    };
    wrapped.set(hass, view);
    return view;
}

/* Pure read-model helpers for the card — no DOM, no lit, unit-tested. */
const time = (iso) => {
    const ms = iso ? new Date(iso).getTime() : NaN;
    return Number.isNaN(ms) ? 0 : ms;
};
/** Stable key of one plan block (same shape the panel uses). */
const occKey = (occ) => `${occ.scenario_id}@${occ.planned_at}`;
/** The next block that has not fired yet, or null when the day is done.

    A block without covers moves nothing, so it is not "next" (the backend's
    next-run sensor skips it too). */
function nextUp(plan, nowMs) {
    const upcoming = plan
        .filter((occ) => !occ.fired && occ.assignments.length > 0 && time(occ.planned_at) >= nowMs)
        .sort((a, b) => time(a.planned_at) - time(b.planned_at));
    return upcoming[0] ?? null;
}
/** The block that fired most recently, or null before the first one. */
function lastRun(plan) {
    const fired = plan
        .filter((occ) => occ.fired)
        .sort((a, b) => time(b.planned_at) - time(a.planned_at));
    return fired[0] ?? null;
}
/** Blocks with a run that fired but still waits for its conditions.

    A facade-relative scenario also keeps covers armed — until the sun reaches
    their side. That is a cover waiting for its turn, not for a condition. */
function waitingRuns(plan, nowMs) {
    return plan.filter((occ) => occ.fired &&
        occ.assignments.some((run) => run.status === "armed" && !(run.fire_at && time(run.fire_at) > nowMs)));
}
/** Whole hours and minutes until `targetMs`; never negative. */
function leadTime(targetMs, nowMs) {
    const total = Math.max(0, Math.round((targetMs - nowMs) / 60000));
    return { h: Math.floor(total / 60), m: total % 60 };
}
/** "30 %" for one target, "30–80 %" when the covers differ. */
function positionsLabel(positions) {
    if (!positions.length)
        return "–";
    const low = Math.min(...positions);
    const high = Math.max(...positions);
    return low === high ? `${low} %` : `${low}–${high} %`;
}
/** Distinct targets of one plan block's covers. */
function occPositions(occ) {
    return [...new Set(occ.assignments.map((run) => run.target_position))];
}
/** Today's block of a scenario — the upcoming one first, else the last fired. */
function scenarioOccurrence(scenario, plan) {
    const own = plan.filter((occ) => occ.scenario_id === scenario.id);
    return own.find((occ) => !occ.fired) ?? own[own.length - 1] ?? null;
}
/** Keep the configured selection, in the integration's own order. */
function pick(items, selection) {
    if (!Array.isArray(selection))
        return items;
    return items.filter((item) => selection.includes(item.id));
}
/** Covers bucketed by area, areas in first-seen order, "no area" last. */
function groupByArea(covers) {
    const groups = new Map();
    for (const cover of covers) {
        const key = cover.area_id ?? null;
        if (!groups.has(key))
            groups.set(key, []);
        groups.get(key).push(cover);
    }
    const entries = [...groups.entries()];
    return [
        ...entries.filter(([area]) => area !== null),
        ...entries.filter(([area]) => area === null),
    ];
}
/** Per-result counts of a manual run, read back from the action log.

    A manual run answers with a bare "ok"; what each cover did only shows up
    as log entries. Everything logged for the scenario after `sinceMs` is
    that run. `sinceMs` must be on the server's clock — the log is stamped
    there, and a browser a few seconds off would miss or over-count. */
function runResultCounts(log, scenarioId, sinceMs) {
    const counts = new Map();
    for (const entry of log) {
        if (entry.scenario_id !== scenarioId || time(entry.time) <= sinceMs)
            continue;
        counts.set(entry.result, (counts.get(entry.result) ?? 0) + 1);
    }
    return [...counts.entries()];
}

/**
 * The card draws with Home Assistant's own theme variables, so it follows any
 * theme the dashboard uses. Only the alpha-derived tints have no HA
 * equivalent; they are mixed here, a little stronger on dark themes (a flat
 * alpha reads muddy on a dark card).
 *
 * `[data-dark]` is set from `hass.themes.darkMode` rather than
 * `prefers-color-scheme`: a user can pick a dark HA theme on a light OS.
 * `[data-narrow]` / `[data-stack]` / `[data-wide]` follow the card's own
 * width, not the viewport: the same card is narrow in a three-column section and wide in a
 * panel view on the very same screen.
 */
const cardStyles = i$3 `
  :host {
    --ac-fg: var(--primary-text-color);
    --ac-fg2: var(--secondary-text-color);
    --ac-div: var(--divider-color);
    --ac-pri: var(--primary-color);
    --ac-prifg: var(--text-primary-color, #fff);
    --ac-ok: var(--success-color, #43a047);
    --ac-warn: var(--warning-color, #f0b23a);
    --ac-err: var(--error-color, #d93025);
    --ac-off: var(--disabled-text-color, #6d7476);

    --ac-soft: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
    --ac-tint: color-mix(in srgb, var(--ac-pri) 12%, transparent);
    --ac-okT: color-mix(in srgb, var(--ac-ok) 14%, transparent);
    --ac-warnT: color-mix(in srgb, var(--ac-warn) 14%, transparent);
    --ac-errT: color-mix(in srgb, var(--ac-err) 12%, transparent);

    display: block;
  }
  :host([data-dark]) {
    --ac-soft: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
    --ac-tint: color-mix(in srgb, var(--ac-pri) 18%, transparent);
    --ac-okT: color-mix(in srgb, var(--ac-ok) 18%, transparent);
    --ac-warnT: color-mix(in srgb, var(--ac-warn) 16%, transparent);
    --ac-errT: color-mix(in srgb, var(--ac-err) 16%, transparent);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  ha-card {
    color: var(--ac-fg);
    overflow: hidden;
    height: 100%;
  }

  button {
    font: inherit;
    color: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button:disabled {
    cursor: default;
    opacity: 0.45;
  }
  button:focus-visible {
    outline: 2px solid var(--ac-pri);
    outline-offset: 2px;
  }

  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .num {
    font-variant-numeric: tabular-nums;
  }

  /* ---- header ---------------------------------------------------------- */

  .head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px 0;
  }
  .head > ha-icon {
    --mdc-icon-size: 22px;
    color: var(--ac-pri);
    flex: none;
  }
  .head .title {
    font-size: 16px;
    font-weight: 500;
    letter-spacing: -0.01em;
    flex: 1;
  }
  .head.off > ha-icon {
    color: var(--ac-off);
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--ac-soft);
    color: var(--ac-fg2);
    flex: none;
    white-space: nowrap;
  }
  .pill::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  button.pill {
    border: none;
    font-family: inherit;
  }
  button.pill:hover {
    filter: brightness(1.15);
  }
  .pill.pri {
    background: var(--ac-tint);
    color: var(--ac-pri);
  }
  .pill.warn {
    background: var(--ac-warnT);
    color: var(--ac-warn);
  }

  .iconbtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: none;
    color: var(--ac-fg2);
    flex: none;
    --mdc-icon-size: 20px;
  }
  .iconbtn:hover:not(:disabled) {
    background: var(--ac-soft);
    color: var(--ac-fg);
  }
  .head .iconbtn {
    margin: -4px -6px -4px -2px;
  }

  /* ---- sections -------------------------------------------------------- */

  .sections {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }
  .sec {
    padding: 14px 16px 16px;
    min-width: 0;
  }
  .sec + .sec {
    border-top: 1px solid var(--ac-div);
  }
  /* Wide cards (panel views, full-width sections) lay sections out in two
     columns; a lone last section takes the whole row. */
  :host([data-wide]) .sections {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  :host([data-wide]) .sec + .sec {
    border-top: none;
  }
  :host([data-wide]) .sec:nth-child(n + 3) {
    border-top: 1px solid var(--ac-div);
  }
  :host([data-wide]) .sec:nth-child(even) {
    border-left: 1px solid var(--ac-div);
  }
  :host([data-wide]) .sec:last-child:nth-child(odd) {
    grid-column: 1 / -1;
  }
  .head + .sections .sec:first-child,
  :host([data-wide]) .head + .sections .sec:nth-child(2) {
    padding-top: 12px;
  }

  .sec-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    min-height: 20px;
  }
  .sec-head > ha-icon {
    --mdc-icon-size: 18px;
    color: var(--ac-fg2);
    flex: none;
  }
  .sec-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ac-fg2);
  }
  .sec-aside {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: var(--ac-fg2);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .sec-aside span {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }
  .sec-aside ha-icon {
    --mdc-icon-size: 15px;
    color: var(--ac-warn);
  }

  .empty {
    font-size: 13px;
    color: var(--ac-fg2);
    padding: 4px 0;
  }
  .error {
    margin: 0;
    padding: 10px 16px;
    font-size: 13px;
    color: var(--ac-err);
    background: var(--ac-errT);
  }
  .message {
    padding: 18px 16px;
    font-size: 14px;
    color: var(--ac-fg2);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .message ha-icon {
    --mdc-icon-size: 20px;
    flex: none;
  }

  /* ---- buttons --------------------------------------------------------- */

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 40px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid var(--ac-div);
    background: none;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
    --mdc-icon-size: 18px;
  }
  .btn:hover:not(:disabled) {
    background: var(--ac-soft);
  }
  .btn.primary {
    background: var(--ac-pri);
    border-color: var(--ac-pri);
    color: var(--ac-prifg);
  }
  .btn.primary:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ac-pri) 88%, #000);
  }
  .btn.confirm {
    background: var(--ac-tint);
    border-color: var(--ac-pri);
    color: var(--ac-pri);
  }
  .btn.confirm:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ac-pri) 22%, transparent);
  }
  .btn.small {
    min-height: 32px;
    padding: 0 12px;
    font-size: 13px;
    border-radius: 8px;
  }

  /* ---- status chips ---------------------------------------------------- */

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 3px 9px;
    border-radius: 999px;
    background: var(--ac-soft);
    color: var(--ac-fg2);
    white-space: nowrap;
    flex: none;
    --mdc-icon-size: 14px;
  }
  .badge::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex: none;
  }
  .badge.executed,
  .badge.executed_partial {
    color: var(--ac-ok);
  }
  .badge.executed_partial ha-icon {
    color: var(--ac-err);
  }
  .badge.armed {
    color: var(--ac-warn);
  }
  .badge.blocked_safety,
  .badge.unavailable {
    color: var(--ac-err);
  }
  .badge.planned {
    color: var(--ac-pri);
  }

  /* Live check ("would run now" / "would be skipped now"). */
  .verdict {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11.5px;
    font-weight: 600;
    padding: 3px 9px 3px 7px;
    border-radius: 999px;
    border: 1px solid transparent;
    white-space: nowrap;
    flex: none;
    --mdc-icon-size: 15px;
  }
  .verdict.would_run {
    color: var(--ac-pri);
    background: var(--ac-tint);
    border-color: color-mix(in srgb, var(--ac-pri) 40%, transparent);
  }
  .verdict.would_skip {
    color: var(--ac-warn);
    background: var(--ac-warnT);
    border-color: color-mix(in srgb, var(--ac-warn) 45%, transparent);
  }
  .verdict.unknown {
    color: var(--ac-fg2);
    background: var(--ac-soft);
    border-color: color-mix(in srgb, var(--ac-fg2) 35%, transparent);
  }

  /* ---- next up --------------------------------------------------------- */

  .next {
    display: flex;
    gap: 14px 16px;
    align-items: flex-start;
  }
  .next-main {
    flex: 1;
    min-width: 0;
  }
  .next-actions {
    flex: none;
    width: 190px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  /* Too narrow for a button column: the buttons go below, side by side —
     and one above the other once even that gets tight. */
  :host([data-stack]) .next {
    flex-direction: column;
    align-items: stretch;
  }
  :host([data-stack]) .next-actions {
    width: auto;
    flex-direction: row;
  }
  :host([data-stack]) .next-actions .btn {
    flex: 1;
    min-width: 0;
  }
  :host([data-narrow]) .next-actions {
    flex-direction: column;
  }
  .label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ac-fg2);
  }
  .clock-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 2px;
  }
  .clock {
    font-size: 30px;
    line-height: 1.15;
    font-weight: 400;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
  .lead {
    font-size: 14px;
    color: var(--ac-fg2);
    font-variant-numeric: tabular-nums;
  }
  .next-name {
    font-size: 15px;
    font-weight: 500;
    margin-top: 2px;
    text-wrap: pretty;
  }
  .facts {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    margin-top: 8px;
    font-size: 13px;
    color: var(--ac-fg2);
  }
  .facts span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .facts ha-icon {
    --mdc-icon-size: 17px;
    flex: none;
  }
  .check {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 8px;
    margin-top: 10px;
  }
  .check-reason {
    font-size: 12.5px;
    color: var(--ac-fg2);
    flex: 1 1 140px;
    min-width: 0;
    text-wrap: pretty;
  }
  .big {
    font-size: 19px;
    line-height: 1.3;
    font-weight: 500;
    letter-spacing: -0.01em;
    margin-top: 2px;
  }
  .hint {
    font-size: 13px;
    color: var(--ac-fg2);
    margin-top: 4px;
    text-wrap: pretty;
  }
  .note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 12px;
    padding: 8px 10px;
    border-radius: 10px;
    font-size: 12.5px;
    line-height: 1.4;
    background: var(--ac-warnT);
    color: var(--ac-fg);
  }
  .note ha-icon {
    --mdc-icon-size: 17px;
    color: var(--ac-warn);
    flex: none;
    margin-top: 1px;
  }
  .last {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--ac-div);
    font-size: 13px;
    color: var(--ac-fg2);
    min-width: 0;
  }
  .last .what {
    flex: 1;
  }
  .last .what b {
    font-weight: 500;
    color: var(--ac-fg);
  }
  .feedback {
    margin-top: 10px;
  }
  .results {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  /* ---- timeline -------------------------------------------------------- */

  /* The shared strip is sized for the panel; a card wants it flatter. */
  .tl {
    height: 58px;
  }
  .tl-marker.row-0 {
    top: 12px;
  }
  .tl-marker.row-1 {
    top: 32px;
  }
  .tl-tick {
    bottom: 0;
  }
  .tl-marker.sel .tl-dot {
    transform: scale(1.35);
    box-shadow:
      0 0 0 2px var(--ac-pri),
      0 1px 3px rgba(0, 0, 0, 0.3);
  }
  .tl-axis-label:first-child {
    transform: none;
  }
  .tl-axis-label:last-child {
    transform: translateX(-100%);
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    margin-top: 8px;
    font-size: 11.5px;
    color: var(--ac-fg2);
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex: none;
    background: var(--ac-off);
  }
  .dot.executed,
  .dot.executed_partial {
    background: var(--ac-ok);
  }
  .dot.executed_partial {
    box-shadow: 0 0 0 1.5px var(--ac-err);
  }
  .dot.will_run,
  .dot.would_run,
  .dot.planned {
    background: var(--ac-pri);
  }
  .dot.would_skip,
  .dot.armed {
    background: var(--ac-warn);
  }
  .dot.blocked_safety,
  .dot.unavailable {
    background: var(--ac-err);
  }
  .swatch-retry {
    width: 16px;
    height: 9px;
    border-radius: 3px;
    background: var(--ac-warnT);
    border: 1px dashed color-mix(in srgb, var(--ac-warn) 55%, transparent);
  }

  .runs {
    margin: 10px -8px -6px;
  }
  .run {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 7px 8px;
    border: none;
    border-radius: 8px;
    background: none;
    text-align: left;
    font-size: 14px;
  }
  .run:hover {
    background: var(--ac-soft);
  }
  .run.past .run-time,
  .run.past .run-name {
    color: var(--ac-fg2);
  }
  .run-time {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    flex: none;
  }
  .run-name {
    flex: 1;
  }
  .run > ha-icon {
    --mdc-icon-size: 18px;
    color: var(--ac-fg2);
    flex: none;
    transition: transform 0.15s ease;
  }
  .run.open > ha-icon {
    transform: rotate(180deg);
  }
  /* Narrow: the row's leading dot already carries the result. */
  :host([data-narrow]) .run .badge,
  :host([data-narrow]) .run .verdict span {
    display: none;
  }
  :host([data-narrow]) .run .verdict {
    padding: 3px 6px;
  }

  .detail {
    margin: 2px 8px 8px 27px;
    padding: 8px 10px;
    border-radius: 10px;
    background: var(--ac-soft);
    font-size: 13px;
  }
  .detail.solo {
    margin: 10px 0 0;
  }
  .detail-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 14px;
  }
  .detail-head .run-name {
    font-weight: 500;
  }
  .detail-facts {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 12px;
    color: var(--ac-fg2);
    font-size: 12.5px;
  }
  .detail-reason {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: 6px;
    font-size: 12.5px;
    color: var(--ac-fg2);
    text-wrap: pretty;
  }
  .detail-reason.error {
    color: var(--ac-err);
  }
  .detail-reason ha-icon {
    --mdc-icon-size: 15px;
    flex: none;
    margin-top: 1px;
  }
  .lines {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid var(--ac-div);
  }
  .line {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 0;
  }
  .line .dot {
    width: 7px;
    height: 7px;
  }
  .line .line-name {
    flex: 1;
  }
  .line .line-state {
    font-size: 12px;
    color: var(--ac-fg2);
    flex: none;
  }
  .line .line-target {
    font-variant-numeric: tabular-nums;
    color: var(--ac-fg2);
    flex: none;
    min-width: 40px;
    text-align: right;
  }

  /* ---- covers ---------------------------------------------------------- */

  .area {
    font-size: 12px;
    font-weight: 600;
    color: var(--ac-fg2);
    margin: 12px 0 2px;
  }
  .area:first-of-type {
    margin-top: 0;
  }
  .rows {
    margin: 0 -8px -6px;
  }
  .cover {
    display: flex;
    align-items: center;
    gap: 4px;
    border-radius: 10px;
    padding-right: 8px;
  }
  .cover-main {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
    padding: 7px 4px 7px 8px;
    border: none;
    border-radius: 10px;
    background: none;
    text-align: left;
  }
  .cover-main:hover {
    background: var(--ac-soft);
  }
  .cover-text {
    flex: 1;
    min-width: 0;
  }
  .cover-name {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 14px;
  }
  .cover-name .pos {
    font-size: 13px;
    color: var(--ac-fg2);
    font-variant-numeric: tabular-nums;
    flex: none;
  }
  .cover-sub {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px 10px;
    font-size: 12.5px;
    color: var(--ac-fg2);
    font-variant-numeric: tabular-nums;
    margin-top: 1px;
  }
  .cover-sub span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .cover-sub ha-icon {
    --mdc-icon-size: 14px;
    flex: none;
  }
  .cover-sub .warn {
    color: var(--ac-warn);
  }
  .cover-sub .err {
    color: var(--ac-err);
  }

  /* A little window: the shade hangs from the top as far as the cover is
     closed, so 100 % (open) is an empty frame and 0 % a full one. */
  .glyph {
    position: relative;
    width: 30px;
    height: 30px;
    flex: none;
    border-radius: 6px;
    border: 1.5px solid color-mix(in srgb, var(--ac-fg2) 70%, transparent);
    background: var(--ac-soft);
    overflow: hidden;
  }
  .glyph .shade {
    position: absolute;
    inset: 0 0 auto 0;
    height: var(--closed, 0%);
    background: repeating-linear-gradient(
      to bottom,
      var(--ac-pri) 0 3px,
      color-mix(in srgb, var(--ac-pri) 55%, transparent) 3px 4.5px
    );
    transition: height 0.4s ease;
  }
  .glyph.moving .shade {
    animation: ac-pulse 1.2s ease-in-out infinite;
  }
  .glyph.unknown {
    border-style: dashed;
  }
  .glyph.off {
    border-color: color-mix(in srgb, var(--ac-off) 60%, transparent);
  }
  .glyph.off .shade {
    background: repeating-linear-gradient(
      to bottom,
      var(--ac-off) 0 3px,
      color-mix(in srgb, var(--ac-off) 55%, transparent) 3px 4.5px
    );
  }
  @keyframes ac-pulse {
    50% {
      opacity: 0.45;
    }
  }

  .ctrl {
    display: inline-flex;
    flex: none;
    border: 1px solid var(--ac-div);
    border-radius: 10px;
    overflow: hidden;
  }
  .ctrl button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 34px;
    padding: 0;
    border: none;
    background: none;
    color: var(--ac-fg);
    --mdc-icon-size: 19px;
  }
  .ctrl button + button {
    border-left: 1px solid var(--ac-div);
  }
  .ctrl button:hover:not(:disabled) {
    background: var(--ac-soft);
  }
  .ctrl button:active:not(:disabled) {
    background: var(--ac-tint);
    color: var(--ac-pri);
  }
  :host([data-narrow]) .ctrl button {
    width: 32px;
  }

  /* ---- scenarios ------------------------------------------------------- */

  .scn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 7px 8px;
    border-radius: 10px;
  }
  .scn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--ac-warnT);
    color: var(--ac-warn);
    flex: none;
    --mdc-icon-size: 18px;
  }
  .scn-icon.time {
    background: var(--ac-tint);
    color: var(--ac-pri);
  }
  .scn.muted .scn-icon {
    background: var(--ac-soft);
    color: var(--ac-off);
  }
  .scn.muted .scn-name {
    color: var(--ac-fg2);
  }
  .scn-text {
    flex: 1;
    min-width: 0;
  }
  .scn-name {
    font-size: 14px;
  }
  .scn-sub {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px 6px;
    font-size: 12.5px;
    color: var(--ac-fg2);
    font-variant-numeric: tabular-nums;
    margin-top: 1px;
  }
  /* The separator belongs to the item it introduces, so a wrapped line never
     ends on a dangling dot. */
  .scn-sub > span + span::before {
    content: "·";
    margin-right: 6px;
    color: var(--ac-fg2);
    opacity: 0.6;
  }
  /* Narrow rows wrap anyway; a wider gap separates better than dots that
     end up leading a line. */
  :host([data-narrow]) .scn-sub {
    gap: 0 12px;
  }
  :host([data-narrow]) .scn-sub > span + span::before {
    content: none;
  }
  /* While the row asks "Run?", the target makes way for the two buttons. */
  .scn.armed .scn-sub .tgt {
    display: none;
  }
  .scn-sub .ok {
    color: var(--ac-ok);
  }
  .scn-sub .warn {
    color: var(--ac-warn);
  }
  .scn-sub .err {
    color: var(--ac-err);
  }
  .play {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 50%;
    border: 1px solid var(--ac-div);
    background: none;
    color: var(--ac-pri);
    flex: none;
    --mdc-icon-size: 20px;
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
  }
  .play:hover:not(:disabled) {
    background: var(--ac-tint);
    border-color: color-mix(in srgb, var(--ac-pri) 45%, transparent);
  }
  .scn-confirm {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex: none;
  }
  .spin {
    animation: ac-spin 1s linear infinite;
  }
  @keyframes ac-spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ---- compact tile ---------------------------------------------------- */

  .tile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    height: 100%;
    min-height: 54px;
    line-height: 1.3;
  }
  .tile-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--ac-tint);
    color: var(--ac-pri);
    flex: none;
    --mdc-icon-size: 20px;
  }
  .tile.off .tile-icon {
    background: var(--ac-soft);
    color: var(--ac-off);
  }
  .tile.warn .tile-icon {
    background: var(--ac-warnT);
    color: var(--ac-warn);
  }
  .tile-text {
    flex: 1;
    min-width: 0;
  }
  .tile-title {
    font-size: 14px;
    font-weight: 500;
  }
  .tile-sub {
    font-size: 12.5px;
    color: var(--ac-fg2);
    font-variant-numeric: tabular-nums;
  }

  @media (prefers-reduced-motion: reduce) {
    .spin,
    .glyph.moving .shade,
    .tl-now-dot {
      animation: none;
    }
  }
`;

const CARD_SECTIONS = [
    "next",
    "timeline",
    "covers",
    "scenarios",
];
const NEXT_ACTIONS = ["run", "toggle"];
const DEFAULT_CONFIG = {
    sections: ["next", "timeline"],
    compact: false,
    show_header: true,
    next_actions: ["run", "toggle"],
    show_last_run: true,
    timeline_list: true,
    timeline_legend: false,
    covers: "all",
    group_by_area: true,
    cover_controls: true,
    scenarios: "all",
    confirm_run: true,
    ignore_conditions: false,
};
/** Reject what the card cannot render, with a message the YAML editor shows. */
function validateConfig(config) {
    if (!config || typeof config !== "object") {
        throw new Error("Invalid configuration");
    }
    if (config.sections !== undefined) {
        if (!Array.isArray(config.sections)) {
            throw new Error("sections must be a list");
        }
        for (const section of config.sections) {
            if (!CARD_SECTIONS.includes(section)) {
                throw new Error(`unknown section "${section}" (use ${CARD_SECTIONS.join(", ")})`);
            }
        }
    }
    if (config.next_actions !== undefined) {
        if (!Array.isArray(config.next_actions)) {
            throw new Error("next_actions must be a list");
        }
        for (const action of config.next_actions) {
            if (!NEXT_ACTIONS.includes(action)) {
                throw new Error(`unknown next action "${action}"`);
            }
        }
    }
    for (const key of ["covers", "scenarios"]) {
        const value = config[key];
        if (value !== undefined && value !== "all" && !Array.isArray(value)) {
            throw new Error(`${key} must be "all" or a list of ids`);
        }
    }
}

/** Options that only mean something while their section is on the card.
    `confirm_run` and `ignore_conditions` are not among them: they govern
    every run button — the next section's and the compact tile's too. */
const SECTION_KEYS = {
    next: ["next_actions", "show_last_run"],
    timeline: ["timeline_list", "timeline_legend"],
    covers: ["covers", "group_by_area", "cover_controls"],
    scenarios: ["scenarios"],
};
class AdvancedCoverCardEditor extends i {
    constructor() {
        super(...arguments);
        this._entries = [];
        this._entriesLoaded = false;
    }
    static { this.properties = {
        hass: { attribute: false },
        _config: { state: true },
        _entries: { state: true },
        _snapshot: { state: true },
    }; }
    setConfig(config) {
        this._config = { ...config };
    }
    connectedCallback() {
        super.connectedCallback();
        void this._loadEntries();
        this._resubscribe();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._teardown();
    }
    updated() {
        void this._loadEntries();
        this._resubscribe();
    }
    async _loadEntries() {
        if (!this.hass || this._entriesLoaded)
            return;
        this._entriesLoaded = true;
        try {
            this._entries = await listEntries(this.hass);
        }
        catch {
            this._entries = [];
        }
    }
    _teardown() {
        this._unsubscribe?.then((unsub) => unsub()).catch(() => undefined);
        this._unsubscribe = undefined;
        this._subscribedEntry = undefined;
    }
    _resubscribe() {
        if (!this.hass || !this.isConnected)
            return;
        const entry = this._config?.entry_id ?? "";
        if (this._subscribedEntry === entry)
            return;
        this._teardown();
        this._subscribedEntry = entry;
        this._snapshot = undefined;
        this._unsubscribe = subscribeSnapshot(this.hass, (message) => {
            // An unloaded entry only costs the pickers their chips.
            if (!("unloaded" in message))
                this._snapshot = message;
        }, this._config?.entry_id);
        // Without an entry the pickers simply stay empty; no retry loop.
        this._unsubscribe?.catch(() => {
            this._unsubscribe = undefined;
        });
    }
    _t(key) {
        return t(localizedHass(this.hass), `config_panel.${key}`);
    }
    get _cfg() {
        return { ...DEFAULT_CONFIG, ...(this._config ?? { type: "" }) };
    }
    _emit(patch) {
        if (!this._config)
            return;
        const next = { ...this._config, ...patch };
        // Keep the YAML honest: options at their default add noise, and an option
        // of a section the card does not show is worse than noise.
        for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
            if (JSON.stringify(next[key]) === JSON.stringify(value)) {
                delete next[key];
            }
        }
        const sections = next.sections ??
            DEFAULT_CONFIG.sections;
        for (const section of CARD_SECTIONS) {
            if (sections.includes(section))
                continue;
            // The compact tile is the "next" section in one row; keep its options.
            if (section === "next" && next.compact)
                continue;
            for (const key of SECTION_KEYS[section])
                delete next[key];
        }
        if (!next.entry_id)
            delete next.entry_id;
        if (!next.title)
            delete next.title;
        const config = next;
        this._config = config;
        fireEvent(this, "config-changed", { config });
    }
    // ---- sections -----------------------------------------------------------
    _toggleSection(section, on) {
        const current = this._cfg.sections;
        if (on) {
            if (!current.includes(section))
                this._emit({ sections: [...current, section] });
            return;
        }
        this._emit({ sections: current.filter((item) => item !== section) });
    }
    _moveSection(section, delta) {
        const sections = [...this._cfg.sections];
        const from = sections.indexOf(section);
        const to = from + delta;
        if (from < 0 || to < 0 || to >= sections.length)
            return;
        [sections[from], sections[to]] = [sections[to], sections[from]];
        this._emit({ sections });
    }
    // ---- render -------------------------------------------------------------
    render() {
        if (!this.hass || !this._config)
            return A;
        const cfg = this._cfg;
        // Shown sections first, in card order; the rest below, ready to switch on.
        const ordered = [
            ...cfg.sections,
            ...CARD_SECTIONS.filter((section) => !cfg.sections.includes(section)),
        ];
        return b `
      <div class="wrap">
        <div class="etitle">${this._t("card_ed_title")}</div>

        ${this._renderEntryPicker()}

        <label class="flabel" for="ac-title"
          >${this._t("card_ed_card_title")}</label
        >
        <input
          id="ac-title"
          class="input"
          type="text"
          .value=${this._config.title ?? ""}
          placeholder=${this._snapshot?.name ?? ""}
          @change=${(ev) => this._emit({
            title: ev.target.value.trim() || undefined,
        })}
        />

        ${cfg.compact ? A : this._toggleRow("card_ed_header", "show_header")}
        ${this._toggleRow("card_ed_compact", "compact", "card_ed_compact_help")}

        ${cfg.compact
            ? this._nextActionRow("run", "card_ed_next_run")
            : b `
              <div class="flabel top strong">${this._t("card_ed_sections")}</div>
              <div class="fhelp bottom">${this._t("card_ed_sections_help")}</div>
              ${ordered.map((section) => this._renderSection(section))}
            `}
        ${this._hasRunButton(cfg)
            ? b `
              <div class="flabel top strong">${this._t("card_ed_runs")}</div>
              <div class="fhelp bottom">${this._t("card_ed_runs_help")}</div>
              ${this._toggleRow("card_ed_confirm", "confirm_run")}
              ${this._toggleRow("card_ed_ignore", "ignore_conditions", "card_ed_ignore_help")}
            `
            : A}
      </div>
    `;
    }
    /** Whether the configured card shows any button that runs a scenario. */
    _hasRunButton(cfg) {
        const sections = cfg.sections ?? DEFAULT_CONFIG.sections;
        const nextRuns = (cfg.next_actions ?? DEFAULT_CONFIG.next_actions).includes("run");
        if (cfg.compact)
            return nextRuns;
        return (sections.includes("scenarios") || (sections.includes("next") && nextRuns));
    }
    /** Offered with several entries — and with a configured entry that no
        longer exists, which otherwise could only be cleared in YAML. */
    _renderEntryPicker() {
        const current = this._config?.entry_id ?? "";
        const known = this._entries.some((entry) => entry.entry_id === current);
        const gone = Boolean(current) && this._entriesLoaded && !known;
        if (this._entries.length <= 1 && !gone)
            return A;
        return b `
      <label class="flabel" for="ac-entry">${this._t("card_ed_entry")}</label>
      <select
        id="ac-entry"
        class="input"
        @change=${(ev) => this._emit({
            entry_id: ev.target.value || undefined,
        })}
      >
        <option value="" ?selected=${!current}>
          ${this._t("card_ed_entry_auto")}
        </option>
        ${gone
            ? b `<option value=${current} selected>
              ${t(localizedHass(this.hass), "config_panel.card_ed_entry_gone", {
                id: current,
            })}
            </option>`
            : A}
        ${this._entries.map((entry) => b `<option
              value=${entry.entry_id}
              ?selected=${entry.entry_id === current}
            >
              ${entry.name}
            </option>`)}
      </select>
    `;
    }
    _renderSection(section) {
        const sections = this._cfg.sections;
        const index = sections.indexOf(section);
        const on = index >= 0;
        return b `<div class="sec ${on ? "on" : ""}">
      <div class="sec-row">
        ${this._switch(this._t(`card_ed_sec_${section}`), on, (next) => this._toggleSection(section, next))}
        <div class="sec-text">
          <div class="sec-name">${this._t(`card_ed_sec_${section}`)}</div>
          <div class="fhelp">${this._t(`card_ed_sec_${section}_help`)}</div>
        </div>
        ${on && sections.length > 1
            ? b `<div class="order">
              <button
                type="button"
                title=${this._t("card_ed_move_up")}
                aria-label=${this._t("card_ed_move_up")}
                ?disabled=${index === 0}
                @click=${() => this._moveSection(section, -1)}
              >
                <ha-icon icon="mdi:arrow-up"></ha-icon>
              </button>
              <button
                type="button"
                title=${this._t("card_ed_move_down")}
                aria-label=${this._t("card_ed_move_down")}
                ?disabled=${index === sections.length - 1}
                @click=${() => this._moveSection(section, 1)}
              >
                <ha-icon icon="mdi:arrow-down"></ha-icon>
              </button>
            </div>`
            : A}
      </div>
      ${on ? b `<div class="sec-opts">${this._sectionOptions(section)}</div>` : A}
    </div>`;
    }
    _sectionOptions(section) {
        switch (section) {
            case "next":
                return b `
          ${this._nextActionRow("run", "card_ed_next_run")}
          ${this._nextActionRow("toggle", "card_ed_next_toggle")}
          ${this._toggleRow("card_ed_last_run", "show_last_run")}
        `;
            case "timeline":
                return b `
          ${this._toggleRow("card_ed_tl_list", "timeline_list")}
          ${this._toggleRow("card_ed_tl_legend", "timeline_legend")}
        `;
            case "covers":
                return b `
          ${this._picker("covers", "card_ed_covers_which", this._snapshot?.covers ?? [])}
          ${this._toggleRow("card_ed_group_area", "group_by_area")}
          ${this._toggleRow("card_ed_controls", "cover_controls")}
        `;
            default:
                return b `
          ${this._picker("scenarios", "card_ed_scn_which", this._snapshot?.scenarios ?? [])}
        `;
        }
    }
    /** A switch drawn by the editor itself. Deliberately not `ha-switch`:
        that element lives in a lazily loaded chunk and may not be defined when
        the dialog opens — and an element that keeps its own checked state
        shows the wrong state once Lit reuses it for another row. */
    _switch(label, checked, onChange) {
        return b `<button
      type="button"
      class="toggle ${checked ? "on" : ""}"
      role="switch"
      aria-checked=${checked ? "true" : "false"}
      aria-label=${label}
      @click=${() => onChange(!checked)}
    >
      <span class="knob"></span>
    </button>`;
    }
    _switchRow(labelKey, checked, onChange, helpKey) {
        return b `<div class="trow">
      <span class="ttext">
        <span>${this._t(labelKey)}</span>
        ${helpKey
            ? b `<span class="fhelp">${this._t(helpKey)}</span>`
            : A}
      </span>
      ${this._switch(this._t(labelKey), checked, onChange)}
    </div>`;
    }
    _toggleRow(labelKey, key, helpKey) {
        return this._switchRow(labelKey, Boolean(this._cfg[key]), (on) => this._emit({ [key]: on }), helpKey);
    }
    _nextActionRow(action, labelKey) {
        const actions = this._cfg.next_actions;
        return this._switchRow(labelKey, actions.includes(action), (on) => {
            const next = ["run", "toggle"].filter((item) => item === action ? on : actions.includes(item));
            this._emit({ next_actions: next });
        });
    }
    /** "All" or a hand-picked subset, offered as chips. */
    _picker(key, labelKey, items) {
        const value = this._cfg[key];
        const custom = Array.isArray(value);
        const picked = custom ? value : [];
        const toggle = (id) => {
            const next = picked.includes(id)
                ? picked.filter((item) => item !== id)
                : [...picked, id];
            this._emit({ [key]: next });
        };
        return b `
      <div class="flabel">${this._t(labelKey)}</div>
      <div class="seg">
        <button
          type="button"
          class=${custom ? "" : "on"}
          aria-pressed=${custom ? "false" : "true"}
          @click=${() => this._emit({ [key]: "all" })}
        >
          ${this._t("card_ed_all")}
        </button>
        <button
          type="button"
          class=${custom ? "on" : ""}
          aria-pressed=${custom ? "true" : "false"}
          ?disabled=${!custom && !items.length}
          @click=${() => {
            // Nothing to pick from (yet): an empty list would empty the card.
            if (!custom && items.length) {
                this._emit({
                    [key]: items.map((item) => item.id),
                });
            }
        }}
        >
          ${this._t("card_ed_pick")}
        </button>
      </div>
      ${custom
            ? b `<div class="chips">
            ${items.map((item) => b `<button
                  type="button"
                  class="chip ${picked.includes(item.id) ? "on" : ""}"
                  aria-pressed=${picked.includes(item.id) ? "true" : "false"}
                  @click=${() => toggle(item.id)}
                >
                  ${item.name}
                </button>`)}
          </div>`
            : A}
    `;
    }
    static { this.styles = i$3 `
    :host {
      display: block;
    }
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    .wrap {
      color: var(--primary-text-color);
      font-size: 14px;
    }
    .etitle {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 12px;
    }
    .flabel {
      display: block;
      font-size: 12.5px;
      color: var(--secondary-text-color);
      margin: 12px 0 6px;
    }
    .flabel.top {
      margin-top: 20px;
    }
    .flabel.strong {
      font-size: 15px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin-bottom: 2px;
    }
    .fhelp {
      font-size: 12.5px;
      line-height: 1.4;
      color: var(--secondary-text-color);
    }
    .fhelp.bottom {
      margin-bottom: 10px;
    }
    .input {
      width: 100%;
      height: 40px;
      padding: 0 12px;
      border-radius: 10px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
    }
    .input:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
    button {
      font: inherit;
      color: inherit;
      cursor: pointer;
    }
    button:disabled {
      cursor: default;
      opacity: 0.35;
    }

    .trow {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 0;
    }
    .toggle {
      position: relative;
      flex: none;
      width: 38px;
      height: 22px;
      padding: 0;
      border: none;
      border-radius: 999px;
      background: color-mix(in srgb, var(--primary-text-color) 28%, transparent);
      transition: background 0.15s ease;
    }
    .toggle .knob {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
      transition: left 0.15s ease;
    }
    .toggle.on {
      background: var(--primary-color);
    }
    .toggle.on .knob {
      left: 18px;
    }
    .toggle:focus-visible,
    .seg button:focus-visible,
    .chip:focus-visible,
    .order button:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    @media (prefers-reduced-motion: reduce) {
      .toggle,
      .toggle .knob {
        transition: none;
      }
    }
    .ttext {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .sec {
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      margin-bottom: 8px;
    }
    .sec.on {
      border-color: color-mix(in srgb, var(--primary-color) 45%, transparent);
    }
    .sec-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
    }
    .sec-text {
      flex: 1;
      min-width: 0;
    }
    .sec-name {
      font-weight: 500;
    }
    .order {
      display: inline-flex;
      flex: none;
    }
    .order button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      padding: 0;
      border: none;
      border-radius: 8px;
      background: none;
      color: var(--secondary-text-color);
      --mdc-icon-size: 18px;
    }
    .order button:hover:not(:disabled) {
      background: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
    }
    .sec-opts {
      padding: 2px 12px 6px;
      border-top: 1px solid var(--divider-color);
    }

    .seg {
      display: inline-flex;
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      overflow: hidden;
    }
    .seg button {
      padding: 7px 14px;
      border: none;
      background: none;
      font-size: 13px;
    }
    .seg button + button {
      border-left: 1px solid var(--divider-color);
    }
    .seg button.on {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 10px 0 4px;
    }
    .chip {
      padding: 5px 12px;
      border-radius: 999px;
      border: 1px solid var(--divider-color);
      background: none;
      font-size: 13px;
    }
    .chip.on {
      background: color-mix(in srgb, var(--primary-color) 14%, transparent);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
  `; }
}
defineCustomElementOnce("advanced-cover-card-editor", AdvancedCoverCardEditor);

/** Below this the buttons under the summary stack, and lists drop detail. */
const NARROW_PX = 380;
/** Below this the action column drops under the summary. */
const STACK_PX = 440;
/** From here on sections sit side by side. */
const WIDE_PX = 720;
/** How long a "Run?" confirmation stays armed. */
const CONFIRM_MS = 5000;
/** How long the result of a manual run stays on screen. */
const FEEDBACK_MS = 9000;
/** How long a rejected action stays on screen. */
const ERROR_MS = 8000;
/** Repaint interval for the countdown and the timeline's now-line. */
const TICK_MS = 30000;
/** Subscription retries back off from the first to the second value. */
const RETRY_MIN_MS = 2000;
const RETRY_MAX_MS = 60000;
/** Failed subscriptions in a row after which the last snapshot is dropped:
    long enough to ride out a reload or restart, short enough not to show a
    day that is no longer true. */
const STALE_AFTER_FAILURES = 4;
const VERDICT_ICONS = {
    would_run: "mdi:play-circle-outline",
    would_skip: "mdi:debug-step-over",
    unknown: "mdi:help-circle-outline",
};
const SECTION_ICONS = {
    next: "mdi:skip-next-circle-outline",
    timeline: "mdi:chart-timeline-variant",
    covers: "mdi:window-shutter",
    scenarios: "mdi:play-box-multiple-outline",
};
/** Buttons per cover kind: sideways arrows where the cover moves sideways. */
const COVER_ICONS = {
    curtain: {
        open: "mdi:arrow-expand-horizontal",
        close: "mdi:arrow-collapse-horizontal",
    },
    // Home Assistant's convention: an awning is "open" when it is extended.
    awning: { open: "mdi:arrow-expand-down", close: "mdi:arrow-collapse-up" },
};
const DEFAULT_COVER_ICONS = { open: "mdi:arrow-up", close: "mdi:arrow-down" };
function triggerMeta(trigger) {
    switch (trigger?.type) {
        case "sun_event":
            if (trigger.sun_event === "sunrise") {
                return { icon: "mdi:weather-sunset-up", key: "sunrise", time: false };
            }
            if (trigger.sun_event === "solar_noon") {
                return { icon: "mdi:weather-sunny", key: "solar_noon", time: false };
            }
            return { icon: "mdi:weather-sunset-down", key: "sunset", time: false };
        case "sun_azimuth":
            return { icon: "mdi:sun-compass", key: "sun_azimuth", time: false };
        case "sun_elevation":
            return { icon: "mdi:sun-angle-outline", key: "sun_elevation", time: false };
        default:
            return { icon: "mdi:clock-outline", key: "fixed_time", time: true };
    }
}
class AdvancedCoverCard extends i {
    constructor() {
        super(...arguments);
        /** Keys of the controls whose request is in flight. Per control on
            purpose: a slow move must never grey out another cover's Stop. */
        this._busy = new Set();
        this._narrow = false;
        this._stack = false;
        this._wide = false;
        /** Bumped on every teardown, so a late answer to an old attempt is ignored. */
        this._generation = 0;
        this._retryDelay = RETRY_MIN_MS;
        this._failures = 0;
        /** A reconnect (Home Assistant restarted, network came back): the old
            subscription died with the old socket. */
        this._onReconnect = () => {
            this._teardown();
            this._retryDelay = RETRY_MIN_MS;
            this._subscribe();
        };
    }
    static { this.properties = {
        hass: { attribute: false },
        _config: { state: true },
        _snapshot: { state: true },
        _error: { state: true },
        _actionError: { state: true },
        _busy: { state: true },
        _confirm: { state: true },
        _selected: { state: true },
        _feedback: { state: true },
        _narrow: { state: true },
        _stack: { state: true },
        _wide: { state: true },
    }; }
    static { this.styles = [timelineStyles, cardStyles]; }
    static getConfigElement() {
        return document.createElement("advanced-cover-card-editor");
    }
    static getStubConfig() {
        // Nothing required: dropped on a dashboard the card picks the only entry
        // and shows the default sections.
        return {};
    }
    setConfig(config) {
        validateConfig(config);
        const previous = this._config;
        this._config = { ...DEFAULT_CONFIG, ...config };
        if (previous?.entry_id !== this._config.entry_id) {
            this._snapshot = undefined;
            this._selected = undefined;
        }
        this._subscribe();
    }
    /** Rough height in HA's 50 px card units, so masonry can place the card. */
    getCardSize() {
        const cfg = this._cfg;
        if (cfg.compact)
            return 1;
        let size = cfg.show_header ? 1 : 0;
        for (const section of cfg.sections) {
            if (section === "next")
                size += 3;
            else if (section === "timeline") {
                size += 2 + (cfg.timeline_list ? (this._snapshot?.plan.length ?? 3) : 0);
            }
            else if (section === "covers") {
                size += 1 + (this._snapshot?.covers.length ?? 3);
            }
            else {
                size += 1 + (this._snapshot?.scenarios.length ?? 3);
            }
        }
        return Math.max(1, Math.round(size));
    }
    /** Sections view: half a row by default, never less than a third. */
    getGridOptions() {
        if (this._cfg.compact) {
            return { columns: 12, rows: 1, min_columns: 6, min_rows: 1 };
        }
        return { columns: 12, rows: "auto", min_columns: 6 };
    }
    connectedCallback() {
        super.connectedCallback();
        this._subscribe();
        this._observeWidth();
        this._ticker = window.setInterval(() => this.requestUpdate(), TICK_MS);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._teardown();
        this._watched?.removeEventListener?.("ready", this._onReconnect);
        this._watched = undefined;
        window.clearInterval(this._ticker);
        window.clearTimeout(this._confirmTimer);
        window.clearTimeout(this._feedbackTimer);
        window.clearTimeout(this._errorTimer);
        // The timers are gone, so what they would have ended must end here: a
        // card that is moved in the DOM may not come back with "Run?" still armed.
        this._confirm = undefined;
        this._feedback = undefined;
        this._actionError = undefined;
        this._resizeObserver?.disconnect();
        this._resizeObserver = undefined;
    }
    /** `hass` is replaced on every state change anywhere in Home Assistant;
        repaint only when something the card shows has changed with it. */
    shouldUpdate(changed) {
        if (changed.size !== 1 || !changed.has("hass"))
            return true;
        const previous = changed.get("hass");
        const hass = this.hass;
        const snap = this._snapshot;
        if (!previous || !hass || !snap)
            return true;
        if (previous.localize !== hass.localize ||
            previous.locale !== hass.locale ||
            previous.language !== hass.language ||
            previous.areas !== hass.areas ||
            previous.user !== hass.user ||
            previous.connection !== hass.connection ||
            previous.themes?.darkMode !== hass.themes?.darkMode) {
            return true;
        }
        const cfg = this._cfg;
        if (cfg.compact || !cfg.sections.includes("covers"))
            return false;
        return snap.covers.some((cover) => previous.states[cover.entity_id] !== hass.states[cover.entity_id]);
    }
    updated(changed) {
        if (this.hass && !this._unsubscribe && this._retryTimer === undefined) {
            this._subscribe();
        }
        this.toggleAttribute("data-narrow", this._narrow);
        this.toggleAttribute("data-stack", this._stack);
        this.toggleAttribute("data-wide", this._wide);
        this.toggleAttribute("data-dark", Boolean(this.hass?.themes?.darkMode));
        if (changed.has("_confirm") && this._confirm) {
            // Arming swaps the play button for "Run?"; keep the keyboard on it.
            this.renderRoot.querySelector("[data-confirm]")?.focus();
        }
    }
    get _cfg() {
        return { ...DEFAULT_CONFIG, ...(this._config ?? { type: "" }) };
    }
    /** `hass` that answers the card's translation keys from the bundle. */
    get _l() {
        return localizedHass(this.hass);
    }
    _t(key, values) {
        return t(this._l, `config_panel.${key}`, values);
    }
    _observeWidth() {
        if (this._resizeObserver || typeof ResizeObserver === "undefined")
            return;
        this._resizeObserver = new ResizeObserver((entries) => {
            const width = entries[0]?.contentRect.width ?? 0;
            if (width === 0)
                return;
            this._narrow = width < NARROW_PX;
            this._stack = width < STACK_PX;
            this._wide = width >= WIDE_PX;
        });
        this._resizeObserver.observe(this);
    }
    // ---- data ---------------------------------------------------------------
    _teardown() {
        this._generation += 1;
        this._unsubscribe?.then((unsub) => unsub()).catch(() => undefined);
        this._unsubscribe = undefined;
        this._subscribedEntry = undefined;
        window.clearTimeout(this._retryTimer);
        this._retryTimer = undefined;
    }
    _watchConnection() {
        const connection = this.hass?.connection;
        if (connection === this._watched)
            return;
        this._watched?.removeEventListener?.("ready", this._onReconnect);
        this._watched = connection;
        connection?.addEventListener?.("ready", this._onReconnect);
    }
    _scheduleRetry() {
        window.clearTimeout(this._retryTimer);
        this._retryTimer = window.setTimeout(() => {
            this._retryTimer = undefined;
            this._subscribe();
        }, this._retryDelay);
        this._retryDelay = Math.min(this._retryDelay * 2, RETRY_MAX_MS);
    }
    _subscribe() {
        if (!this.hass || !this._config || !this.isConnected)
            return;
        this._watchConnection();
        const entry = this._config.entry_id ?? "";
        // Subscribed, or waiting for the next attempt at exactly this entry.
        if (this._subscribedEntry === entry &&
            (this._unsubscribe || this._retryTimer !== undefined)) {
            return;
        }
        this._teardown();
        const generation = this._generation;
        const pending = subscribeSnapshot(this.hass, (message) => {
            if (generation !== this._generation)
                return;
            if ("unloaded" in message) {
                // The entry was unloaded (a reload, usually): keep the last day on
                // screen and come back for the new one.
                this._teardown();
                this._subscribedEntry = entry;
                this._retryDelay = RETRY_MIN_MS;
                this._scheduleRetry();
                return;
            }
            this._snapshot = message;
            this._error = undefined;
            this._failures = 0;
            this._retryDelay = RETRY_MIN_MS;
        }, this._config.entry_id);
        if (!pending)
            return;
        this._subscribedEntry = entry;
        this._unsubscribe = pending;
        pending.catch((err) => {
            if (generation !== this._generation)
                return;
            this._unsubscribe = undefined;
            this._failures += 1;
            // A stale day is fine for a moment (restart, reload), not for long.
            if (!this._snapshot || this._failures >= STALE_AFTER_FAILURES) {
                this._snapshot = undefined;
                // "Nothing configured" and "several entries, pick one" need
                // different answers from the user, so they get different sentences.
                this._error = this._t(err?.code === "ambiguous_entry" ? "card_pick_entry" : "card_no_entry");
            }
            // Never on every repaint: a card that cannot subscribe would otherwise
            // send one request per state change in the whole house.
            this._scheduleRetry();
        });
    }
    // ---- actions ------------------------------------------------------------
    _isBusy(key) {
        return this._busy.has(key);
    }
    _showActionError(text) {
        this._actionError = text;
        window.clearTimeout(this._errorTimer);
        if (text) {
            this._errorTimer = window.setTimeout(() => {
                this._actionError = undefined;
            }, ERROR_MS);
        }
    }
    /** Run one request; resolves to whether it went through. */
    async _act(key, request) {
        if (!this.hass || this._busy.has(key))
            return false;
        this._busy = new Set(this._busy).add(key);
        this._showActionError(undefined);
        try {
            await request();
            return true;
        }
        catch (err) {
            this._showActionError(formatApiError(err, this._l));
            return false;
        }
        finally {
            const busy = new Set(this._busy);
            busy.delete(key);
            this._busy = busy;
        }
    }
    /** First tap arms the button, the second one runs — unless that is off. */
    _requestRun(key, scenarioId) {
        if (this._cfg.confirm_run && this._confirm !== key) {
            this._confirm = key;
            window.clearTimeout(this._confirmTimer);
            this._confirmTimer = window.setTimeout(() => {
                this._confirm = undefined;
            }, CONFIRM_MS);
            return;
        }
        this._cancelConfirm();
        void this._run(key, scenarioId);
    }
    _cancelConfirm() {
        window.clearTimeout(this._confirmTimer);
        this._confirm = undefined;
    }
    async _run(key, scenarioId) {
        // The run's outcome is read back from the action log, which is stamped
        // with the server's clock — so the "since" mark is the server's too: the
        // time of the last snapshot, which is later than everything logged so far.
        const since = this._snapshot ? new Date(this._snapshot.now).getTime() : 0;
        const ran = await this._act(key, () => runScenario(this.hass, scenarioId, this._cfg.ignore_conditions, this._config?.entry_id));
        if (!ran)
            return;
        this._feedback = { scenarioId, since };
        window.clearTimeout(this._feedbackTimer);
        this._feedbackTimer = window.setTimeout(() => {
            this._feedback = undefined;
        }, FEEDBACK_MS);
    }
    _toggleMaster() {
        const enabled = !this._snapshot?.enabled;
        void this._act("master", () => setEnabled(this.hass, enabled, this._config?.entry_id));
    }
    _drive(cover, command) {
        void this._act(`cover:${cover.id}:${command}`, () => driveCover(this.hass, cover.id, command, this._config?.entry_id));
    }
    _moreInfo(entityId) {
        if (entityId)
            fireEvent(this, "hass-more-info", { entityId });
    }
    _openPanel() {
        if (this._snapshot) {
            navigate(this, exportPath(this._snapshot.entry_id, "today"));
        }
    }
    _select(key) {
        this._selected = this._selected === key ? undefined : key;
    }
    // ---- render -------------------------------------------------------------
    render() {
        if (!this.hass || !this._config)
            return A;
        const snap = this._snapshot;
        if (this._error || !snap) {
            return b `<ha-card>
        <div class="message">
          <ha-icon
            icon=${this._error ? "mdi:alert-circle-outline" : "mdi:window-shutter-cog"}
          ></ha-icon>
          ${this._error ?? this._t("card_loading")}
        </div>
      </ha-card>`;
        }
        const cfg = this._cfg;
        if (cfg.compact)
            return this._renderCompact(snap);
        const renderers = {
            next: () => this._renderNext(snap),
            timeline: () => this._renderTimeline(snap),
            covers: () => this._renderCovers(snap),
            scenarios: () => this._renderScenarios(snap),
        };
        // A section listed twice would only repeat itself.
        const sections = [...new Set(cfg.sections)];
        return b `<ha-card>
      ${cfg.show_header ? this._renderHeader(snap) : A}
      ${this._actionError
            ? b `<p class="error" role="alert">${this._actionError}</p>`
            : A}
      <div class="sections">
        ${sections.map((section) => b `<div class="sec sec-${section}">${renderers[section]()}</div>`)}
      </div>
    </ha-card>`;
    }
    /** State of the automation; a tap opens the master switch, which is how
        a card without the "next" section still lets you switch it. */
    _statePill(snap) {
        const [tone, key] = !snap.enabled
            ? ["", "card_state_off"]
            : waitingRuns(snap.plan, Date.now()).length
                ? ["warn", "card_state_waiting"]
                : ["pri", "card_state_active"];
        if (!snap.master_entity_id) {
            return b `<span class="pill ${tone}">${this._t(key)}</span>`;
        }
        return b `<button
      type="button"
      class="pill ${tone}"
      title=${this._t("card_master_info")}
      aria-label="${this._t(key)} · ${this._t("card_master_info")}"
      @click=${() => this._moreInfo(snap.master_entity_id)}
    >
      ${this._t(key)}
    </button>`;
    }
    _renderHeader(snap) {
        return b `<div class="head ${snap.enabled ? "" : "off"}">
      <ha-icon icon="mdi:window-shutter-cog"></ha-icon>
      <span class="title ellipsis">${this._config?.title || snap.name}</span>
      ${this._statePill(snap)}
      ${this.hass?.user?.is_admin
            ? b `<button
            type="button"
            class="iconbtn"
            title=${this._t("card_open_panel")}
            aria-label=${this._t("card_open_panel")}
            @click=${this._openPanel}
          >
            <ha-icon icon="mdi:open-in-new"></ha-icon>
          </button>`
            : A}
    </div>`;
    }
    _secHead(section, aside = A) {
        return b `<div class="sec-head">
      <ha-icon icon=${SECTION_ICONS[section]}></ha-icon>
      <span class="sec-title">${this._t(`card_ed_sec_${section}`)}</span>
      ${aside === A ? A : b `<span class="sec-aside">${aside}</span>`}
    </div>`;
    }
    _lead(targetIso) {
        const { h, m } = leadTime(new Date(targetIso).getTime(), Date.now());
        if (h === 0 && m === 0)
            return this._t("card_now");
        if (h === 0)
            return this._t("card_in_min", { m });
        if (m === 0)
            return this._t("card_in_h", { h });
        return this._t("card_in_h_min", { h, m });
    }
    _coversTarget(count, positions) {
        const pos = positionsLabel(positions);
        return count === 1
            ? this._t("card_covers_target_one", { pos })
            : this._t("card_covers_target", { n: count, pos });
    }
    /** Status chip of one plan block: its result, or the live check before. */
    _occBadge(occ) {
        if (occ.fired) {
            const kind = timelineClass(occ);
            const label = kind === "executed_partial" ? "executed" : occKind(occ);
            return b `<span class="badge ${kind}">
        <span>${this._t(`status_${label}`)}</span>
        ${kind === "executed_partial"
                ? b `<ha-icon icon="mdi:alert-circle-outline"></ha-icon>`
                : A}
      </span>`;
        }
        const verdict = occVerdict(occ);
        const scenario = this._snapshot?.scenarios.find((s) => s.id === occ.scenario_id);
        // Without conditions "would run now" says nothing — it is just planned.
        if (verdict === "would_run" && !scenario?.has_conditions) {
            return b `<span class="badge planned">
        <span>${this._t("status_planned")}</span>
      </span>`;
        }
        return b `<span
      class="verdict ${verdict}"
      title=${occPreflightReason(this._l, occ) ?? ""}
    >
      <ha-icon icon=${VERDICT_ICONS[verdict]}></ha-icon>
      <span>${this._t(`preflight_${verdict}`)}</span>
    </span>`;
    }
    /** Per-result counts of the manual run that just finished, or null. */
    _feedbackCounts(scenarioId) {
        const feedback = this._feedback;
        if (!feedback || feedback.scenarioId !== scenarioId || !this._snapshot) {
            return null;
        }
        return runResultCounts(this._snapshot.log, scenarioId, feedback.since);
    }
    /** Per-cover outcome of the manual run that just finished. */
    _renderFeedback(scenarioId) {
        const counts = this._feedbackCounts(scenarioId);
        if (!counts)
            return A;
        if (!counts.length) {
            return b `<span class="badge" role="status"
        ><span>${this._t("card_run_nothing")}</span></span
      >`;
        }
        return b `<span class="results" role="status"
      >${counts.map(([result, n]) => b `<span class="badge ${result}"
            ><span>${n}× ${this._t(`status_${result}`)}</span></span
          >`)}</span
    >`;
    }
    /** The same outcome as one line of text, for the compact tile. */
    _feedbackText(scenarioId) {
        const counts = this._feedbackCounts(scenarioId);
        if (!counts)
            return null;
        if (!counts.length)
            return this._t("card_run_nothing");
        return counts
            .map(([result, n]) => `${n}× ${this._t(`status_${result}`)}`)
            .join(" · ");
    }
    /** Status of one plan block in words (the timeline marker's label). */
    _occStatusText(occ) {
        if (occ.fired)
            return this._t(`status_${occKind(occ)}`);
        const verdict = occVerdict(occ);
        return verdict === "would_run"
            ? this._t("status_planned")
            : this._t(`preflight_${verdict}`);
    }
    _runButton(key, scenarioId, label) {
        const armed = this._confirm === key;
        const busy = this._isBusy(key);
        const confirmLabel = this._t(this._cfg.ignore_conditions ? "card_action_run_force" : "card_action_run_confirm");
        return b `<button
      type="button"
      class="btn ${armed ? "confirm" : "primary"}"
      ?data-confirm=${armed}
      .disabled=${busy}
      @click=${() => this._requestRun(key, scenarioId)}
    >
      <ha-icon
        class=${busy ? "spin" : ""}
        icon=${busy ? "mdi:loading" : armed ? "mdi:check" : "mdi:play"}
      ></ha-icon>
      ${armed ? confirmLabel : label}
    </button>`;
    }
    // ---- section: next up ---------------------------------------------------
    _renderNext(snap) {
        const cfg = this._cfg;
        const showRun = cfg.next_actions.includes("run");
        const showToggle = cfg.next_actions.includes("toggle");
        const next = snap.enabled ? nextUp(snap.plan, Date.now()) : null;
        let main;
        if (!snap.enabled) {
            main = b `
        <div class="label">${this._t("card_next_up")}</div>
        <div class="big">${this._t("card_off_title")}</div>
        <div class="hint">${this._t("card_off_hint")}</div>
      `;
        }
        else if (next) {
            main = this._renderNextSummary(snap, next);
        }
        else {
            const done = snap.plan.filter((occ) => occ.fired).length;
            main = b `
        <div class="label">${this._t("card_next_up")}</div>
        <div class="big">
          ${this._t(snap.plan.length ? "card_nothing_more" : "card_no_plan")}
        </div>
        <div class="hint">
          ${snap.plan.length
                ? this._t("card_nothing_more_hint", {
                    done,
                    total: snap.plan.length,
                })
                : this._t("card_no_plan_hint")}
        </div>
      `;
        }
        const actions = [];
        if (next && showRun) {
            actions.push(this._runButton(`next:${next.scenario_id}`, next.scenario_id, this._t("card_action_run")));
        }
        if (showToggle) {
            actions.push(b `<button
        type="button"
        class="btn ${snap.enabled ? "" : "primary"}"
        .disabled=${this._isBusy("master")}
        @click=${this._toggleMaster}
      >
        <ha-icon icon=${snap.enabled ? "mdi:pause" : "mdi:power"}></ha-icon>
        ${this._t(snap.enabled ? "card_action_disable" : "card_action_enable")}
      </button>`);
        }
        const waiting = snap.enabled ? waitingRuns(snap.plan, Date.now()) : [];
        const last = cfg.show_last_run ? lastRun(snap.plan) : null;
        const feedback = next ? this._renderFeedback(next.scenario_id) : A;
        return b `
      <div class="next">
        <div class="next-main">
          ${main}
          ${feedback !== A
            ? b `<div class="feedback">${feedback}</div>`
            : A}
        </div>
        ${actions.length
            ? b `<div class="next-actions">${actions}</div>`
            : A}
      </div>
      ${waiting.map((occ) => {
            const until = occ.assignments
                .map((run) => run.armed_until)
                .filter((value) => Boolean(value))
                .sort()
                .pop();
            return b `<div class="note">
          <ha-icon icon="mdi:timer-sand"></ha-icon>
          <span
            >${this._t("card_waiting", {
                name: occ.scenario_name,
                time: formatTime(until ?? occ.retry_until),
            })}</span
          >
        </div>`;
        })}
      ${last
            ? b `<div class="last">
            <span class="what ellipsis"
              >${this._t("card_last_run")}
              <b class="num">${formatTime(last.planned_at)}</b> ·
              ${last.scenario_name}</span
            >
            ${this._occBadge(last)}
          </div>`
            : A}
    `;
    }
    _renderNextSummary(snap, occ) {
        const scenario = snap.scenarios.find((s) => s.id === occ.scenario_id);
        const trigger = triggerMeta(scenario?.trigger);
        const verdict = occVerdict(occ);
        const showCheck = verdict !== "would_run" || Boolean(scenario?.has_conditions);
        const reason = verdict === "would_run" ? null : occPreflightReason(this._l, occ);
        return b `
      <div class="label">${this._t("card_next_up")}</div>
      <div class="clock-row">
        <span class="clock">${formatTime(occ.planned_at)}</span>
        <span class="lead">${this._lead(occ.planned_at)}</span>
      </div>
      <div class="next-name">${occ.scenario_name}</div>
      <div class="facts">
        <span>
          <ha-icon icon=${trigger.icon}></ha-icon>
          ${this._t(`card_trigger_${trigger.key}`)}
        </span>
        <span>
          <ha-icon icon="mdi:window-shutter"></ha-icon>
          ${this._coversTarget(occ.assignments.length, occPositions(occ))}
        </span>
      </div>
      ${showCheck
            ? b `<div class="check">
            <span class="verdict ${verdict}">
              <ha-icon icon=${VERDICT_ICONS[verdict]}></ha-icon>
              <span>${this._t(`preflight_${verdict}`)}</span>
            </span>
            ${reason ? b `<span class="check-reason">${reason}</span>` : A}
          </div>`
            : A}
    `;
    }
    // ---- section: timeline --------------------------------------------------
    _renderTimeline(snap) {
        const cfg = this._cfg;
        const events = snap.plan
            .map((occ) => {
            const minute = minutesOfDay(occ.planned_at);
            if (minute == null)
                return null;
            const key = occKey(occ);
            return {
                id: key,
                minute,
                colorClass: `${timelineClass(occ)}${this._selected === key ? " sel" : ""}`,
                // Colour alone does not tell a screen reader how the run went.
                label: `${formatTime(occ.planned_at)} · ${occ.scenario_name} · ${this._occStatusText(occ)}`,
                timeLabel: formatTime(occ.planned_at),
                spanEndMinute: retrySpanEnd(occ),
                onClick: () => this._select(key),
            };
        })
            .filter((event) => event !== null);
        const now = new Date();
        const selected = snap.plan.find((occ) => occKey(occ) === this._selected);
        const sun = b `
      ${snap.sun.sunrise
            ? b `<span
            ><ha-icon icon="mdi:weather-sunset-up"></ha-icon>${formatTime(snap.sun.sunrise)}</span
          >`
            : A}
      ${snap.sun.sunset
            ? b `<span
            ><ha-icon icon="mdi:weather-sunset-down"></ha-icon>${formatTime(snap.sun.sunset)}</span
          >`
            : A}
    `;
        return b `
      ${this._secHead("timeline", sun)}
      ${renderTimeline({
            events,
            sunriseMin: snap.sun.sunrise ? minutesOfDay(snap.sun.sunrise) : null,
            sunsetMin: snap.sun.sunset ? minutesOfDay(snap.sun.sunset) : null,
            nowMin: now.getHours() * 60 + now.getMinutes(),
            axisEveryH: this._narrow ? 6 : 3,
        })}
      ${cfg.timeline_legend ? this._renderLegend() : A}
      ${!snap.plan.length
            ? b `<div class="empty">${this._t("card_timeline_empty")}</div>`
            : cfg.timeline_list
                ? b `<div class="runs">
              ${snap.plan.map((occ) => this._renderRunRow(occ))}
            </div>`
                : selected
                    ? this._renderOccDetail(selected, true)
                    : A}
    `;
    }
    _renderLegend() {
        const dot = (cls, key) => b `<span><span class="dot ${cls}"></span>${this._t(key)}</span>`;
        return b `<div class="legend">
      ${dot("executed", "today_legend_executed")}
      ${dot("will_run", "today_legend_will_run")}
      ${dot("would_skip", "today_legend_would_skip")}
      ${dot("skipped", "today_legend_skipped")}
      ${dot("executed_partial", "today_legend_partial")}
      <span
        ><span class="swatch-retry"></span>${this._t("today_legend_retry")}</span
      >
    </div>`;
    }
    _renderRunRow(occ) {
        const key = occKey(occ);
        const open = this._selected === key;
        return b `
      <button
        type="button"
        class="run ${occ.fired ? "past" : ""} ${open ? "open" : ""}"
        aria-expanded=${open ? "true" : "false"}
        @click=${() => this._select(key)}
      >
        <span class="dot ${timelineClass(occ)}"></span>
        <span class="run-time">${formatTime(occ.planned_at)}</span>
        <span class="run-name ellipsis">${occ.scenario_name}</span>
        ${this._occBadge(occ)}
        <ha-icon icon="mdi:chevron-down"></ha-icon>
      </button>
      ${open ? this._renderOccDetail(occ, false) : A}
    `;
    }
    /** What one plan block does: targets, live check, and each cover's line. */
    _renderOccDetail(occ, solo) {
        // The block's own conditions fail for every cover alike and are named
        // once here; cover-scoped ones (window contact, position) are named on
        // the line of the cover they stop.
        const reason = occ.fired
            ? occReasonSummary(this._l, occ)
            : preflightReason(this._l, occ.preflight);
        const error = occ.fired &&
            occ.assignments.some((run) => ["blocked_safety", "unavailable"].includes(run.result ?? ""));
        return b `<div class="detail ${solo ? "solo" : ""}">
      ${solo
            ? b `<div class="detail-head">
            <span class="run-time">${formatTime(occ.planned_at)}</span>
            <span class="run-name ellipsis">${occ.scenario_name}</span>
            ${this._occBadge(occ)}
          </div>`
            : A}
      <div class="detail-facts">
        <span
          >${this._coversTarget(occ.assignments.length, occPositions(occ))}</span
        >
        ${retrySpanEnd(occ) != null && occ.retry_until
            ? b `<span
              >${this._t("card_retry_until", {
                time: formatTime(occ.retry_until),
            })}</span
            >`
            : A}
      </div>
      ${reason
            ? b `<div class="detail-reason ${error ? "error" : ""}">
            <ha-icon icon="mdi:information-outline"></ha-icon>
            <span>${reason}</span>
          </div>`
            : A}
      ${occ.assignments.length
            ? b `<div class="lines">
            ${occ.assignments.map((run) => this._renderRunLine(occ, run))}
          </div>`
            : A}
    </div>`;
    }
    _renderRunLine(occ, run) {
        // A block whose own conditions fail takes every cover with it, whatever
        // the cover's own checks say; otherwise each cover speaks for itself.
        const block = occ.fired ? "would_run" : (occ.preflight?.verdict ?? "would_run");
        const kind = block === "would_run" ? runKind(occ, run) : block;
        let state = "";
        if (occ.fired) {
            state = this._t(`status_${kind}`);
        }
        else if (block === "would_run" && kind !== "would_run") {
            state =
                preflightReason(this._l, run.preflight) ?? this._t(`preflight_${kind}`);
        }
        const severe = occ.fired && reasonSeverity(run.reason) === "error";
        return b `<div
      class="line"
      title=${occ.fired ? (formatReason(this._l, run.reason) ?? "") : ""}
    >
      <span class="dot ${kind}"></span>
      <span class="line-name ellipsis">${run.cover_name}</span>
      ${state
            ? b `<span class="line-state ${severe ? "err" : ""} ellipsis"
            >${state}</span
          >`
            : A}
      <span class="line-target">${run.target_position} %</span>
    </div>`;
    }
    // ---- section: covers ----------------------------------------------------
    _areaName(areaId) {
        if (!areaId)
            return this._t("covers_no_area");
        return this.hass?.areas?.[areaId]?.name ?? areaId;
    }
    _renderCovers(snap) {
        const cfg = this._cfg;
        const covers = pick(snap.covers, cfg.covers);
        const groups = cfg.group_by_area && new Set(covers.map((c) => c.area_id)).size > 1
            ? groupByArea(covers)
            : [[null, covers]];
        const grouped = groups.length > 1;
        return b `
      ${this._secHead("covers", b `<span>${covers.length}</span>`)}
      ${!covers.length
            ? b `<div class="empty">${this._t("card_covers_empty")}</div>`
            : groups.map(([area, list]) => b `
              ${grouped
                ? b `<div class="area">${this._areaName(area)}</div>`
                : A}
              <div class="rows">
                ${list.map((cover) => this._renderCover(cover))}
              </div>
            `)}
    `;
    }
    /** Position and movement, straight from the entity when the frontend has it. */
    _coverLive(cover) {
        const state = this.hass?.states[cover.entity_id];
        if (!state) {
            return { position: cover.position, moving: false, available: false };
        }
        if (["unavailable", "unknown"].includes(state.state)) {
            return { position: null, moving: false, available: false };
        }
        const raw = state.attributes.current_position;
        const position = typeof raw === "number"
            ? Math.round(raw)
            : state.state === "open"
                ? 100
                : state.state === "closed"
                    ? 0
                    : cover.position;
        return {
            position,
            moving: ["opening", "closing"].includes(state.state),
            available: true,
        };
    }
    _renderCoverSub(cover, available) {
        const parts = [];
        if (!available) {
            parts.push(b `<span class="err">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        ${this._t("card_cover_unavailable")}
      </span>`);
        }
        if (cover.contact_state === "open" || cover.contact_state === "tilted") {
            parts.push(b `<span class=${cover.safety_blocked ? "err" : "warn"}>
        <ha-icon
          icon=${cover.contact_state === "open"
                ? "mdi:window-open-variant"
                : "mdi:window-open"}
        ></ha-icon>
        ${this._t(`card_cover_window_${cover.contact_state}`)}
      </span>`);
        }
        const next = cover.next_action;
        if (!cover.enabled || !this._snapshot?.enabled) {
            parts.push(b `<span>${this._t("card_cover_auto_off")}</span>`);
        }
        else if (next?.armed &&
            next.fire_at &&
            new Date(next.fire_at).getTime() > Date.now()) {
            // Facade-relative scenario: armed, but simply for this cover's turn.
            parts.push(b `<span title=${next.scenario_name}>
        ${this._t("card_cover_next", {
                time: formatTime(next.fire_at),
                pos: next.position ?? 0,
            })}
      </span>`);
        }
        else if (next?.armed) {
            parts.push(b `<span class="warn" title=${next.scenario_name}>
        <ha-icon icon="mdi:timer-sand"></ha-icon>
        ${this._t("card_cover_waiting", {
                time: formatTime(next.armed_until ?? next.when),
            })}
      </span>`);
        }
        else if (next) {
            parts.push(b `<span title=${next.scenario_name}>
        ${this._t("card_cover_next", {
                time: formatTime(next.when),
                pos: next.position ?? 0,
            })}
      </span>`);
        }
        else if (parts.length === 0) {
            parts.push(b `<span>${this._t("card_cover_idle")}</span>`);
        }
        return b `<span class="cover-sub">${parts}</span>`;
    }
    /** How much of the glyph the shade fills. An awning is the odd one out:
        "open" means extended, so its fabric grows with the position. */
    _shade(cover, position) {
        if (position == null)
            return 0;
        return cover.kind === "awning" ? position : 100 - position;
    }
    _renderCover(cover) {
        const live = this._coverLive(cover);
        const icons = COVER_ICONS[cover.kind] ?? DEFAULT_COVER_ICONS;
        const glyphClass = [
            "glyph",
            live.position == null ? "unknown" : "",
            live.moving ? "moving" : "",
            live.available ? "" : "off",
        ].join(" ");
        const button = (command, icon, disabled) => b `<button
        type="button"
        title=${this._t(`card_cover_${command}`, { name: cover.name })}
        aria-label=${this._t(`card_cover_${command}`, { name: cover.name })}
        .disabled=${disabled ||
            !live.available ||
            this._isBusy(`cover:${cover.id}:${command}`)}
        @click=${() => this._drive(cover, command)}
      >
        <ha-icon icon=${icon}></ha-icon>
      </button>`;
        return b `<div class="cover">
      <button
        type="button"
        class="cover-main"
        @click=${() => this._moreInfo(cover.entity_id)}
      >
        <span
          class=${glyphClass}
          style="--closed:${this._shade(cover, live.position)}%"
          ><span class="shade"></span
        ></span>
        <span class="cover-text">
          <span class="cover-name">
            <span class="ellipsis">${cover.name}</span>
            ${live.position == null
            ? A
            : b `<span class="pos">${live.position} %</span>`}
          </span>
          ${this._renderCoverSub(cover, live.available)}
        </span>
      </button>
      ${this._cfg.cover_controls
            ? b `<span class="ctrl">
            ${button("open", icons.open, live.position === 100 && !live.moving)}
            ${button("stop", "mdi:stop", false)}
            ${button("close", icons.close, live.position === 0 && !live.moving)}
          </span>`
            : A}
    </div>`;
    }
    // ---- section: scenarios -------------------------------------------------
    _renderScenarios(snap) {
        const scenarios = pick(snap.scenarios, this._cfg.scenarios);
        return b `
      ${this._secHead("scenarios")}
      ${!scenarios.length
            ? b `<div class="empty">${this._t("card_scenarios_empty")}</div>`
            : b `<div class="rows">
            ${scenarios.map((scenario) => this._renderScenario(snap, scenario))}
          </div>`}
    `;
    }
    _scenarioStatus(scenario, occ) {
        if (!scenario.enabled) {
            return b `<span>${this._t("card_scn_disabled")}</span>`;
        }
        if (!occ) {
            return b `<span>${this._t("card_scn_not_today")}</span>`;
        }
        const when = b `<span
      >${this._t("card_scn_today", { time: formatTime(occ.planned_at) })}</span
    >`;
        if (!occ.fired) {
            const verdict = occVerdict(occ);
            if (verdict === "would_run")
                return when;
            return b `${when}<span class="warn"
          >${this._t(`preflight_${verdict}`)}</span
        >`;
        }
        const kind = occKind(occ);
        const tone = kind === "executed"
            ? "ok"
            : kind === "armed"
                ? "warn"
                : ["blocked_safety", "unavailable"].includes(kind)
                    ? "err"
                    : "";
        return b `${when}<span class=${tone}
        >${this._t(`status_${kind}`)}</span
      >`;
    }
    _renderScenario(snap, scenario) {
        const key = `scn:${scenario.id}`;
        const trigger = triggerMeta(scenario.trigger);
        const occ = scenarioOccurrence(scenario, snap.plan);
        const armed = this._confirm === key;
        const busy = this._isBusy(key);
        const feedback = this._renderFeedback(scenario.id);
        const count = scenario.cover_ids.length;
        const runLabel = this._t("card_scn_run", { name: scenario.name });
        return b `<div
      class="scn ${scenario.enabled ? "" : "muted"} ${armed ? "armed" : ""}"
    >
      <span
        class="scn-icon ${trigger.time ? "time" : ""}"
        title=${this._t(`card_trigger_${trigger.key}`)}
      >
        <ha-icon icon=${trigger.icon}></ha-icon>
      </span>
      <div class="scn-text">
        <div class="scn-name ellipsis">${scenario.name}</div>
        <div class="scn-sub">
          ${feedback !== A
            ? feedback
            : b `${this._scenarioStatus(scenario, occ)}<span class="tgt"
                  >${count
                ? this._coversTarget(count, scenario.positions)
                : this._t("card_scn_no_covers")}</span
                >`}
        </div>
      </div>
      ${armed
            ? b `<span class="scn-confirm">
            <button
              type="button"
              class="btn small confirm"
              data-confirm
              @click=${() => this._requestRun(key, scenario.id)}
            >
              <ha-icon icon="mdi:check"></ha-icon>
              ${this._t(this._cfg.ignore_conditions
                ? "card_scn_confirm_force"
                : "card_scn_confirm")}
            </button>
            <button
              type="button"
              class="iconbtn"
              title=${this._t("card_cancel")}
              aria-label=${this._t("card_cancel")}
              @click=${this._cancelConfirm}
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </span>`
            : b `<button
            type="button"
            class="play"
            title=${runLabel}
            aria-label=${runLabel}
            .disabled=${!count || busy}
            @click=${() => this._requestRun(key, scenario.id)}
          >
            <ha-icon
              class=${busy ? "spin" : ""}
              icon=${busy ? "mdi:loading" : "mdi:play"}
            ></ha-icon>
          </button>`}
    </div>`;
    }
    // ---- compact tile -------------------------------------------------------
    _renderCompact(snap) {
        const next = snap.enabled ? nextUp(snap.plan, Date.now()) : null;
        const waiting = snap.enabled && waitingRuns(snap.plan, Date.now()).length > 0;
        let sub;
        if (!snap.enabled) {
            sub = this._t("card_off_title");
        }
        else if (next) {
            sub = `${formatTime(next.planned_at)} · ${next.scenario_name} · ${this._lead(next.planned_at)}`;
        }
        else {
            sub = this._t(snap.plan.length ? "card_nothing_more" : "card_no_plan");
        }
        const showRun = next && this._cfg.next_actions.includes("run");
        const key = next ? `next:${next.scenario_id}` : "";
        const armed = Boolean(next) && this._confirm === key;
        const busy = this._isBusy(key);
        const outcome = next ? this._feedbackText(next.scenario_id) : null;
        return b `<ha-card>
      <div class="tile ${snap.enabled ? (waiting ? "warn" : "") : "off"}">
        <span class="tile-icon">
          <ha-icon icon="mdi:window-shutter-cog"></ha-icon>
        </span>
        <div class="tile-text">
          <div class="tile-title ellipsis">
            ${this._config?.title || snap.name}
          </div>
          <div class="tile-sub ellipsis" role="status">
            ${this._actionError ?? outcome ?? sub}
          </div>
        </div>
        ${showRun
            ? armed
                ? b `<button
                type="button"
                class="btn small confirm"
                data-confirm
                @click=${() => this._requestRun(key, next.scenario_id)}
              >
                <ha-icon icon="mdi:check"></ha-icon>
                ${this._t(this._cfg.ignore_conditions
                    ? "card_scn_confirm_force"
                    : "card_scn_confirm")}
              </button>`
                : b `<button
                type="button"
                class="play"
                title=${this._t("card_action_run")}
                aria-label=${this._t("card_action_run")}
                .disabled=${busy}
                @click=${() => this._requestRun(key, next.scenario_id)}
              >
                <ha-icon
                  class=${busy ? "spin" : ""}
                  icon=${busy ? "mdi:loading" : "mdi:play"}
                ></ha-icon>
              </button>`
            : this._statePill(snap)}
      </div>
    </ha-card>`;
    }
}
defineCustomElementOnce("advanced-cover-card", AdvancedCoverCard);
window.customCards = window.customCards ?? [];
if (!window.customCards.some((card) => card.type === "advanced-cover-card")) {
    window.customCards.push({
        type: "advanced-cover-card",
        name: "Advanced Cover Card",
        description: "Next scenario, today's timeline, cover controls and manual scenario runs — pick the sections you need.",
        preview: true,
        documentationURL: "https://github.com/florianbaethge/advanced_cover",
    });
}
// eslint-disable-next-line no-console
console.info(`%c ADVANCED-COVER-CARD %c ${"0.8.0"} `, "color: #fff; background: #03a9f4; font-weight: 700;", "color: #03a9f4; background: #fff; font-weight: 700;");

export { AdvancedCoverCard };
//# sourceMappingURL=advanced-cover-card.js.map
