/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$3=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$3=new WeakMap;let n$2 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$3&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$3.set(s,t));}return t}toString(){return this.cssText}};const r$2=t=>new n$2("string"==typeof t?t:t+"",void 0,s$2),i$5=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$2(o,t,s$2)},S$1=(s,o)=>{if(e$3)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$3?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$4,defineProperty:e$2,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$1,getOwnPropertySymbols:o$2,getPrototypeOf:n$1}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$2=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$4(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$2(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$1(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$1(t),...o$2(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$2?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$3=t=>t,s$1=t$1.trustedTypes,e$1=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$1=`lit$${Math.random().toFixed(9).slice(2)}$`,n="?"+o$1,r=`<${n}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m$1=/>/g,p$1=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e$1?e$1.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m$1:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p$1):void 0!==u[3]&&(c=p$1):c===p$1?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p$1:'"'===u[3]?$:g):c===$||c===g?c=p$1:c===_||c===m$1?c=v:(c=p$1,n=void 0);const x=c===p$1&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$1+x):s+o$1+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$1),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$1)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$1),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$1,t+1));)d.push({type:7,index:l}),t+=o$1.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$3(t).nextSibling;i$3(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t$1.litHtmlPolyfillSupport;B?.(S,k),(t$1.litHtmlVersions??=[]).push("3.3.3");const D$1=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;let i$2 = class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D$1(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}};i$2._$litElement$=true,i$2["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i$2});const o=s.litElementPolyfillSupport;o?.({LitElement:i$2});(s.litElementVersions??=[]).push("4.2.2");

const D = "advanced_cover";
const listEntries = (hass) => hass.callWS({ type: `${D}/entries/list` });
const fetchState = (hass, entryId) => hass.callWS({ type: `${D}/state`, entry_id: entryId });
const subscribeState = (hass, entryId, onState) => hass.connection?.subscribeMessage(onState, {
    type: `${D}/subscribe`,
    entry_id: entryId,
});
/** Resolve a (draft) trigger to today's base time via the scheduler's solver. */
const previewTrigger = (hass, entryId, trigger, coverItemIds) => hass.callWS({
    type: `${D}/trigger/preview`,
    entry_id: entryId,
    trigger,
    ...(coverItemIds?.length ? { cover_item_ids: coverItemIds } : {}),
});
const saveConfig = (hass, entryId, config) => hass.callWS({ type: `${D}/config/save`, entry_id: entryId, config });
const saveCover = (hass, entryId, cover) => hass.callWS({ type: `${D}/covers/save`, entry_id: entryId, cover });
const deleteCover = (hass, entryId, coverItemId) => hass.callWS({
    type: `${D}/covers/delete`,
    entry_id: entryId,
    cover_item_id: coverItemId,
});
const probeCover = (hass, entityId, contactEntityId) => hass.callWS({
    type: `${D}/covers/probe`,
    entity_id: entityId,
    ...(contactEntityId ? { contact_entity_id: contactEntityId } : {}),
});
const testCover = (hass, entryId, coverItemId, command, position) => hass.callWS({
    type: `${D}/covers/test`,
    entry_id: entryId,
    cover_item_id: coverItemId,
    command,
    ...(position !== undefined ? { position } : {}),
});
const saveScenario = (hass, entryId, scenario) => hass.callWS({ type: `${D}/scenarios/save`, entry_id: entryId, scenario });
const deleteScenario = (hass, entryId, scenarioId) => hass.callWS({
    type: `${D}/scenarios/delete`,
    entry_id: entryId,
    scenario_id: scenarioId,
});
const reorderScenarios = (hass, entryId, scenarioIds) => hass.callWS({
    type: `${D}/scenarios/reorder`,
    entry_id: entryId,
    scenario_ids: scenarioIds,
});
const runScenario = (hass, entryId, scenarioId, options) => hass.callWS({
    type: `${D}/scenarios/run`,
    entry_id: entryId,
    scenario_id: scenarioId,
    ...(options?.coverItemId ? { cover_item_id: options.coverItemId } : {}),
    ignore_conditions: Boolean(options?.ignoreConditions),
});
const recalculate = (hass, entryId) => hass.callWS({ type: `${D}/recalculate`, entry_id: entryId });

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
/** Days per month of a yearless date; February includes the leap day. */
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function daysInMonth(month) {
    return DAYS_IN_MONTH[month - 1] ?? 31;
}
/** Parse a yearless "MM-DD" date (a scenario's active period bounds). */
function parseMonthDay(value) {
    const match = /^(\d{1,2})-(\d{1,2})$/.exec(value ?? "");
    if (!match)
        return null;
    const month = Number(match[1]);
    const day = Number(match[2]);
    if (month < 1 || month > 12 || day < 1 || day > daysInMonth(month))
        return null;
    return { month, day };
}
function toMonthDay(month, day) {
    const clamped = Math.min(day, daysInMonth(month));
    return `${String(month).padStart(2, "0")}-${String(clamped).padStart(2, "0")}`;
}
function userLanguage(hass) {
    return hass?.locale?.language ?? hass?.language;
}
/** Localized month name; 2024 is a leap year, so every "MM-DD" is a real date. */
function monthName(hass, month) {
    return new Date(2024, month - 1, 1).toLocaleDateString(userLanguage(hass), {
        month: "long",
    });
}
/** "1. Apr" / "Apr 1" for a yearless "MM-DD" date in the user's locale. */
function formatMonthDay(hass, value) {
    const md = parseMonthDay(value);
    if (!md)
        return "–";
    return new Date(2024, md.month - 1, md.day).toLocaleDateString(userLanguage(hass), {
        day: "numeric",
        month: "short",
    });
}
const dayKey = (month, day) => month * 100 + day;
/**
 * Whether `now` lies inside one of the yearly periods (both days inclusive, a
 * start after the end wraps over the turn of the year; no periods = all
 * year). Mirrors `Scenario.active_on` in the backend.
 */
function inActivePeriods(periods, now = new Date()) {
    if (!periods?.length)
        return true;
    const today = dayKey(now.getMonth() + 1, now.getDate());
    return periods.some((p) => {
        const start = parseMonthDay(p.from);
        const end = parseMonthDay(p.to);
        if (!start || !end)
            return false;
        const a = dayKey(start.month, start.day);
        const b = dayKey(end.month, end.day);
        return a <= b ? a <= today && today <= b : today >= a || today <= b;
    });
}
/** Start ("MM-DD") of the period that begins next after `now`. */
function nextPeriodStart(periods, now = new Date()) {
    const today = dayKey(now.getMonth() + 1, now.getDate());
    let best = null;
    for (const p of periods ?? []) {
        const start = parseMonthDay(p.from);
        if (!start)
            continue;
        // Days-ish until the start, a passed start counting for next year.
        const wait = (dayKey(start.month, start.day) - today + 1300) % 1300;
        if (!best || wait < best.wait)
            best = { from: p.from, wait };
    }
    return best?.from ?? null;
}

/** How long to wait for a core element before rendering anyway. */
const ELEMENT_TIMEOUT_MS = 2000;
/**
 * Wait until core HA custom elements used by the panel are defined.
 *
 * `customElements.whenDefined()` never rejects — it simply stays pending while
 * an element is not registered, so a `.catch()` buys nothing. The panel blocks
 * its first render on this, which means an unresolved tag would leave the whole
 * panel blank rather than one unstyled field. `ha-entity-picker` and
 * `ha-selector` are the risky ones: they live in lazily loaded frontend chunks,
 * so cap the wait and render regardless once it elapses.
 */
async function loadHaPanelElements() {
    const tags = [
        "ha-menu-button",
        "ha-tab-group",
        "ha-tab-group-tab",
        "ha-card",
        "ha-icon",
        "ha-switch",
        "ha-entity-picker",
        "ha-selector",
    ];
    const ready = (tag) => Promise.race([
        customElements.whenDefined(tag),
        new Promise((resolve) => setTimeout(resolve, ELEMENT_TIMEOUT_MS)),
    ]).catch(() => undefined);
    await Promise.all(tags.map(ready));
}

const BASE = "advanced-cover";
const getPath = () => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts[0] !== BASE || parts.length < 2) {
        return { entryId: null, page: "today" };
    }
    return { entryId: parts[1], page: parts[2] || "today" };
};
const exportPath = (entryId, page) => `/${BASE}/${entryId}/${page}`;
/** Deep-link support: `?editScenario=<id>` opens the scenario editor. */
function getEditScenarioQuery() {
    try {
        return new URL(window.location.href).searchParams.get("editScenario");
    }
    catch {
        return null;
    }
}
/**
 * Remove `editScenario` from the URL without dispatching `location-changed`
 * (a navigate() would reload the panel and close the dialog again).
 */
function stripEditScenarioQueryFromUrl() {
    try {
        const url = new URL(window.location.href);
        if (!url.searchParams.has("editScenario"))
            return;
        url.searchParams.delete("editScenario");
        const qs = url.searchParams.toString();
        history.replaceState(null, "", url.pathname + (qs ? `?${qs}` : "") + url.hash);
    }
    catch {
        /* ignore */
    }
}

/** Root panel chrome (header, tabs, entry picker). */
const panelStyles = i$5 `
  :host {
    display: block;
    color: var(--primary-text-color);
  }
  .header {
    background-color: var(--app-header-background-color);
    color: var(--app-header-text-color, white);
    border-bottom: var(--app-header-border-bottom, none);
  }
  .toolbar {
    height: var(--header-height);
    display: flex;
    align-items: center;
    font-size: 20px;
    padding: 0 16px;
    font-weight: 400;
    box-sizing: border-box;
  }
  .main-title {
    margin: 0 0 0 24px;
    line-height: 20px;
    flex-grow: 1;
  }
  .version {
    font-size: 14px;
    opacity: 0.85;
  }
  ha-tab-group {
    margin-left: max(env(safe-area-inset-left), 24px);
    margin-right: max(env(safe-area-inset-right), 24px);
    --ha-tab-active-text-color: var(--app-header-text-color, white);
    --ha-tab-indicator-color: var(--app-header-text-color, white);
    --ha-tab-track-color: transparent;
  }
  .view {
    min-height: calc(100vh - 112px);
    display: flex;
    justify-content: center;
    padding: 16px;
    box-sizing: border-box;
  }
  .view-inner {
    width: 100%;
    max-width: 1100px;
    container-type: inline-size;
    container-name: acview;
  }
  .entry-picker {
    padding: 24px;
    max-width: 560px;
    margin: 0 auto;
  }
  .entry-picker h2 {
    margin: 0 0 8px;
    font-size: 1.5rem;
    font-weight: 600;
  }
  .entry-picker .lead {
    margin: 0 0 20px;
    color: var(--secondary-text-color);
    line-height: 1.5;
    font-size: 0.95rem;
  }
  .entry-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .entry-card {
    display: block;
    width: 100%;
    text-align: left;
    padding: 16px 18px;
    border-radius: 12px;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color);
    color: var(--primary-text-color);
    cursor: pointer;
    font: inherit;
    box-sizing: border-box;
  }
  .entry-card:hover {
    border-color: var(--primary-color);
  }
  .entry-card-title {
    font-size: 1.1rem;
    font-weight: 600;
  }
  .error {
    color: var(--error-color);
    margin: 8px 0;
  }
  .muted {
    opacity: 0.8;
    font-size: 0.9rem;
  }
`;
/** Shared styles for views: cards, rows, buttons, dialogs, chips, forms. */
const sharedStyles = i$5 `
  ha-card {
    margin-bottom: 20px;
    border-radius: 14px;
  }
  .card-content {
    padding: 20px 22px 22px;
  }
  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 22px 0;
    font-size: 1.25rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.3;
  }
  .card-header ha-icon {
    --mdc-icon-size: 22px;
    color: var(--primary-color);
  }
  .card-header .header-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    font-weight: 400;
  }
  .intro {
    font-size: 0.875rem;
    color: var(--secondary-text-color);
    line-height: 1.5;
    margin: 6px 0 18px;
  }

  /* Expandable inline help (info icon) */
  details.inline-help {
    margin: 6px 0 10px;
    font-size: 0.82rem;
  }
  details.inline-help summary {
    cursor: pointer;
    color: var(--secondary-text-color);
    list-style: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    user-select: none;
    transition: color 0.15s ease;
  }
  details.inline-help summary::-webkit-details-marker {
    display: none;
  }
  details.inline-help summary:hover,
  details.inline-help[open] summary {
    color: var(--primary-color);
  }
  details.inline-help .inline-help-icon {
    --mdc-icon-size: 16px;
    flex-shrink: 0;
    color: currentColor;
  }
  details.inline-help p {
    margin: 8px 0 4px;
    padding: 10px 14px;
    border-left: 3px solid var(--primary-color);
    border-radius: 0 8px 8px 0;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    color: var(--secondary-text-color);
    line-height: 1.55;
    max-width: 640px;
  }
  .error {
    color: var(--error-color);
    margin: 8px 0;
  }
  .warning {
    color: var(--warning-color, #b85c00);
    margin: 8px 0;
    font-size: 0.875rem;
  }
  .muted {
    color: var(--secondary-text-color);
    font-size: 0.875rem;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-end;
    margin-bottom: 12px;
  }
  .grow {
    flex: 1;
    min-width: 160px;
  }
  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--secondary-text-color);
    margin: 26px 0 10px;
  }
  .section-title::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--divider-color);
  }
  .section-desc {
    font-size: 0.825rem;
    color: var(--secondary-text-color);
    margin: 0 0 10px;
    line-height: 1.4;
  }

  /* Buttons */
  .btn,
  .btn-outline,
  .btn-danger,
  .btn-icon {
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 8px;
    padding: 8px 16px;
    cursor: pointer;
    border: 1px solid transparent;
    box-sizing: border-box;
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease,
      opacity 0.15s ease;
  }
  .btn {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }
  .btn:hover:not(:disabled) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22);
  }
  .btn:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .btn-outline {
    background: transparent;
    color: var(--primary-color);
    border-color: var(--primary-color);
  }
  .btn-outline:hover:not(:disabled) {
    background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.08);
  }
  .btn-danger {
    background: transparent;
    color: var(--error-color);
    border-color: var(--error-color);
  }
  .btn-danger:hover:not(:disabled) {
    background: rgba(244, 67, 54, 0.08);
  }
  .btn-icon {
    background: transparent;
    color: var(--primary-text-color);
    border: 1px solid var(--divider-color);
    padding: 6px 10px;
    line-height: 1;
  }
  .btn-icon:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  /* Inputs */
  label.field-label {
    display: block;
    font-size: 0.78rem;
    color: var(--secondary-text-color);
    margin-bottom: 4px;
  }
  input[type="text"],
  input[type="time"],
  input[type="number"],
  select {
    font: inherit;
    color: var(--primary-text-color);
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    padding: 8px 10px;
    box-sizing: border-box;
    width: 100%;
  }
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 1px;
  }
  input[type="range"] {
    width: 100%;
  }
  ha-entity-picker,
  ha-selector {
    display: block;
    width: 100%;
  }
  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0;
    font-size: 0.9rem;
  }

  /* Chips */
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    font: inherit;
    font-size: 0.8rem;
    padding: 5px 10px;
    border-radius: 14px;
    border: 1px solid var(--divider-color);
    background: transparent;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .chip.selected {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
  }
  .chip.readonly {
    cursor: default;
    color: var(--secondary-text-color);
  }

  /* Status badges */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
    color: var(--secondary-text-color);
  }
  .badge::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
  .badge-executed {
    color: var(--success-color, #0f9d58);
  }
  .badge-skipped {
    color: var(--secondary-text-color);
  }
  .badge-armed {
    color: var(--warning-color, #b85c00);
  }
  .badge-expired {
    color: var(--secondary-text-color);
  }
  .badge-blocked_safety {
    color: var(--error-color);
  }
  .badge-unavailable {
    color: var(--error-color);
  }
  .badge-planned {
    color: var(--primary-color);
  }

  /* List rows */
  .list-row-wrap {
    display: flex;
    align-items: stretch;
    margin-bottom: 12px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid var(--divider-color);
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.02));
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .list-row-wrap:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
  }
  .list-row-accent {
    width: 6px;
    flex-shrink: 0;
    background: var(--primary-color);
  }
  .list-row-accent.inactive {
    background: var(--disabled-text-color, rgba(158, 158, 158, 0.45));
  }
  .list-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 16px;
    flex: 1;
    min-width: 0;
    padding: 14px 16px;
  }
  .list-main {
    flex: 1;
    min-width: 160px;
  }
  .list-name {
    font-size: 1.05rem;
    font-weight: 600;
    margin: 0 0 4px;
  }
  .list-detail {
    font-size: 0.85rem;
    color: var(--secondary-text-color);
    margin: 0;
    line-height: 1.4;
  }
  .list-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  /* Dialog (plain, works inside scoped registries) */
  .dialog-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 4vh 16px;
    z-index: 10;
    overflow-y: auto;
  }
  .dialog {
    background: var(--card-background-color);
    color: var(--primary-text-color);
    border-radius: 16px;
    width: 100%;
    max-width: 680px;
    padding: 26px 28px;
    box-sizing: border-box;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }
  .dialog h3 {
    margin: 0 0 20px;
    font-size: 1.3rem;
    font-weight: 500;
    letter-spacing: -0.01em;
  }
  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 20px;
    flex-wrap: wrap;
  }
  .dialog-actions .spacer {
    flex: 1;
  }

  /* Condition sentence rows */
  .cond-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    margin-bottom: 8px;
    font-size: 0.9rem;
  }
  .cond-row select,
  .cond-row input {
    width: auto;
    min-width: 90px;
    padding: 5px 8px;
    font-size: 0.85rem;
  }
  /* The HA pickers are block elements with their own internal padding — let them
     share the sentence row instead of claiming the full width. */
  .cond-row .cond-entity {
    flex: 1 1 240px;
    min-width: 200px;
  }
  .cond-row .cond-state {
    flex: 1 1 160px;
    min-width: 140px;
  }
  .cond-remove {
    margin-left: auto;
    background: none;
    border: none;
    color: var(--secondary-text-color);
    font-size: 1rem;
    cursor: pointer;
    padding: 4px;
  }
  .cond-remove:hover {
    color: var(--error-color);
  }

  .position-bar {
    position: relative;
    height: 8px;
    border-radius: 4px;
    background: var(--divider-color);
    overflow: hidden;
    min-width: 60px;
  }
  .position-bar-fill {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: var(--primary-color);
  }

  /* Empty states */
  .empty-state {
    text-align: center;
    padding: 36px 20px;
    color: var(--secondary-text-color);
  }
  .empty-state ha-icon {
    --mdc-icon-size: 44px;
    opacity: 0.35;
    display: block;
    margin: 0 auto 10px;
  }
  .empty-state p {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.5;
  }

  details.expand {
    margin: 8px 0;
  }
  details.expand summary {
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--primary-color);
  }
  table.plain {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  table.plain th,
  table.plain td {
    text-align: left;
    padding: 8px 10px;
    border-bottom: 1px solid var(--divider-color);
    vertical-align: top;
  }
  table.plain th {
    color: var(--secondary-text-color);
    font-weight: 500;
  }

  /* ---- Redesign v0.3 shared components ------------------------------- */

  /* Removable chip: icon sits at the chip's baseline, dimmed until hover. */
  .chip.chip-removable ha-icon {
    --mdc-icon-size: 15px;
    opacity: 0.7;
    vertical-align: -2px;
  }

  /* Preflight badge (would run / would skip / cannot evaluate). */
  .preflight-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 3px 9px 3px 7px;
    border-radius: 999px;
    border: 1px solid transparent;
    white-space: nowrap;
  }
  .preflight-badge ha-icon {
    --mdc-icon-size: 15px;
  }
  .preflight-badge.would_run {
    color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    border-color: color-mix(in srgb, var(--primary-color) 45%, transparent);
  }
  .preflight-badge.would_skip {
    color: var(--warning-color, #f0b23a);
    background: color-mix(in srgb, var(--warning-color, #f0b23a) 12%, transparent);
    border-color: color-mix(
      in srgb,
      var(--warning-color, #f0b23a) 45%,
      transparent
    );
  }
  .preflight-badge.unknown {
    color: var(--secondary-text-color);
    background: color-mix(in srgb, var(--secondary-text-color) 12%, transparent);
    border-color: color-mix(
      in srgb,
      var(--secondary-text-color) 40%,
      transparent
    );
  }

  /* Condition checklist line (preflight detail). */
  .cond-check {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 0.82rem;
    line-height: 1.4;
    padding: 3px 0;
    color: var(--secondary-text-color);
  }
  .cond-check ha-icon {
    --mdc-icon-size: 17px;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .cond-check.ok ha-icon {
    color: var(--success-color, #43a047);
  }
  .cond-check.fail {
    color: var(--primary-text-color);
  }
  .cond-check.fail ha-icon {
    color: var(--warning-color, #f0b23a);
  }
  .cond-check.na ha-icon {
    color: var(--disabled-text-color, #6d7476);
  }
  .cond-check .cond-actual {
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }

  /* Segmented icon button group (open · stop · close, filters). */
  .icon-group {
    display: inline-flex;
    border: 1px solid var(--divider-color);
    border-radius: 9px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .icon-group button {
    font: inherit;
    border: none;
    background: transparent;
    color: var(--primary-text-color);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 38px;
    height: 34px;
    padding: 0 6px;
    border-left: 1px solid var(--divider-color);
    transition: background 0.12s ease, color 0.12s ease;
  }
  .icon-group button:first-child {
    border-left: none;
  }
  .icon-group button:hover:not(:disabled) {
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    color: var(--primary-color);
  }
  .icon-group button.selected {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }
  .icon-group button:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .icon-group ha-icon {
    --mdc-icon-size: 20px;
  }

  /* Compact list row: header + optional expanded detail stack vertically.
     Left accent is a rounded border (matches Today's .block / Scenarios .srow). */
  .compact-row {
    border: 1px solid var(--divider-color);
    border-left: 3px solid var(--primary-color);
    border-radius: 10px;
    background: var(--card-background-color);
    margin-bottom: 8px;
    overflow: hidden;
    transition: background 0.12s ease;
  }
  .compact-row:hover {
    background: color-mix(in srgb, var(--primary-color) 4%, var(--card-background-color));
  }
  .compact-row.inactive {
    border-left-color: var(--disabled-text-color, #6d7476);
  }
  .compact-row.danger {
    border-left-color: var(--error-color, #d93025);
  }

  /* Icon-only button with a guaranteed hit area + focus ring. */
  .iconbtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: var(--primary-text-color);
    cursor: pointer;
    flex-shrink: 0;
  }
  .iconbtn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    color: var(--primary-color);
  }
  .iconbtn:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .iconbtn.danger:hover:not(:disabled) {
    background: color-mix(in srgb, var(--error-color) 14%, transparent);
    color: var(--error-color);
  }
  .iconbtn ha-icon {
    --mdc-icon-size: 22px;
  }
  .iconbtn:focus-visible,
  .icon-group button:focus-visible,
  .chip:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }

  /* Meta line with inline mdi icons (room, azimuth, contact, next action). */
  .meta-line {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 12px;
    font-size: 0.8rem;
    color: var(--secondary-text-color);
    min-width: 0;
  }
  .meta-line .meta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }
  .meta-line ha-icon {
    --mdc-icon-size: 16px;
    flex-shrink: 0;
  }

  /* Segmented filter control (All / Upcoming / Issues). */
  .segmented {
    display: inline-flex;
    border: 1px solid var(--divider-color);
    border-radius: 9px;
    overflow: hidden;
  }
  .segmented button {
    font: inherit;
    font-size: 0.8rem;
    border: none;
    border-left: 1px solid var(--divider-color);
    background: transparent;
    color: var(--secondary-text-color);
    padding: 6px 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .segmented button:first-child {
    border-left: none;
  }
  .segmented button.selected {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }
  .segmented .count {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0 6px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--warning-color, #f0b23a) 22%, transparent);
    color: var(--warning-color, #f0b23a);
  }
  .segmented button.selected .count {
    background: rgba(255, 255, 255, 0.25);
    color: inherit;
  }

  /* Truncating text that must never wrap in a data row. */
  .ellipsis {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
`;

/**
 * Compass-point math, free of any rendering import so it can be unit-tested
 * and shared with the scenario summaries.
 */
/** The eight compass points and their azimuth in degrees. */
const COMPASS = [
    ["N", 0],
    ["NE", 45],
    ["E", 90],
    ["SE", 135],
    ["S", 180],
    ["SW", 225],
    ["W", 270],
    ["NW", 315],
];
const COMPASS_BY_DEG = Object.fromEntries(COMPASS.map(([label, deg]) => [deg, label]));
/** Show the compass label for exact matches, otherwise the raw degrees. */
function formatAzimuth(deg) {
    return COMPASS_BY_DEG[deg] ?? `${deg}°`;
}
/**
 * Bucket an azimuth to the nearest of the eight compass points (returned as
 * degrees: 0, 45, … 315). A window at 200° maps to S (180°), at 210° to SW.
 */
function nearestCompassDeg(azimuth) {
    const a = ((azimuth % 360) + 360) % 360;
    return (Math.round(a / 45) % 8) * 45;
}

/**
 * Compass widget: eight direction buttons arranged in a circle around the
 * current azimuth value. Spatially readable, with the number field as a
 * fallback for arbitrary degrees.
 */
function renderCompass(azimuth, onSelect) {
    const r = 62; // radius in px
    return b `
    <div class="compass" role="group" aria-label="Azimuth">
      ${COMPASS.map(([label, deg]) => {
        // 0° = North at the top; clockwise. Screen y grows downward.
        const rad = ((deg - 90) * Math.PI) / 180;
        const x = Math.cos(rad) * r;
        const y = Math.sin(rad) * r;
        return b `<button
          type="button"
          class="compass-point ${azimuth === deg ? "selected" : ""}"
          style="transform:translate(calc(-50% + ${x}px), calc(-50% + ${y}px))"
          @click=${() => onSelect(deg)}
        >
          ${label}
        </button>`;
    })}
      <div class="compass-center">
        ${azimuth == null ? "–" : `${azimuth}°`}
      </div>
    </div>
  `;
}
const compassStyles = i$5 `
  .compass {
    position: relative;
    width: 168px;
    height: 168px;
    margin: 4px auto 8px;
  }
  .compass-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--primary-text-color);
    width: 46px;
    height: 46px;
    border-radius: 50%;
    border: 1px solid var(--divider-color);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .compass-point {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color);
    color: var(--secondary-text-color);
    font: inherit;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .compass-point:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
  .compass-point.selected {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
  }
`;

/** Searchable entity picker; emits the selected entity_id (`""` when cleared). */
function renderEntityField(hass, 
/** Domains to offer, or `null` for every entity (conditions accept any). */
domains, label, value, onValue, { allowCustom = false, className } = {}) {
    return b `
    <ha-entity-picker
      class=${className ?? ""}
      .hass=${hass}
      .label=${label || undefined}
      .value=${value || undefined}
      .includeDomains=${domains ?? undefined}
      .allowCustomEntity=${allowCustom}
      .required=${false}
      @value-changed=${(e) => onValue(e.detail.value ?? "")}
    ></ha-entity-picker>
  `;
}
/**
 * Searchable area picker; emits the selected area_id (`""` when cleared).
 *
 * The panel used to render a `<datalist>` over `hass.areas`, which put the raw
 * `area_id` in the text field — the user typed and read the slug while the
 * friendly name was only a suggestion. The native selector shows the name and
 * still hands back the id, so the stored `area_id` is unchanged.
 */
function renderAreaField(hass, label, value, onValue, { className } = {}) {
    return b `
    <ha-selector
      class=${className ?? ""}
      .hass=${hass}
      .selector=${{ area: { multiple: false } }}
      .label=${label}
      .value=${value || undefined}
      .required=${false}
      @value-changed=${(e) => onValue(e.detail.value ?? "")}
    ></ha-selector>
  `;
}
/**
 * State picker for one entity: the value stays the raw state (`"on"`) while the
 * dropdown shows the localized label ("On").
 *
 * `ha-selector-state` always sets `allow-custom-value`, so a state the entity
 * does not currently report can still be typed — the contact map depends on
 * that for handle sensors that only report `tilted` while actually tilted.
 */
function renderEntityStateField(hass, entityId, label, value, onValue, { hideStates, helper, className } = {}) {
    // The offered states come from the entity, so without one there is nothing to
    // choose from — say so instead of showing an empty dropdown.
    const noEntity = !entityId.trim();
    return b `
    <ha-selector
      class=${className ?? ""}
      .hass=${hass}
      .selector=${{
        state: { entity_id: entityId || undefined, hide_states: hideStates },
    }}
      .label=${label}
      .value=${value}
      .disabled=${noEntity}
      .required=${false}
      .helper=${noEntity ? helper : undefined}
      @value-changed=${(e) => onValue(e.detail.value ?? "")}
    ></ha-selector>
  `;
}
/** Localized label for a raw state, falling back to the raw value. */
function formatState(hass, entityId, state) {
    const stateObj = entityId ? hass.states[entityId] : undefined;
    if (!stateObj || !hass.formatEntityState)
        return state;
    return hass.formatEntityState(stateObj, state) || state;
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

/**
 * Small expandable info block: a subtle info-icon summary that unfolds an
 * explanation paragraph. Translation keys:
 *   config_panel.help_<key>_title   (short summary label)
 *   config_panel.help_<key>_body    (explanation text)
 */
function renderHelp(hass, key) {
    return b `
    <details class="inline-help">
      <summary>
        <ha-icon class="inline-help-icon" icon="mdi:information-outline"></ha-icon>
        ${t(hass, `config_panel.help_${key}_title`)}
      </summary>
      <p>${t(hass, `config_panel.help_${key}_body`)}</p>
    </details>
  `;
}

const KINDS = ["shutter", "blind", "awning", "curtain", "shade", "other"];
const KIND_ICONS = {
    shutter: "mdi:window-shutter",
    blind: "mdi:blinds-horizontal",
    awning: "mdi:awning-outline",
    curtain: "mdi:curtains",
    shade: "mdi:roller-shade",
    other: "mdi:window-closed-variant",
};
const CONTACT_ICONS = {
    closed: "mdi:window-closed",
    tilted: "mdi:window-open",
    open: "mdi:window-open-variant",
    unknown: "mdi:help-circle-outline",
};
function emptyDraft() {
    return {
        id: "",
        name: "",
        cover_entity_id: "",
        kind: "shutter",
        area_id: null,
        azimuth: null,
        low_mode_entity_id: null,
        low_mode_script_id: null,
        manual_low_mode: false,
        contact_entity_id: null,
        contact_state_map: {},
        safety: { ventilation_position: 20, mode: "block", block_when_tilted: false },
        enabled: true,
    };
}
class ViewCovers extends i$2 {
    constructor() {
        super(...arguments);
        this._busy = false;
        this._draft = null;
        this._draftCaps = null;
        this._testPosition = {};
        this._expanded = new Set();
        this._search = "";
    }
    static { this.properties = {
        hass: { attribute: false },
        entryId: { type: String },
        snapshot: { attribute: false },
    }; }
    static { this.styles = [
        sharedStyles,
        compassStyles,
        i$5 `
      .toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 12px;
      }
      .search {
        display: flex;
        align-items: center;
        gap: 6px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 4px 10px;
        flex: 1;
        max-width: 320px;
      }
      .search ha-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }
      .search input {
        border: none;
        background: none;
        padding: 4px 0;
        width: 100%;
      }
      .search input:focus-visible {
        outline: none;
      }
      /* Room group header with collective control. */
      .group-head {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 18px 0 8px;
      }
      .group-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 0.85rem;
      }
      .group-title ha-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }
      .group-title .n {
        color: var(--secondary-text-color);
        font-weight: 400;
      }
      .group-next {
        font-size: 0.78rem;
        color: var(--secondary-text-color);
      }
      .group-head .icon-group {
        margin-left: auto;
      }
      /* Compact row: full-width clickable toggle + trailing controls.
         The control buttons and chevron are siblings of the toggle — never
         nested inside it, since a native <button> nested in a <button> is
         invalid HTML and the parser expels it onto its own line. */
      .crow-head {
        display: flex;
        align-items: center;
        padding-right: 8px;
      }
      .crow {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 0;
        box-sizing: border-box;
        padding: 8px 12px;
        cursor: pointer;
        background: none;
        border: none;
        text-align: left;
        font: inherit;
        color: inherit;
      }
      .crow > ha-switch {
        flex-shrink: 0;
      }
      .kind-icon {
        --mdc-icon-size: 21px;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }
      .crow-main {
        min-width: 0;
        flex: 1 1 180px;
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .crow-name {
        font-weight: 500;
        font-size: 0.95rem;
      }
      .crow-pos {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 150px;
        flex-shrink: 0;
      }
      .crow-pos .position-bar {
        flex: 1;
      }
      .crow-pos .pos-val {
        font-size: 0.82rem;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        width: 34px;
        text-align: right;
      }
      .crow-next {
        flex: 1 1 0;
        min-width: 0;
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .crow-next ha-icon {
        --mdc-icon-size: 16px;
        flex-shrink: 0;
      }
      .crow-chevron-btn {
        flex-shrink: 0;
        width: 34px;
        height: 34px;
        border-radius: 8px;
      }
      .crow-chevron {
        --mdc-icon-size: 22px;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }
      .link-off {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: var(--error-color, #d93025);
        font-size: 0.8rem;
        flex-shrink: 0;
      }
      .link-off ha-icon {
        --mdc-icon-size: 18px;
      }
      /* Expanded detail. */
      .crow-detail {
        padding: 4px 14px 14px 26px;
        border-top: 1px solid var(--divider-color);
      }
      .drive-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin: 10px 0;
      }
      .drive-row .slider {
        flex: 1;
        min-width: 160px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .drive-row .slider input[type="range"] {
        flex: 1;
      }
      .safety-note {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-size: 0.8rem;
        color: var(--warning-color, #f0b23a);
        margin: 4px 0;
      }
      .safety-note ha-icon {
        --mdc-icon-size: 16px;
        margin-top: 1px;
        flex-shrink: 0;
      }
      .detail-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
        flex-wrap: wrap;
      }
      .manual-low {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-left: auto;
        font-size: 0.85rem;
        cursor: pointer;
      }
      .manual-low ha-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }
      .manual-low.dialog-row {
        margin: 10px 0 0;
        align-items: flex-start;
      }
      .manual-low.dialog-row ha-icon {
        margin-top: 2px;
      }
      .low-tag {
        --mdc-icon-size: 16px;
        color: var(--primary-color);
        align-self: center;
        margin: 0 2px;
      }
      .today-actions {
        margin-top: 12px;
      }
      .today-actions .ta-title {
        font-size: 0.74rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
        font-weight: 600;
        margin-bottom: 6px;
      }
      .ta-row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.82rem;
        padding: 3px 0;
      }
      .ta-row .ta-time {
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
      }
      .ta-row .ta-name {
        flex: 1;
        min-width: 0;
      }
      /* Dialog sticky header/footer. */
      .dialog.sticky {
        padding: 0;
        display: flex;
        flex-direction: column;
        max-height: 92vh;
      }
      .dialog-head {
        position: sticky;
        top: 0;
        background: var(--card-background-color);
        padding: 20px 24px 12px;
        border-bottom: 1px solid var(--divider-color);
        z-index: 1;
      }
      .dialog-head h3 {
        margin: 0;
      }
      .dialog-scroll {
        overflow-y: auto;
        padding: 12px 24px;
      }
      .dialog-foot {
        position: sticky;
        bottom: 0;
        background: var(--card-background-color);
        padding: 12px 24px;
        border-top: 1px solid var(--divider-color);
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .map-row {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 6px;
      }
      .map-row select {
        width: auto;
      }
      .map-row ha-selector.map-state {
        flex: 1 1 200px;
        min-width: 0;
      }

      @container acview (max-width: 900px) {
        .crow-next {
          display: none;
        }
      }
      @container acview (max-width: 620px) {
        .crow-head .icon-group {
          display: none;
        }
        /* Two-line row: switch/icon/name + meta on top, position bar below.
           Frees the full width for the name (no more hard truncation) and
           drops the position + chevron onto their own line. */
        .crow {
          display: grid;
          grid-template-columns: auto auto 1fr;
          grid-template-areas:
            "sw ic main"
            ".  .  pos";
          column-gap: 10px;
          row-gap: 6px;
          align-items: center;
        }
        .crow > ha-switch {
          grid-area: sw;
        }
        .crow .kind-icon {
          grid-area: ic;
        }
        .crow-main {
          grid-area: main;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: baseline;
          column-gap: 10px;
          row-gap: 2px;
        }
        /* Now that the row is full-width, let the name breathe instead of
           truncating; meta chips wrap under it only when it is truly long. */
        .crow .crow-name {
          white-space: normal;
          overflow: visible;
          overflow-wrap: anywhere;
        }
        .crow-pos {
          grid-area: pos;
          width: auto;
        }
        /* Pull the chevron down so it sits on the position line, not centered
           between the two lines. */
        .crow-chevron-btn {
          align-self: flex-end;
          margin-bottom: 2px;
        }
        .crow-detail {
          padding-left: 14px;
        }
        .drive-row .slider {
          min-width: 120px;
        }
      }
    `,
    ]; }
    _areaName(areaId) {
        if (!areaId)
            return t(this.hass, "config_panel.covers_no_area");
        return this.hass.areas?.[areaId]?.name ?? areaId;
    }
    _filteredCovers() {
        const q = this._search.trim().toLowerCase();
        if (!q)
            return this.snapshot.covers;
        return this.snapshot.covers.filter((c) => c.name.toLowerCase().includes(q) ||
            c.cover_entity_id.toLowerCase().includes(q) ||
            this._areaName(c.area_id).toLowerCase().includes(q));
    }
    _groupByArea(covers) {
        const groups = new Map();
        for (const cover of covers) {
            const key = cover.area_id ?? null;
            (groups.get(key) ?? groups.set(key, []).get(key)).push(cover);
        }
        if (groups.size === 1 && groups.has(null)) {
            return [{ areaId: null, label: "", covers }];
        }
        const withArea = [...groups.entries()]
            .filter(([areaId]) => areaId !== null)
            .map(([areaId, items]) => ({
            areaId,
            label: this._areaName(areaId),
            covers: items,
        }))
            .sort((a, b) => a.label.localeCompare(b.label));
        const noArea = groups.get(null);
        if (noArea) {
            withArea.push({
                areaId: null,
                label: this._areaName(null),
                covers: noArea,
            });
        }
        return withArea;
    }
    // ------------------------------------------------------------ dialog logic
    _openAdd() {
        this._draft = emptyDraft();
        this._draftCaps = null;
        this._error = undefined;
        this.requestUpdate();
    }
    _openEdit(cover) {
        const { capabilities, current_position, contact_state, safety_blocked, next_action, missing_entities, ...item } = cover;
        this._draft = JSON.parse(JSON.stringify(item));
        this._draftCaps = capabilities;
        this._error = undefined;
        this.requestUpdate();
    }
    _patchDraft(patch) {
        if (!this._draft)
            return;
        this._draft = { ...this._draft, ...patch };
        this.requestUpdate();
    }
    async _probe() {
        if (!this._draft?.cover_entity_id)
            return;
        try {
            const res = await probeCover(this.hass, this._draft.cover_entity_id, this._draft.contact_entity_id ?? undefined);
            this._draftCaps = res.capabilities;
            const patch = {};
            if (!this._draft.id)
                patch.kind = res.suggested_kind;
            if (res.suggested_contact_map &&
                Object.keys(this._draft.contact_state_map).length === 0) {
                patch.contact_state_map = res.suggested_contact_map;
            }
            this._patchDraft(patch);
        }
        catch (e) {
            this._error = formatApiError(e, this.hass);
            this.requestUpdate();
        }
    }
    async _save() {
        if (!this._draft)
            return;
        if (!this._draft.name.trim() || !this._draft.cover_entity_id.trim()) {
            this._error = t(this.hass, "config_panel.covers_err_name_entity_required");
            this.requestUpdate();
            return;
        }
        this._busy = true;
        this.requestUpdate();
        try {
            await saveCover(this.hass, this.entryId, this._draft);
            this._draft = null;
            this._error = undefined;
        }
        catch (e) {
            this._error = formatApiError(e, this.hass);
        }
        finally {
            this._busy = false;
            this.requestUpdate();
        }
    }
    async _delete(cover) {
        if (!window.confirm(t(this.hass, "config_panel.covers_delete_confirm", { name: cover.name }))) {
            return;
        }
        try {
            await deleteCover(this.hass, this.entryId, cover.id);
        }
        catch (e) {
            this._error = formatApiError(e, this.hass);
            this.requestUpdate();
        }
    }
    async _toggleEnabled(cover) {
        try {
            await saveCover(this.hass, this.entryId, { ...cover, enabled: !cover.enabled });
        }
        catch (e) {
            this._error = formatApiError(e, this.hass);
            this.requestUpdate();
        }
    }
    async _toggleManualLow(cover) {
        try {
            await saveCover(this.hass, this.entryId, {
                ...cover,
                manual_low_mode: !cover.manual_low_mode,
            });
        }
        catch (e) {
            this._error = formatApiError(e, this.hass);
            this.requestUpdate();
        }
    }
    async _test(coverId, command, position) {
        try {
            await testCover(this.hass, this.entryId, coverId, command, position);
        }
        catch (e) {
            this._error = formatApiError(e, this.hass);
            this.requestUpdate();
        }
    }
    async _groupTest(covers, command) {
        for (const c of covers) {
            if (!c.missing_entities.length)
                await this._test(c.id, command);
        }
    }
    _toggleExpand(id) {
        if (this._expanded.has(id))
            this._expanded.delete(id);
        else
            this._expanded.add(id);
        this.requestUpdate();
    }
    // -------------------------------------------------------------- rendering
    _renderControlGroup(cover) {
        const low = cover.manual_low_mode &&
            Boolean(cover.low_mode_entity_id || cover.low_mode_script_id);
        return b `
      <div class="icon-group" @click=${(e) => e.stopPropagation()}>
        ${low
            ? b `<ha-icon
              class="low-tag"
              icon="mdi:tortoise"
              title=${t(this.hass, "config_panel.covers_manual_low_active")}
            ></ha-icon>`
            : A}
        <button
          type="button"
          title=${t(this.hass, "config_panel.covers_test_open")}
          aria-label=${t(this.hass, "config_panel.covers_test_open")}
          @click=${() => this._test(cover.id, "open")}
        >
          <ha-icon icon="mdi:arrow-up"></ha-icon>
        </button>
        <button
          type="button"
          title=${t(this.hass, "config_panel.covers_test_stop")}
          aria-label=${t(this.hass, "config_panel.covers_test_stop")}
          @click=${() => this._test(cover.id, "stop")}
        >
          <ha-icon icon="mdi:stop"></ha-icon>
        </button>
        <button
          type="button"
          title=${t(this.hass, "config_panel.covers_test_close")}
          aria-label=${t(this.hass, "config_panel.covers_test_close")}
          @click=${() => this._test(cover.id, "close")}
        >
          <ha-icon icon="mdi:arrow-down"></ha-icon>
        </button>
      </div>
    `;
    }
    _renderRow(cover) {
        const expanded = this._expanded.has(cover.id);
        const missing = cover.missing_entities.length > 0;
        const na = cover.next_action;
        const accentClass = missing ? "danger" : cover.enabled ? "" : "inactive";
        return b `
      <div class="compact-row ${accentClass}">
        <div class="crow-head">
        <button
          type="button"
          class="crow"
          aria-expanded=${expanded ? "true" : "false"}
          @click=${() => this._toggleExpand(cover.id)}
        >
          <ha-switch
            .checked=${cover.enabled}
            title=${t(this.hass, "config_panel.covers_toggle_automation")}
            @click=${(e) => {
            e.stopPropagation();
            this._toggleEnabled(cover);
        }}
          ></ha-switch>
          <ha-icon
            class="kind-icon"
            .icon=${KIND_ICONS[cover.kind] ?? KIND_ICONS.other}
          ></ha-icon>
          <div class="crow-main">
            <span class="crow-name ellipsis">${cover.name}</span>
            <span class="meta-line">
              ${cover.azimuth != null
            ? b `<span class="meta"
                    ><ha-icon icon="mdi:compass-outline"></ha-icon
                    >${formatAzimuth(cover.azimuth)}</span
                  >`
            : A}
              ${cover.contact_state
            ? b `<span class="meta"
                    ><ha-icon
                      .icon=${CONTACT_ICONS[cover.contact_state] ??
                CONTACT_ICONS.unknown}
                    ></ha-icon
                    >${t(this.hass, `config_panel.contact_${cover.contact_state}`)}</span
                  >`
            : A}
              ${cover.safety_blocked
            ? b `<span class="meta" style="color:var(--error-color)"
                    ><ha-icon icon="mdi:shield-alert-outline"></ha-icon>Safety</span
                  >`
            : A}
              ${cover.kind === "awning"
            ? b `<span class="meta"
                    >${t(this.hass, "config_panel.covers_awning_extended")}</span
                  >`
            : A}
            </span>
          </div>
          ${cover.current_position != null
            ? b `<div class="crow-pos">
                <div class="position-bar">
                  <div
                    class="position-bar-fill"
                    style="width:${cover.current_position}%"
                  ></div>
                </div>
                <span class="pos-val">${cover.current_position}%</span>
              </div>`
            : b `<div class="crow-pos"></div>`}
          <div class="crow-next">
            ${na
            ? b `<ha-icon
                    icon=${na.armed ? "mdi:timer-sand" : "mdi:arrow-right-thin"}
                  ></ha-icon>
                  <span class="ellipsis"
                    >${formatTime(na.when)} · ${na.position}% ${na.scenario_name}</span
                  >`
            : b `<span class="ellipsis"
                  >${t(this.hass, "config_panel.covers_no_action_today")}</span
                >`}
          </div>
        </button>
          ${missing
            ? b `<span class="link-off"
                ><ha-icon icon="mdi:link-variant-off"></ha-icon
                >${t(this.hass, "config_panel.covers_link_missing")}</span
              >`
            : this._renderControlGroup(cover)}
          <button
            type="button"
            class="iconbtn crow-chevron-btn"
            aria-expanded=${expanded ? "true" : "false"}
            aria-label=${t(this.hass, "config_panel.covers_expand")}
            @click=${() => this._toggleExpand(cover.id)}
          >
            <ha-icon
              class="crow-chevron"
              icon=${expanded ? "mdi:chevron-up" : "mdi:chevron-down"}
            ></ha-icon>
          </button>
        </div>
        ${expanded ? this._renderDetail(cover) : A}
      </div>
    `;
    }
    _renderDetail(cover) {
        const planRuns = this.snapshot.plan.flatMap((occ) => occ.assignments
            .filter((r) => r.cover_item_id === cover.id)
            .map((r) => ({ occ, r })));
        const testPos = this._testPosition[cover.id] ?? cover.current_position ?? 50;
        return b `
      <div class="crow-detail">
        ${cover.missing_entities.length
            ? b `<p class="warning">
              ${t(this.hass, "config_panel.covers_missing_entities", {
                entities: cover.missing_entities.join(", "),
            })}
            </p>`
            : A}
        ${cover.capabilities.supports_position && !cover.missing_entities.length
            ? b `<div class="drive-row">
              <span class="muted">${t(this.hass, "config_panel.covers_test_drive")}</span>
              <div class="slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  .value=${String(testPos)}
                  @input=${(e) => {
                this._testPosition = {
                    ...this._testPosition,
                    [cover.id]: Number(e.target.value),
                };
                this.requestUpdate();
            }}
                />
                <span class="pos-val">${testPos}%</span>
              </div>
              <button
                type="button"
                class="iconbtn"
                title=${t(this.hass, "config_panel.covers_go_position")}
                aria-label=${t(this.hass, "config_panel.covers_go_position")}
                @click=${() => this._test(cover.id, "position", testPos)}
              >
                <ha-icon icon="mdi:target"></ha-icon>
              </button>
            </div>`
            : A}
        ${cover.safety_blocked
            ? b `<div class="safety-note">
              <ha-icon icon="mdi:shield-alert-outline"></ha-icon>
              <span
                >${t(this.hass, "config_panel.cond_sum_safety", {
                ventilation: cover.safety.ventilation_position,
            })}</span
              >
            </div>`
            : A}
        <div class="today-actions">
          <div class="ta-title">
            ${t(this.hass, "config_panel.covers_today_actions", {
            n: planRuns.length,
        })}
          </div>
          ${planRuns.length
            ? planRuns.map(({ occ, r }) => b `<div class="ta-row">
                  <span class="ta-time">${formatTime(occ.planned_at)}</span>
                  <span class="ta-name ellipsis">${occ.scenario_name}</span>
                  <span class="muted">${r.target_position}%</span>
                  <span
                    class="badge badge-${occ.fired
                ? r.status === "done"
                    ? (r.result ?? "skipped")
                    : r.status
                : r.preflight?.verdict === "would_skip"
                    ? "armed"
                    : "planned"}"
                    title=${(occ.fired && formatReason(this.hass, r.reason)) || ""}
                    >${t(this.hass, `config_panel.status_${occ.fired
                ? r.status === "done"
                    ? (r.result ?? "skipped")
                    : r.status
                : "planned"}`)}</span
                  >
                </div>`)
            : b `<p class="muted">${t(this.hass, "config_panel.covers_today_none")}</p>`}
        </div>
        <div class="detail-actions">
          <button class="btn-outline" @click=${() => this._openEdit(cover)}>
            ${t(this.hass, "config_panel.covers_edit")}
          </button>
          <button class="btn-danger" @click=${() => this._delete(cover)}>
            ${t(this.hass, "config_panel.covers_delete")}
          </button>
          ${cover.low_mode_entity_id || cover.low_mode_script_id
            ? b `<label class="manual-low">
                <ha-switch
                  .checked=${cover.manual_low_mode}
                  @click=${(e) => {
                e.stopPropagation();
                this._toggleManualLow(cover);
            }}
                ></ha-switch>
                <ha-icon icon="mdi:tortoise"></ha-icon>
                ${t(this.hass, "config_panel.covers_manual_low")}
              </label>`
            : A}
        </div>
      </div>
    `;
    }
    _renderGroup(group) {
        const next = group.covers
            .map((c) => c.next_action)
            .filter((n) => n != null)
            .sort((a, b) => a.when.localeCompare(b.when))[0];
        return b `
      ${group.label
            ? b `<div class="group-head">
            <span class="group-title">
              <ha-icon icon="mdi:map-marker-outline"></ha-icon>
              ${group.label}
              <span class="n">${group.covers.length}</span>
            </span>
            ${next
                ? b `<span class="group-next"
                  >${t(this.hass, "config_panel.covers_group_next", {
                    time: formatTime(next.when),
                    pos: next.position ?? 0,
                })}</span
                >`
                : A}
            <div
              class="icon-group"
              title=${t(this.hass, "config_panel.covers_group_control")}
            >
              <button
                type="button"
                aria-label=${t(this.hass, "config_panel.covers_test_open")}
                @click=${() => this._groupTest(group.covers, "open")}
              >
                <ha-icon icon="mdi:arrow-up"></ha-icon>
              </button>
              <button
                type="button"
                aria-label=${t(this.hass, "config_panel.covers_test_stop")}
                @click=${() => this._groupTest(group.covers, "stop")}
              >
                <ha-icon icon="mdi:stop"></ha-icon>
              </button>
              <button
                type="button"
                aria-label=${t(this.hass, "config_panel.covers_test_close")}
                @click=${() => this._groupTest(group.covers, "close")}
              >
                <ha-icon icon="mdi:arrow-down"></ha-icon>
              </button>
            </div>
          </div>`
            : A}
      ${group.covers.map((c) => this._renderRow(c))}
    `;
    }
    _renderContactMapEditor(draft) {
        const entries = Object.entries(draft.contact_state_map);
        const meanings = ["closed", "tilted", "open"];
        return b `
      <div class="section-title">
        ${t(this.hass, "config_panel.covers_contact_map_title")}
      </div>
      <p class="section-desc">${t(this.hass, "config_panel.covers_contact_map_desc")}</p>
      ${renderHelp(this.hass, "contact_map")}
      ${entries.map(([raw, meaning]) => b `
          <div class="map-row">
            ${renderEntityStateField(this.hass, draft.contact_entity_id ?? "", t(this.hass, "config_panel.covers_contact_map_raw"), raw, (v) => {
            const newRaw = v.trim();
            const map = { ...draft.contact_state_map };
            delete map[raw];
            if (newRaw)
                map[newRaw] = meaning;
            this._patchDraft({ contact_state_map: map });
        }, {
            // A second row on the same raw state would silently overwrite
            // this one, so keep the states already mapped out of the list.
            hideStates: entries
                .map(([other]) => other)
                .filter((other) => other !== raw),
            helper: t(this.hass, "config_panel.covers_contact_map_needs_entity"),
            className: "map-state",
        })}
            <ha-icon icon="mdi:arrow-right-thin"></ha-icon>
            <select
              .value=${meaning}
              @change=${(e) => this._patchDraft({
            contact_state_map: {
                ...draft.contact_state_map,
                [raw]: e.target.value,
            },
        })}
            >
              ${meanings.map((m) => b `<option value=${m} ?selected=${m === meaning}>
                  ${t(this.hass, `config_panel.contact_${m}`)}
                </option>`)}
            </select>
            <button
              class="iconbtn danger"
              aria-label=${t(this.hass, "config_panel.cond_remove")}
              @click=${() => {
            const map = { ...draft.contact_state_map };
            delete map[raw];
            this._patchDraft({ contact_state_map: map });
        }}
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
        `)}
      <button
        class="btn-icon"
        @click=${() => this._patchDraft({
            contact_state_map: { ...draft.contact_state_map, "": "closed" },
        })}
      >
        ${t(this.hass, "config_panel.covers_contact_map_add")}
      </button>
    `;
    }
    _renderDialog() {
        const draft = this._draft;
        if (!draft)
            return A;
        const caps = this._draftCaps;
        const isAwning = draft.kind === "awning";
        return b `
      <div
        class="dialog-backdrop"
        @click=${(e) => {
            if (e.target === e.currentTarget) {
                this._draft = null;
                this.requestUpdate();
            }
        }}
      >
        <div class="dialog sticky">
          <div class="dialog-head">
            <h3>
              ${draft.id
            ? t(this.hass, "config_panel.covers_dialog_edit", { name: draft.name })
            : t(this.hass, "config_panel.covers_dialog_new")}
            </h3>
          </div>
          <div class="dialog-scroll">
            ${this._error ? b `<p class="error">${this._error}</p>` : A}

            <div class="row">
              <div class="grow">
                <label class="field-label"
                  >${t(this.hass, "config_panel.covers_field_name")}</label
                >
                <input
                  type="text"
                  .value=${draft.name}
                  @input=${(e) => this._patchDraft({ name: e.target.value })}
                />
              </div>
              <div class="grow">
                <label class="field-label"
                  >${t(this.hass, "config_panel.covers_field_kind")}</label
                >
                <select
                  .value=${draft.kind}
                  @change=${(e) => this._patchDraft({ kind: e.target.value })}
                >
                  ${KINDS.map((k) => b `<option value=${k} ?selected=${k === draft.kind}>
                      ${t(this.hass, `config_panel.kind_${k}`)}
                    </option>`)}
                </select>
              </div>
            </div>

            <div class="row">
              <div class="grow">
                ${renderEntityField(this.hass, ["cover"], t(this.hass, "config_panel.covers_field_entity"), draft.cover_entity_id, (v) => {
            this._patchDraft({ cover_entity_id: v });
            this._probe();
        })}
              </div>
            </div>
            ${caps
            ? b `<div class="chips caps-chips" style="margin-bottom:12px">
                  <span class="chip readonly">
                    <ha-icon
                      icon=${caps.supports_position
                ? "mdi:check-circle"
                : "mdi:minus-circle-outline"}
                    ></ha-icon>
                    ${t(this.hass, "config_panel.covers_cap_position")}
                  </span>
                  <span class="chip readonly">
                    <ha-icon
                      icon=${caps.supports_tilt
                ? "mdi:check-circle"
                : "mdi:minus-circle-outline"}
                    ></ha-icon>
                    ${t(this.hass, "config_panel.covers_cap_tilt")}
                  </span>
                  ${!caps.available
                ? b `<span class="chip readonly">
                        <ha-icon icon="mdi:alert-outline"></ha-icon>
                        ${t(this.hass, "config_panel.covers_cap_unavailable")}
                      </span>`
                : A}
                </div>`
            : A}

            <div class="row">
              <div class="grow">
                ${renderAreaField(this.hass, t(this.hass, "config_panel.covers_field_area"), draft.area_id ?? "", (v) => this._patchDraft({ area_id: v || null }))}
              </div>
              <div class="grow">
                <label class="field-label"
                  >${t(this.hass, "config_panel.covers_field_azimuth")}</label
                >
                <input
                  type="number"
                  min="0"
                  max="359"
                  .value=${draft.azimuth == null ? "" : String(draft.azimuth)}
                  @input=${(e) => {
            const raw = e.target.value;
            this._patchDraft({ azimuth: raw === "" ? null : Number(raw) });
        }}
                />
              </div>
            </div>
            ${renderCompass(draft.azimuth, (deg) => this._patchDraft({ azimuth: deg }))}
            <p class="section-desc">${t(this.hass, "config_panel.covers_azimuth_hint")}</p>

            <div class="section-title">
              ${t(this.hass, "config_panel.covers_low_mode_title")}
            </div>
            <p class="section-desc">${t(this.hass, "config_panel.covers_low_mode_desc")}</p>
            ${renderHelp(this.hass, "low_mode")}
            <div class="row">
              <div class="grow">
                ${renderEntityField(this.hass, ["cover"], t(this.hass, "config_panel.covers_field_low_entity"), draft.low_mode_entity_id ?? "", (v) => this._patchDraft({ low_mode_entity_id: v || null }))}
              </div>
              <div class="grow">
                ${renderEntityField(this.hass, ["script"], t(this.hass, "config_panel.covers_field_low_script"), draft.low_mode_script_id ?? "", (v) => this._patchDraft({ low_mode_script_id: v || null }))}
              </div>
            </div>
            ${draft.low_mode_entity_id || draft.low_mode_script_id
            ? b `<label class="manual-low dialog-row">
                  <ha-switch
                    .checked=${draft.manual_low_mode}
                    @click=${() => this._patchDraft({
                manual_low_mode: !this._draft?.manual_low_mode,
            })}
                  ></ha-switch>
                  <ha-icon icon="mdi:tortoise"></ha-icon>
                  <span>
                    ${t(this.hass, "config_panel.covers_manual_low")}
                    <span class="section-desc" style="display:block;margin:0">
                      ${t(this.hass, "config_panel.covers_manual_low_desc")}
                    </span>
                  </span>
                </label>`
            : A}

            ${!isAwning
            ? b `
                  <div class="section-title">
                    ${t(this.hass, "config_panel.covers_contact_title")}
                  </div>
                  <p class="section-desc">
                    ${t(this.hass, "config_panel.covers_contact_desc")}
                  </p>
                  <div class="row">
                    <div class="grow">
                      ${renderEntityField(this.hass, ["binary_sensor", "sensor"], t(this.hass, "config_panel.covers_field_contact"), draft.contact_entity_id ?? "", (v) => {
                this._patchDraft({ contact_entity_id: v || null });
                this._probe();
            }, 
            // Suggestions only: the contact is never addressed by a
            // service, only read and run through `contact_state_map`,
            // so a handle helper on `input_select` stays valid.
            { allowCustom: true })}
                    </div>
                  </div>
                  ${draft.contact_entity_id
                ? b `
                        ${this._renderContactMapEditor(draft)}
                        <div class="section-title">
                          ${t(this.hass, "config_panel.covers_safety_title")}
                        </div>
                        <p class="section-desc">
                          ${t(this.hass, "config_panel.covers_safety_desc")}
                        </p>
                        ${renderHelp(this.hass, "safety")}
                        <div class="row">
                          <div class="grow">
                            <label class="field-label"
                              >${t(this.hass, "config_panel.covers_field_ventilation")}</label
                            >
                            <input
                              type="number"
                              min="0"
                              max="100"
                              .value=${String(draft.safety.ventilation_position)}
                              @input=${(e) => this._patchDraft({
                    safety: {
                        ...draft.safety,
                        ventilation_position: Number(e.target.value),
                    },
                })}
                            />
                          </div>
                          <div class="grow">
                            <label class="field-label"
                              >${t(this.hass, "config_panel.covers_field_safety_mode")}</label
                            >
                            <select
                              .value=${draft.safety.mode}
                              @change=${(e) => this._patchDraft({
                    safety: {
                        ...draft.safety,
                        mode: e.target.value,
                    },
                })}
                            >
                              <option
                                value="block"
                                ?selected=${draft.safety.mode === "block"}
                              >
                                ${t(this.hass, "config_panel.covers_safety_block")}
                              </option>
                              <option
                                value="clamp"
                                ?selected=${draft.safety.mode === "clamp"}
                              >
                                ${t(this.hass, "config_panel.covers_safety_clamp")}
                              </option>
                            </select>
                          </div>
                        </div>
                        <label class="checkbox-row">
                          <input
                            type="checkbox"
                            .checked=${draft.safety.block_when_tilted}
                            @change=${(e) => this._patchDraft({
                    safety: {
                        ...draft.safety,
                        block_when_tilted: e.target
                            .checked,
                    },
                })}
                          />
                          ${t(this.hass, "config_panel.covers_safety_tilted")}
                        </label>
                      `
                : A}
                `
            : A}
          </div>
          <div class="dialog-foot">
            <button
              class="btn-outline"
              @click=${() => {
            this._draft = null;
            this.requestUpdate();
        }}
            >
              ${t(this.hass, "config_panel.cancel")}
            </button>
            <button class="btn" .disabled=${this._busy} @click=${this._save}>
              ${this._busy
            ? t(this.hass, "config_panel.saving")
            : t(this.hass, "config_panel.save")}
            </button>
          </div>
        </div>
      </div>
    `;
    }
    render() {
        const snap = this.snapshot;
        if (!snap)
            return A;
        const filtered = this._filteredCovers();
        return b `
      <ha-card>
        <div class="card-header">
          <ha-icon icon="mdi:window-shutter-cog"></ha-icon>
          ${t(this.hass, "config_panel.covers_title")}
          <span class="muted" style="font-weight:400">${snap.covers.length}</span>
          <span class="header-actions">
            <button class="btn" @click=${this._openAdd}>
              ${t(this.hass, "config_panel.covers_add")}
            </button>
          </span>
        </div>
        <div class="card-content">
          <p class="intro">${t(this.hass, "config_panel.covers_intro")}</p>
          ${snap.covers.length > 6
            ? b `<div class="toolbar">
                <div class="search">
                  <ha-icon icon="mdi:magnify"></ha-icon>
                  <input
                    type="text"
                    placeholder=${t(this.hass, "config_panel.covers_search_placeholder")}
                    .value=${this._search}
                    @input=${(e) => {
                this._search = e.target.value;
                this.requestUpdate();
            }}
                  />
                </div>
              </div>`
            : A}
          ${this._error && !this._draft
            ? b `<p class="error">${this._error}</p>`
            : A}
          ${snap.covers.length
            ? this._groupByArea(filtered).map((g) => this._renderGroup(g))
            : b `<div class="empty-state">
                <ha-icon icon="mdi:window-shutter-alert"></ha-icon>
                <p>${t(this.hass, "config_panel.covers_empty")}</p>
              </div>`}
        </div>
      </ha-card>
      ${this._renderDialog()}
    `;
    }
}
defineCustomElementOnce("ac-view-covers", ViewCovers);

/** Map a raw log result to a filter bucket. */
function bucket(result) {
    if (result === "executed")
        return "executed";
    if (result === "skipped" || result === "expired")
        return "skipped";
    if (result === "blocked_safety" || result === "unavailable")
        return "blocked";
    return null;
}
class ViewLog extends i$2 {
    constructor() {
        super(...arguments);
        this._coverFilter = "";
        this._resultFilters = new Set();
        this._showRaw = false;
        this._copied = false;
    }
    static { this.properties = {
        hass: { attribute: false },
        entryId: { type: String },
        snapshot: { attribute: false },
    }; }
    static { this.styles = [
        sharedStyles,
        i$5 `
      .log-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 10px;
        align-items: center;
        margin-bottom: 14px;
      }
      .log-list {
        display: flex;
        flex-direction: column;
      }
      .log-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 4px;
        border-bottom: 1px solid var(--divider-color);
      }
      .log-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        flex-shrink: 0;
        background: var(--disabled-text-color, #6d7476);
      }
      .log-dot.executed {
        background: var(--success-color, #43a047);
      }
      .log-dot.skipped {
        background: var(--disabled-text-color, #6d7476);
      }
      .log-dot.blocked {
        background: var(--error-color, #d93025);
      }
      .log-time {
        font-variant-numeric: tabular-nums;
        font-size: 0.82rem;
        color: var(--secondary-text-color);
        flex-shrink: 0;
        width: 46px;
      }
      .log-body {
        min-width: 0;
        flex: 1;
      }
      .log-line1 {
        display: flex;
        align-items: baseline;
        gap: 8px;
      }
      .log-cover {
        font-weight: 500;
        font-size: 0.9rem;
      }
      .log-pos {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }
      .log-line2 {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        margin-top: 1px;
      }
      .raw-head {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 8px 0;
      }
      pre.raw {
        font-size: 0.75rem;
        overflow-x: auto;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        padding: 12px;
        border-radius: 8px;
        margin: 0;
      }
    `,
    ]; }
    _counts() {
        const c = { executed: 0, skipped: 0, blocked: 0 };
        for (const e of this.snapshot.log) {
            const b = bucket(e.result);
            if (b)
                c[b] += 1;
        }
        return c;
    }
    _toggleResult(f) {
        if (this._resultFilters.has(f))
            this._resultFilters.delete(f);
        else
            this._resultFilters.add(f);
        this.requestUpdate();
    }
    _filtered() {
        return this.snapshot.log.filter((e) => {
            if (this._coverFilter && e.cover_item_id !== this._coverFilter)
                return false;
            if (this._resultFilters.size) {
                const b = bucket(e.result);
                if (!b || !this._resultFilters.has(b))
                    return false;
            }
            return true;
        });
    }
    async _copyRaw() {
        try {
            await navigator.clipboard.writeText(JSON.stringify(this.snapshot, null, 2));
            this._copied = true;
            this.requestUpdate();
            setTimeout(() => {
                this._copied = false;
                this.requestUpdate();
            }, 1500);
        }
        catch {
            /* clipboard unavailable */
        }
    }
    _renderChip(f, count) {
        const selected = this._resultFilters.has(f);
        return b `<button
      type="button"
      class="chip ${selected ? "selected" : ""}"
      @click=${() => this._toggleResult(f)}
    >
      ${t(this.hass, `config_panel.log_filter_${f}`)} ${count}
    </button>`;
    }
    render() {
        const snap = this.snapshot;
        if (!snap)
            return A;
        const counts = this._counts();
        const entries = this._filtered();
        return b `
      <ha-card>
        <div class="card-header">
          <ha-icon icon="mdi:history"></ha-icon>
          ${t(this.hass, "config_panel.log_title")}
          <span class="muted" style="font-weight:400">
            ${t(this.hass, "config_panel.log_today")} ·
            ${t(this.hass, "config_panel.log_entries", { n: snap.log.length })}
          </span>
        </div>
        <div class="card-content">
          <p class="intro">${t(this.hass, "config_panel.log_intro")}</p>
          <div class="log-toolbar">
            <div class="chips">
              ${this._renderChip("executed", counts.executed)}
              ${this._renderChip("skipped", counts.skipped)}
              ${this._renderChip("blocked", counts.blocked)}
            </div>
            <select
              style="width:auto"
              @change=${(e) => {
            this._coverFilter = e.target.value;
            this.requestUpdate();
        }}
            >
              <option value="">${t(this.hass, "config_panel.log_filter_all_covers")}</option>
              ${snap.covers.map((c) => b `<option value=${c.id} ?selected=${this._coverFilter === c.id}>
                  ${c.name}
                </option>`)}
            </select>
          </div>
          ${entries.length
            ? b `<div class="log-list">
                ${entries.map((e) => this._renderRow(e))}
              </div>`
            : b `<div class="empty-state">
                <ha-icon icon="mdi:text-box-outline"></ha-icon>
                <p>${t(this.hass, "config_panel.log_empty")}</p>
              </div>`}
          <details
            class="expand"
            @toggle=${(e) => {
            this._showRaw = e.target.open;
            this.requestUpdate();
        }}
          >
            <summary>${t(this.hass, "config_panel.log_show_raw")}</summary>
            ${this._showRaw
            ? b `<div class="raw-head">
                    <button class="btn-icon" @click=${this._copyRaw}>
                      <ha-icon
                        icon=${this._copied ? "mdi:check" : "mdi:content-copy"}
                        style="--mdc-icon-size:16px;vertical-align:-3px"
                      ></ha-icon>
                      ${this._copied
                ? t(this.hass, "config_panel.log_copied")
                : t(this.hass, "config_panel.log_copy")}
                    </button>
                  </div>
                  <pre class="raw">${JSON.stringify(snap, null, 2)}</pre>`
            : A}
          </details>
        </div>
      </ha-card>
    `;
    }
    _renderRow(e) {
        const b$1 = bucket(e.result) ?? "skipped";
        return b `
      <div class="log-row">
        <span class="log-time">${formatTime(e.time)}</span>
        <span class="log-dot ${b$1}"></span>
        <div class="log-body">
          <div class="log-line1">
            <span class="log-cover">${e.cover_name}</span>
            ${e.position != null
            ? b `<span class="log-pos">${e.position}%</span>`
            : A}
          </div>
          <div class="log-line2">
            ${e.scenario_name}${e.reason
            ? ` — ${formatReason(this.hass, e.reason)}`
            : ""}
          </div>
        </div>
      </div>
    `;
    }
}
defineCustomElementOnce("ac-view-log", ViewLog);

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=t=>(...e)=>({_$litDirective$:t,values:e});let i$1 = class i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i;}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const m={},p=(o,t=m)=>o._$AH=t;

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const i=e(class extends i$1{constructor(){super(...arguments),this.key=A;}render(r,t){return this.key=r,t}update(r,[t,e]){return t!==this.key&&(p(r),this.key=t),e}});

const CONTACT_STATES = ["closed", "tilted", "open"];
function emptyCondition(type) {
    switch (type) {
        case "cover_position":
            return { type, op: "above", value: 5, value2: null };
        case "contact":
            return { type, accepted: ["closed"] };
        case "numeric_state":
            return { type, entity_id: "", above: null, below: null };
        case "sun_position":
            return {
                type,
                above: 20,
                below: null,
                az_mode: "relative",
                az_from: -45,
                az_to: 45,
            };
        default:
            return { type, entity_id: "", states: [] };
    }
}
function update(opts, index, patch) {
    const next = opts.conditions.map((c, i) => (i === index ? { ...c, ...patch } : c));
    opts.onChange(next);
}
function remove(opts, index) {
    opts.onChange(opts.conditions.filter((_, i) => i !== index));
}
/**
 * The entity a condition watches.
 *
 * No domain filter and `allowCustom`: the engine only ever reads
 * `hass.states.get(cond.entity_id)`, so every domain is fair game — and an
 * entity_id whose integration happens to be unloaded right now must survive
 * editing the rest of the row.
 */
function renderConditionEntityField(opts, index, cond, patch) {
    // No floating label: it sits above the field and pushes the picker out of
    // line with the rest of the sentence. The picker's own placeholder suffices.
    return renderEntityField(opts.hass, null, "", cond.entity_id ?? "", (v) => {
        // The picker re-emits on every render pass; only a real change may run
        // `patch`, which is what drops the states belonging to the old entity.
        if (v === (cond.entity_id ?? ""))
            return;
        update(opts, index, patch(v));
    }, { allowCustom: true, className: "cond-entity" });
}
function renderStateChips(opts, index, cond) {
    const states = cond.states ?? [];
    const addState = (value) => {
        if (!value || states.includes(value))
            return;
        update(opts, index, { states: [...states, value] });
    };
    return b `
    <span class="chips">
      ${states.map((s) => b `
          <button
            type="button"
            class="chip selected chip-removable"
            title=${t(opts.hass, "config_panel.cond_remove_state")}
            @click=${() => update(opts, index, { states: states.filter((x) => x !== s) })}
          >
            ${formatState(opts.hass, cond.entity_id, s)}
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        `)}
    </span>
    ${
    // The picker keeps the state it just handed over, so re-key it on the
    // current selection: adding (or removing) a chip rebuilds it empty.
    i(states.join("|"), renderEntityStateField(opts.hass, cond.entity_id ?? "", t(opts.hass, "config_panel.cond_state_add"), "", addState, {
        hideStates: states,
        helper: t(opts.hass, "config_panel.cond_state_needs_entity"),
        className: "cond-state",
    }))}
  `;
}
function renderCondition(opts, cond, index) {
    const { hass } = opts;
    let body;
    switch (cond.type) {
        case "entity_state":
        case "entity_state_not":
            body = b `
        <span>${t(hass, "config_panel.cond_only_if")}</span>
        ${renderConditionEntityField(opts, index, cond, (entity_id) => ({
                entity_id,
                // The chips name states of the old entity and would silently never
                // match the new one — drop them with the entity they belong to.
                states: [],
            }))}
        <span>
          ${cond.type === "entity_state"
                ? t(hass, "config_panel.cond_is_one_of")
                : t(hass, "config_panel.cond_is_none_of")}
        </span>
        ${renderStateChips(opts, index, cond)}
      `;
            break;
        case "cover_position":
            body = b `
        <span>${t(hass, "config_panel.cond_position_prefix")}</span>
        <select
          .value=${cond.op ?? "above"}
          @change=${(e) => update(opts, index, {
                op: e.target.value,
            })}
        >
          <option value="above">${t(hass, "config_panel.cond_op_above")}</option>
          <option value="below">${t(hass, "config_panel.cond_op_below")}</option>
          <option value="between">${t(hass, "config_panel.cond_op_between")}</option>
        </select>
        <input
          type="number"
          min="0"
          max="100"
          style="width:80px"
          .value=${String(cond.value ?? 0)}
          @input=${(e) => update(opts, index, {
                value: Number(e.target.value),
            })}
        />
        ${cond.op === "between"
                ? b `
              <span>${t(hass, "config_panel.cond_and")}</span>
              <input
                type="number"
                min="0"
                max="100"
                style="width:80px"
                .value=${String(cond.value2 ?? 100)}
                @input=${(e) => update(opts, index, {
                    value2: Number(e.target.value),
                })}
              />
            `
                : A}
        <span>${t(hass, "config_panel.cond_position_suffix")}</span>
      `;
            break;
        case "contact":
            body = b `
        <span>${t(hass, "config_panel.cond_contact_prefix")}</span>
        <span class="chips">
          ${CONTACT_STATES.map((s) => {
                const accepted = cond.accepted ?? [];
                const selected = accepted.includes(s);
                return b `
              <button
                type="button"
                class="chip ${selected ? "selected" : ""}"
                @click=${() => update(opts, index, {
                    accepted: selected
                        ? accepted.filter((x) => x !== s)
                        : [...accepted, s],
                })}
              >
                ${t(hass, `config_panel.contact_${s}`)}
              </button>
            `;
            })}
        </span>
      `;
            break;
        case "numeric_state":
            body = b `
        <span>${t(hass, "config_panel.cond_only_if")}</span>
        ${renderConditionEntityField(opts, index, cond, (entity_id) => ({
                entity_id,
            }))}
        <span>${t(hass, "config_panel.cond_numeric_above")}</span>
        <input
          type="number"
          style="width:90px"
          .value=${cond.above == null ? "" : String(cond.above)}
          @input=${(e) => {
                const raw = e.target.value;
                update(opts, index, { above: raw === "" ? null : Number(raw) });
            }}
        />
        <span>${t(hass, "config_panel.cond_numeric_below")}</span>
        <input
          type="number"
          style="width:90px"
          .value=${cond.below == null ? "" : String(cond.below)}
          @input=${(e) => {
                const raw = e.target.value;
                update(opts, index, { below: raw === "" ? null : Number(raw) });
            }}
        />
      `;
            break;
        case "sun_position": {
            const numInput = (value, patchKey, min, max) => b `
        <input
          type="number"
          min=${min}
          max=${max}
          style="width:80px"
          .value=${value == null ? "" : String(value)}
          @input=${(e) => {
                const raw = e.target.value;
                update(opts, index, { [patchKey]: raw === "" ? null : Number(raw) });
            }}
        />
      `;
            const azMode = cond.az_mode ?? "off";
            const relHint = azMode !== "relative"
                ? A
                : opts.coverAzimuth === undefined
                    ? b `<span class="muted">${t(hass, "config_panel.cond_sun_rel_generic")}</span>`
                    : opts.coverAzimuth === null
                        ? b `<span class="muted warn">${t(hass, "config_panel.cond_sun_rel_missing")}</span>`
                        : b `<span class="muted">
                  ${t(hass, "config_panel.cond_sun_rel_hint", {
                            az: opts.coverAzimuth,
                        })}
                </span>`;
            body = b `
        <span>${t(hass, "config_panel.cond_sun_prefix")}</span>
        <span>${t(hass, "config_panel.cond_sun_above")}</span>
        ${numInput(cond.above, "above", -90, 90)}
        <span>${t(hass, "config_panel.cond_sun_below")}</span>
        ${numInput(cond.below, "below", -90, 90)}
        <span>${t(hass, "config_panel.cond_sun_deg_suffix")}</span>
        <select
          .value=${azMode}
          @change=${(e) => update(opts, index, {
                az_mode: e.target
                    .value,
            })}
        >
          ${["off", "absolute", "relative"].map((m) => b `<option value=${m} ?selected=${azMode === m}>
              ${t(hass, `config_panel.cond_sun_az_mode_${m}`)}
            </option>`)}
        </select>
        ${azMode === "off"
                ? A
                : b `
              <span>${t(hass, "config_panel.cond_sun_from")}</span>
              ${numInput(cond.az_from, "az_from", azMode === "relative" ? -180 : 0, azMode === "relative" ? 180 : 359)}
              <span>${t(hass, "config_panel.cond_sun_to")}</span>
              ${numInput(cond.az_to, "az_to", azMode === "relative" ? -180 : 0, azMode === "relative" ? 180 : 359)}
              <span>°</span>
              ${relHint}
            `}
      `;
            break;
        }
        default:
            body = b `<span class="muted">?</span>`;
    }
    return b `
    <div class="cond-row">
      ${body}
      <button
        type="button"
        class="cond-remove"
        title=${t(hass, "config_panel.cond_remove")}
        @click=${() => remove(opts, index)}
      >
        <ha-icon icon="mdi:close"></ha-icon>
      </button>
    </div>
  `;
}
/** Sentence-builder condition list (AND semantics, no operators). */
function renderConditionEditor(opts) {
    const { hass } = opts;
    const types = [
        "entity_state",
        "entity_state_not",
        "cover_position",
        "numeric_state",
        "sun_position",
        ...(opts.contactAvailable ? ["contact"] : []),
    ];
    return b `
    <div>
      ${opts.conditions.map((c, i) => renderCondition(opts, c, i))}
      <div class="row">
        <select
          @change=${(e) => {
        const sel = e.target;
        if (!sel.value)
            return;
        opts.onChange([
            ...opts.conditions,
            emptyCondition(sel.value),
        ]);
        sel.value = "";
    }}
        >
          <option value="">
            + ${t(hass, "config_panel.cond_add")}
          </option>
          ${types.map((ct) => b `
              <option value=${ct}>${t(hass, `config_panel.cond_type_${ct}`)}</option>
            `)}
        </select>
      </div>
    </div>
  `;
}

const VERDICT_META = {
    would_run: { icon: "mdi:play-circle-outline", key: "preflight_would_run" },
    would_skip: { icon: "mdi:debug-step-over", key: "preflight_would_skip" },
    unknown: { icon: "mdi:help-circle-outline", key: "preflight_unknown" },
};
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
/** Preflight badge for a whole occurrence (block + per-cover conditions). */
function occPreflightBadge(hass, occ) {
    const pf = occ.preflight;
    if (!pf)
        return A;
    const verdict = occVerdict(occ);
    // The scenario's cover-scoped conditions live in the per-cover preflights;
    // they count as "this scenario has conditions" just like the block's own.
    const hasConditions = pf.conditions.length > 0 ||
        occ.assignments.some((r) => (r.preflight?.conditions ?? []).some((c) => c.scope === "scenario"));
    if (verdict === "would_run" && !hasConditions)
        return A;
    return preflightBadge(hass, pf, {
        verdict,
        reason: occPreflightReason(hass, occ),
        force: true,
    });
}
/**
 * The preflight badge ("Would run now" / "Would be skipped now" / "Cannot be
 * evaluated"). Renders nothing for a scenario without conditions (no noise).
 * ``reason`` is appended to the tooltip so hovering explains the verdict.
 */
function preflightBadge(hass, pf, options = {}) {
    if (!pf)
        return A;
    const verdict = options.verdict ?? pf.verdict;
    if (!options.force && verdict === "would_run" && pf.conditions.length === 0)
        return A;
    const meta = VERDICT_META[verdict];
    const checked = t(hass, "config_panel.preflight_evaluated_at", {
        time: formatTime(pf.evaluated_at),
    });
    const reason = options.reason ?? preflightReason(hass, pf);
    return b `
    <span
      class="preflight-badge ${verdict}"
      title=${reason ? `${reason} · ${checked}` : checked}
    >
      <ha-icon icon=${meta.icon}></ha-icon>
      ${t(hass, `config_panel.${meta.key}`)}
    </span>
  `;
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
const CHECK_META = {
    ok: { icon: "mdi:check-circle", cls: "ok" },
    fail: { icon: "mdi:alert-circle-outline", cls: "fail" },
    na: { icon: "mdi:help-circle-outline", cls: "na" },
};
/** Full checklist of a preflight's conditions (shown on expand). */
function renderCondChecklist(hass, conditions) {
    return conditions.map((c) => {
        const meta = c.ok === true ? CHECK_META.ok : c.ok === false ? CHECK_META.fail : CHECK_META.na;
        return b `
      <div class="cond-check ${meta.cls}">
        <ha-icon icon=${meta.icon}></ha-icon>
        <span>${condSummary(hass, c)}</span>
      </div>
    `;
    });
}

/**
 * One-line summaries of a scenario's parts.
 *
 * The scenario editor is an accordion: a collapsed section shows what it
 * holds, so an existing scenario reads like a sentence (when … only if …
 * then … for these covers). The scenario list uses the same texts, so the
 * two can never describe one scenario differently.
 *
 * No rendering imports on purpose — this module is unit-tested under Node.
 */
/** The editor's sections, in reading order. */
const SECTIONS = ["when", "only_if", "then", "covers"];
const WEEKDAY_COUNT = 7;
/** Stands in for the part of a condition that has not been chosen yet. */
const PENDING = "…";
const SEPARATOR = " · ";
// Number and unit never wrap apart ("1" at the end of a line, "h" on the next).
const NBSP = "\u00a0";
/** "45 min" below an hour, "4 h" from there on (re-arm and random windows). */
function formatWindow(minutes) {
    return minutes < 60 || minutes % 60
        ? `${minutes}${NBSP}min`
        : `${minutes / 60}${NBSP}h`;
}
function signed(value) {
    return value > 0 ? `+${value}` : `${value}`;
}
/** What fires the scenario: "08:30", "Sunset +20 min", "Sun direction SW". */
function triggerText(hass, s) {
    const trigger = s.trigger;
    const offset = trigger.offset_min ? ` ${signed(trigger.offset_min)}${NBSP}min` : "";
    if (trigger.type === "fixed_time")
        return trigger.time_local ?? "";
    if (trigger.type === "sun_azimuth") {
        const target = trigger.az_relative
            ? `${t(hass, "config_panel.cond_sun_rel_short")} ${signed(trigger.azimuth_offset_deg ?? 0)}°`
            : formatAzimuth(trigger.azimuth_deg ?? 180);
        return `${t(hass, "config_panel.trigger_sun_azimuth")} ${target}${offset}`;
    }
    if (trigger.type === "sun_elevation") {
        const arrow = (trigger.elevation_dir ?? "falling") === "rising" ? "↑" : "↓";
        return `${t(hass, "config_panel.trigger_sun_elevation")} ${arrow} ${trigger.elevation_deg ?? 0}°${offset}`;
    }
    return `${t(hass, `config_panel.sun_${trigger.sun_event}`)}${offset}`;
}
/** The random window as a range ("± 15 min"), or `null` when it is off. */
function randomText(s) {
    const window = s.random_window_min;
    if (!window)
        return null;
    if (s.random_direction === "after")
        return `+0…${window}${NBSP}min`;
    if (s.random_direction === "before")
        return `−${window}…0${NBSP}min`;
    return `±${NBSP}${window}${NBSP}min`;
}
/** "daily", or the selected weekdays in week order. */
function weekdaysText(hass, s) {
    // An empty selection is stored as "every day" by the backend.
    if (!s.weekdays.length || s.weekdays.length === WEEKDAY_COUNT) {
        return t(hass, "config_panel.weekdays_all");
    }
    return s.weekdays.map((d) => t(hass, `config_panel.weekday_${d}`)).join(" ");
}
/** The active periods ("Apr 1 – May 31, Sep 3 – Oct 12"); empty = all year. */
function periodsText(hass, s) {
    return (s.active_periods ?? [])
        .map((p) => `${formatMonthDay(hass, p.from)} – ${formatMonthDay(hass, p.to)}`)
        .join(", ");
}
/** Trigger, random window, weekdays and time of year — the scenario list line. */
function scheduleText(hass, s) {
    const random = randomText(s);
    const trigger = random
        ? `${triggerText(hass, s)} ${random}`
        : triggerText(hass, s);
    return [trigger, weekdaysText(hass, s), periodsText(hass, s)]
        .filter(Boolean)
        .join(SEPARATOR);
}
/** Summary of the "When" section: the schedule plus the re-arm window. */
function summarizeWhen(hass, s) {
    const retry = s.retry_window_min
        ? t(hass, "config_panel.scenarios_sum_retry", {
            window: formatWindow(s.retry_window_min),
        })
        : "";
    return [scheduleText(hass, s), retry].filter(Boolean).join(SEPARATOR);
}
/** Friendly name of an entity, falling back to its id. */
function entityName(hass, entityId) {
    if (!entityId)
        return "";
    const name = hass?.states?.[entityId]?.attributes?.friendly_name;
    return typeof name === "string" && name ? name : entityId;
}
function stateLabel(hass, entityId, state) {
    const stateObj = entityId ? hass?.states?.[entityId] : undefined;
    if (!stateObj || !hass?.formatEntityState)
        return state;
    return hass.formatEntityState(stateObj, state) || state;
}
/** One condition as a short phrase ("Weather = Sunny", "Position > 5%"). */
function conditionText(hass, cond) {
    const entity = entityName(hass, cond.entity_id);
    // A condition that is still being filled in reads "… = …", never a bare "=".
    const states = (cond.states ?? [])
        .map((state) => stateLabel(hass, cond.entity_id, state))
        .join("/") || PENDING;
    const entityBased = cond.type === "entity_state" ||
        cond.type === "entity_state_not" ||
        cond.type === "numeric_state";
    if (entityBased && !entity) {
        return `${t(hass, `config_panel.cond_type_${cond.type}`)} ${PENDING}`;
    }
    switch (cond.type) {
        case "entity_state":
            return `${entity} = ${states}`;
        case "entity_state_not":
            return `${entity} ≠ ${states}`;
        case "numeric_state": {
            const bounds = [
                cond.above != null ? `> ${cond.above}` : "",
                cond.below != null ? `< ${cond.below}` : "",
            ].filter(Boolean);
            return `${entity} ${bounds.join(" ") || PENDING}`;
        }
        case "cover_position": {
            const label = t(hass, "config_panel.scenarios_position");
            if (cond.op === "between") {
                const [low, high] = [cond.value ?? 0, cond.value2 ?? cond.value ?? 0].sort((a, b) => a - b);
                return `${label} ${low}–${high}%`;
            }
            return `${label} ${cond.op === "below" ? "<" : ">"} ${cond.value ?? 0}%`;
        }
        case "contact":
            return `${t(hass, "config_panel.cond_type_contact")}: ${(cond.accepted ?? [])
                .map((state) => t(hass, `config_panel.contact_${state}`))
                .join("/")}`;
        case "sun_position": {
            const parts = [];
            if (cond.above != null)
                parts.push(`> ${cond.above}°`);
            if (cond.below != null)
                parts.push(`< ${cond.below}°`);
            if (cond.az_mode === "absolute") {
                parts.push(`${cond.az_from ?? 0}°–${cond.az_to ?? 0}°`);
            }
            else if (cond.az_mode === "relative") {
                parts.push(`${t(hass, "config_panel.cond_sun_rel_short")} ${signed(cond.az_from ?? 0)}°…${signed(cond.az_to ?? 0)}°`);
            }
            return `${t(hass, "config_panel.cond_type_sun_position")}: ${parts.join(SEPARATOR)}`;
        }
        default:
            return "";
    }
}
/** `items`, cut to `max` entries with a "+n" for the rest. */
function truncated(hass, items, max, separator) {
    if (items.length <= max)
        return items.join(separator);
    const more = t(hass, "config_panel.scenarios_cond_more", { n: items.length - max });
    return `${items.slice(0, max).join(separator)} ${more}`;
}
/** Summary of the "Only if" section; says so when nothing restricts the run. */
function summarizeConditions(hass, conditions, max = 2) {
    if (!conditions.length)
        return t(hass, "config_panel.scenarios_sum_always");
    return truncated(hass, conditions.map((cond) => conditionText(hass, cond)), max, SEPARATOR);
}
/** Summary of the "Then" section: target plus every non-default option. */
function summarizeThen(hass, s) {
    const action = s.action;
    const parts = [`→ ${action.position}%`];
    if (action.tilt_position != null) {
        parts.push(`${t(hass, "config_panel.scenarios_tilt")} ${action.tilt_position}%`);
    }
    if (action.mode === "low") {
        parts.push(`${t(hass, "config_panel.scenarios_mode")}: ${t(hass, "config_panel.mode_low")}`);
    }
    if (action.safety_override) {
        parts.push(t(hass, `config_panel.safety_override_${action.safety_override}`));
    }
    if (action.min_position_delta != null) {
        parts.push(`${t(hass, "config_panel.scenarios_opt_min_delta")} ${action.min_position_delta}%`);
    }
    return parts.join(SEPARATOR);
}
/** Summary of the "Covers" section from the assigned covers' names. */
function summarizeCovers(hass, coverNames, max = 3) {
    if (!coverNames.length)
        return t(hass, "config_panel.scenarios_sum_no_covers");
    return truncated(hass, coverNames, max, ", ");
}
/** Value shown on the "time of year" option chip. */
function periodValue(hass, s) {
    const count = (s.active_periods ?? []).length;
    if (!count)
        return t(hass, "config_panel.scenarios_period_all_year");
    if (count === 1)
        return periodsText(hass, s);
    return t(hass, "config_panel.scenarios_period_count", { n: count });
}

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const RANDOM_WINDOWS = [0, 15, 30, 60];
const RETRY_WINDOWS = [0, 15, 30, 45, 60, 120, 240, 480];
// Pre-filled for a newly added active period: April through September.
const DEFAULT_PERIOD = { from: "04-01", to: "09-30" };
const TRIGGER_TYPES = ["fixed_time", "sun_event", "sun_azimuth", "sun_elevation"];
const SECTION_ICONS = {
    when: "mdi:clock-outline",
    only_if: "mdi:filter-variant",
    then: "mdi:swap-vertical",
    covers: "mdi:window-shutter",
};
const DAYPART_ICONS = {
    night: "mdi:weather-night",
    morning: "mdi:weather-sunset-up",
    forenoon: "mdi:weather-partly-cloudy",
    noon: "mdi:weather-sunny",
    afternoon: "mdi:weather-partly-cloudy",
    evening: "mdi:weather-sunset",
};
function emptyScenario() {
    return {
        id: "",
        name: "",
        enabled: true,
        trigger: {
            type: "fixed_time",
            time_local: "07:00",
            sun_event: "sunset",
            offset_min: 0,
        },
        random_window_min: 0,
        random_direction: "both",
        weekdays: [...WEEKDAYS],
        active_periods: [],
        conditions: [],
        retry_window_min: 0,
        action: {
            position: 0,
            tilt_position: null,
            mode: "normal",
            min_position_delta: null,
            safety_override: null,
        },
        assignments: [],
    };
}
function emptyOverride() {
    return {
        position: null,
        tilt_position: null,
        mode: null,
        min_position_delta: null,
        safety_override: null,
    };
}
class ViewScenarios extends i$2 {
    constructor() {
        super(...arguments);
        this._warnings = [];
        this._busy = false;
        this._draft = null;
        this._runIgnoreConditions = false;
        this._dragIndex = null;
        this._dragOverIndex = null;
        this._runPopoverId = null;
        this._menuOpenId = null;
        // Editor accordion: at most one section and, inside it, one option is open.
        this._openSection = null;
        this._openOption = null;
        this._headMenuOpen = false;
    }
    static { this.properties = {
        hass: { attribute: false },
        entryId: { type: String },
        snapshot: { attribute: false },
        editScenarioId: { type: String },
    }; }
    static { this.styles = [
        sharedStyles,
        compassStyles,
        i$5 `
      .deg-wrap {
        display: inline-flex;
        align-items: center;
        gap: 3px;
      }
      .deg-sign {
        color: var(--secondary-text-color);
      }
      .inline-field {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .inline-field-label {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .srow {
        display: flex;
        align-items: stretch;
        border: 1px solid var(--divider-color);
        border-left: 3px solid var(--primary-color);
        border-radius: 10px;
        margin-bottom: 8px;
        background: var(--card-background-color);
      }
      .srow.inactive {
        border-left-color: var(--disabled-text-color, #6d7476);
      }
      .srow.dragover {
        box-shadow: 0 -2px 0 0 var(--primary-color);
      }
      .drag-handle {
        display: flex;
        align-items: center;
        padding: 0 4px 0 8px;
        color: var(--secondary-text-color);
        cursor: grab;
      }
      .drag-handle ha-icon {
        --mdc-icon-size: 20px;
      }
      .srow-body {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px 10px 4px;
        flex-wrap: wrap;
      }
      .srow-main {
        flex: 1;
        min-width: 160px;
      }
      .srow-name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 1rem;
      }
      .srow-name .ellipsis {
        min-width: 0;
      }
      .srow-meta {
        font-size: 0.82rem;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }
      .cond-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 6px;
      }
      .cond-chip {
        font-size: 0.74rem;
        padding: 2px 8px;
        border-radius: 12px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .srow-daypart {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 210px;
        flex-shrink: 0;
        font-size: 0.78rem;
        color: var(--secondary-text-color);
      }
      .srow-daypart ha-icon {
        --mdc-icon-size: 18px;
      }
      .daybar {
        position: relative;
        flex: 1;
        height: 6px;
        border-radius: 3px;
        border: 1px solid var(--divider-color);
        box-sizing: border-box;
      }
      .daybar-marker {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--primary-color);
        border: 1.5px solid var(--card-background-color);
      }
      .srow-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        position: relative;
      }
      .warn-line {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--warning-color, #f0b23a);
        font-size: 0.8rem;
        margin-top: 4px;
      }
      .warn-line ha-icon {
        --mdc-icon-size: 16px;
      }
      /* Popover (run confirm / overflow menu). */
      .popover {
        position: absolute;
        top: 44px;
        right: 0;
        z-index: 5;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
        padding: 12px;
        min-width: 200px;
      }
      .popover .menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        border: none;
        background: none;
        color: inherit;
        font: inherit;
        font-size: 0.88rem;
        padding: 8px 6px;
        cursor: pointer;
        border-radius: 6px;
        text-align: left;
      }
      .popover .menu-item:hover {
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      }
      .popover .menu-item.danger {
        color: var(--error-color);
      }
      .popover ha-icon {
        --mdc-icon-size: 18px;
      }
      /* Editor dialog: sticky head and foot around a scrolling accordion. */
      .dialog.sticky {
        padding: 0;
        display: flex;
        flex-direction: column;
        max-height: 92vh;
        max-width: 720px;
      }
      .dialog-head {
        /* Above the scrolling body, so the overflow menu covers it. */
        position: relative;
        z-index: 2;
        padding: 14px 20px;
        border-bottom: 1px solid var(--divider-color);
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .dialog-head .name-input {
        flex: 1;
        min-width: 0;
        font-size: 1.1rem;
        font-weight: 500;
      }
      .dialog-head .name-input.invalid {
        border-color: var(--error-color);
      }
      .head-switch {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
        color: var(--secondary-text-color);
        white-space: nowrap;
        cursor: pointer;
      }
      .head-menu {
        position: relative;
      }
      .head-menu .popover {
        min-width: 260px;
      }
      .popover .menu-note {
        margin: 6px 6px 2px;
        font-size: 0.76rem;
        line-height: 1.35;
        color: var(--secondary-text-color);
      }
      .dialog-scroll {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 14px 20px 6px;
      }
      .dialog-foot {
        padding: 12px 20px;
        border-top: 1px solid var(--divider-color);
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      /* Accordion sections. */
      .acc {
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        margin-bottom: 10px;
        transition: border-color 0.15s ease;
      }
      .acc.open {
        border-color: color-mix(in srgb, var(--primary-color) 55%, var(--divider-color));
      }
      .acc-head {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        box-sizing: border-box;
        padding: 12px 12px 12px 14px;
        border: none;
        border-radius: 11px;
        background: none;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }
      .acc-head:hover {
        background: color-mix(in srgb, var(--primary-color) 6%, transparent);
      }
      .acc-head:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: -2px;
      }
      .acc-icon {
        flex: none;
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--primary-color) 14%, transparent);
        color: var(--primary-color);
        --mdc-icon-size: 20px;
      }
      .acc-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .acc-label {
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--secondary-text-color);
      }
      .acc.open .acc-label {
        color: var(--primary-color);
      }
      .acc-summary {
        font-size: 0.92rem;
        line-height: 1.35;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        overflow-wrap: anywhere;
      }
      .acc-summary.muted {
        color: var(--secondary-text-color);
      }
      .acc-summary.warn {
        color: var(--warning-color, #f0b23a);
      }
      .acc-chevron {
        flex: none;
        color: var(--secondary-text-color);
        transition: transform 0.2s ease;
      }
      .acc.open .acc-chevron {
        transform: rotate(180deg);
      }
      .acc-body {
        padding: 14px;
        border-top: 1px solid var(--divider-color);
      }
      /* The body's padding is the only space below its last element. */
      .acc-body > :last-child,
      .acc-body > div:last-child > .row:last-child {
        margin-bottom: 0;
      }
      .acc-next {
        display: flex;
        justify-content: flex-end;
        margin-top: 12px;
      }
      .acc-next .btn-outline {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        --mdc-icon-size: 18px;
      }

      /* Optional settings: value chips, the open one's editor underneath. */
      .opt-title {
        font-size: 0.78rem;
        color: var(--secondary-text-color);
        margin: 14px 0 6px;
      }
      .opt-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .opt-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        max-width: 100%;
        font: inherit;
        font-size: 0.82rem;
        padding: 5px 6px 5px 12px;
        border-radius: 16px;
        border: 1px solid var(--divider-color);
        background: transparent;
        color: var(--primary-text-color);
        cursor: pointer;
      }
      .opt-chip:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 1px;
      }
      .opt-chip-label {
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .opt-chip-value {
        min-width: 0;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .opt-chip-value::first-letter {
        text-transform: uppercase;
      }
      .opt-chip ha-icon {
        flex: none;
        --mdc-icon-size: 16px;
        color: var(--secondary-text-color);
        transition: transform 0.2s ease;
      }
      .opt-chip.set {
        border-color: color-mix(in srgb, var(--primary-color) 50%, transparent);
        background: color-mix(in srgb, var(--primary-color) 12%, transparent);
      }
      .opt-chip.set .opt-chip-value {
        color: var(--primary-color);
      }
      .opt-chip.open {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }
      .opt-chip.open ha-icon {
        transform: rotate(180deg);
      }
      .opt-panel {
        padding: 12px;
        margin-top: 10px;
        border-radius: 10px;
        background: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
      }
      /* A select sizes itself to its longest option — keep it inside the panel. */
      .acc-body select {
        max-width: 100%;
      }
      .opt-panel > :last-child,
      .opt-panel > .row:last-child {
        margin-bottom: 0;
      }

      /* One active period: "from" and "to" wrap as whole groups. */
      .period-row {
        flex-wrap: nowrap;
        background: var(--card-background-color);
      }
      .period-ends {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 18px;
      }
      .period-end {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .period-end > span {
        min-width: 2.3em;
        color: var(--secondary-text-color);
      }
      .period-end select.day {
        min-width: 64px;
      }

      .seg {
        display: inline-flex;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
      }
      .seg button {
        font: inherit;
        font-size: 0.875rem;
        border: none;
        background: transparent;
        color: var(--primary-text-color);
        padding: 8px 14px;
        cursor: pointer;
      }
      .seg button.selected {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      /* Trigger type: four equal cells, two by two on a phone. */
      .seg.seg-fill {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        margin-bottom: 12px;
      }
      .seg.seg-fill button {
        padding: 9px 6px;
      }
      .trigger-fields {
        align-items: center;
        margin-bottom: 0;
      }
      .assignment-box {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 10px 12px;
        margin-bottom: 8px;
      }
      .assignment-head {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .assignment-head .name {
        font-weight: 600;
        flex: 1;
        min-width: 120px;
      }
      .slider-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .slider-row input[type="number"] {
        width: 76px;
      }
      .quick-add {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px 8px;
        margin-bottom: 10px;
      }
      .quick-add-label {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .quick-add-group {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        padding-left: 8px;
        border-left: 1px solid var(--divider-color);
      }
      .quick-add-sub {
        font-size: 0.76rem;
        color: var(--secondary-text-color);
      }
      .quick-add .chip {
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .quick-add .chip ha-icon {
        --mdc-icon-size: 15px;
      }

      @container acview (max-width: 900px) {
        .srow-daypart {
          width: 100%;
          order: 5;
        }
      }
      @container acview (max-width: 620px) {
        /* The editor takes the whole screen on a phone. */
        .dialog-backdrop.editor {
          padding: 0;
          align-items: stretch;
        }
        .dialog.sticky {
          max-width: none;
          max-height: none;
          border-radius: 0;
        }
        .dialog-head {
          padding: 10px 12px;
          gap: 8px;
        }
        .head-switch span {
          display: none;
        }
        .dialog-scroll {
          padding: 12px 12px 4px;
        }
        .dialog-foot {
          padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
        }
        .dialog-foot button {
          flex: 1;
        }
        .acc-head {
          padding: 10px 8px 10px 10px;
          gap: 10px;
        }
        .acc-body {
          padding: 12px 10px;
        }
        .seg.seg-fill {
          grid-template-columns: repeat(2, 1fr);
        }
        .srow-body {
          gap: 8px;
        }
        .srow-actions {
          width: 100%;
          justify-content: flex-start;
          border-top: 1px solid var(--divider-color);
          padding-top: 6px;
          margin-top: 2px;
        }
      }
    `,
    ]; }
    updated() {
        if (this.editScenarioId &&
            this._openedDeepLink !== this.editScenarioId &&
            this.snapshot) {
            const scenario = this.snapshot.scenarios.find((s) => s.id === this.editScenarioId);
            this._openedDeepLink = this.editScenarioId;
            stripEditScenarioQueryFromUrl();
            if (scenario)
                this._openEdit(scenario);
        }
    }
    // ------------------------------------------------------------------ helpers
    _coverName(coverItemId) {
        return (this.snapshot.covers.find((c) => c.id === coverItemId)?.name ?? coverItemId);
    }
    _areaName(areaId) {
        return this.hass.areas?.[areaId]?.name ?? areaId;
    }
    _occFor(s) {
        return this.snapshot.plan.find((o) => o.scenario_id === s.id);
    }
    _scenarioMinute(s) {
        const occ = this._occFor(s);
        if (occ) {
            const m = minutesOfDay(occ.planned_at);
            if (m != null)
                return m;
        }
        if (s.trigger.type === "fixed_time") {
            const [h, mm] = (s.trigger.time_local ?? "").split(":").map(Number);
            return Number.isFinite(h) && Number.isFinite(mm) ? h * 60 + mm : null;
        }
        const sr = this.snapshot.sun.sunrise
            ? minutesOfDay(this.snapshot.sun.sunrise)
            : null;
        const ss = this.snapshot.sun.sunset
            ? minutesOfDay(this.snapshot.sun.sunset)
            : null;
        let base = null;
        if (s.trigger.sun_event === "sunrise")
            base = sr;
        else if (s.trigger.sun_event === "sunset")
            base = ss;
        else if (s.trigger.sun_event === "solar_noon")
            base = sr != null && ss != null ? Math.round((sr + ss) / 2) : 12 * 60;
        if (base == null)
            return null;
        return (((base + (s.trigger.offset_min ?? 0)) % 1440) + 1440) % 1440;
    }
    _dayPart(min) {
        if (min < 5 * 60)
            return "night";
        if (min < 9 * 60)
            return "morning";
        if (min < 12 * 60)
            return "forenoon";
        if (min < 14 * 60)
            return "noon";
        if (min < 18 * 60)
            return "afternoon";
        if (min < 21 * 60)
            return "evening";
        return "night";
    }
    _sunGradient() {
        const night = "color-mix(in srgb, var(--primary-text-color) 10%, var(--card-background-color))";
        const day = "color-mix(in srgb, var(--warning-color, #f0b23a) 20%, var(--card-background-color))";
        const sr = this.snapshot.sun.sunrise
            ? minutesOfDay(this.snapshot.sun.sunrise)
            : null;
        const ss = this.snapshot.sun.sunset
            ? minutesOfDay(this.snapshot.sun.sunset)
            : null;
        if (sr == null || ss == null || sr >= ss)
            return night;
        const p = (m) => Math.max(0, Math.min(100, (m / 1440) * 100));
        const a = p(sr);
        const b = p(ss);
        const f = 3;
        return `linear-gradient(90deg, ${night} 0%, ${night} ${Math.max(0, a - f)}%, ${day} ${a + f}%, ${day} ${Math.max(a + f, b - f)}%, ${night} ${b + f}%, ${night} 100%)`;
    }
    _renderDaypart(s) {
        const min = this._scenarioMinute(s);
        if (min == null)
            return A;
        const key = this._dayPart(min);
        const label = t(this.hass, `config_panel.scenarios_daypart_${key}`);
        return b `
      <div class="srow-daypart">
        <ha-icon icon=${DAYPART_ICONS[key]}></ha-icon>
        <span>${label}</span>
        <div class="daybar" style="background:${this._sunGradient()}">
          <div class="daybar-marker" style="left:${(min / 1440) * 100}%"></div>
        </div>
      </div>
    `;
    }
    _patch(patch) {
        if (!this._draft)
            return;
        this._draft = { ...this._draft, ...patch };
        this.requestUpdate();
    }
    // ------------------------------------------------------------------ actions
    /** Show the editor; `section` is the accordion section that starts open. */
    _showEditor(draft, section) {
        this._draft = draft;
        this._error = undefined;
        this._openSection = section;
        this._openOption = null;
        this._headMenuOpen = false;
        this._menuOpenId = null;
        this.requestUpdate();
    }
    _closeEditor() {
        this._draft = null;
        this._headMenuOpen = false;
        this.requestUpdate();
    }
    _openAdd() {
        // A new scenario is walked through top to bottom, starting with "When".
        this._warnings = [];
        this._showEditor(emptyScenario(), "when");
    }
    _openEdit(scenario) {
        // An existing one opens as an overview: four summaries, nothing unfolded.
        this._warnings = scenario.warnings ?? [];
        this._showEditor(JSON.parse(JSON.stringify(scenario)), null);
    }
    async _toggleSection(id) {
        const opening = this._openSection !== id;
        this._openSection = opening ? id : null;
        this._openOption = null;
        this.requestUpdate();
        if (!opening)
            return;
        await this.updateComplete;
        this.renderRoot
            .querySelector(`.acc[data-section="${id}"]`)
            ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    _sectionLabel(id) {
        switch (id) {
            case "when":
                return t(this.hass, "config_panel.scenarios_when");
            case "only_if":
                return t(this.hass, "config_panel.scenarios_only_if");
            case "then":
                return t(this.hass, "config_panel.scenarios_then");
            default:
                return t(this.hass, "config_panel.scenarios_covers");
        }
    }
    _duplicate(scenario) {
        const copy = JSON.parse(JSON.stringify(scenario));
        copy.id = "";
        copy.name = `${copy.name} (copy)`;
        this._warnings = [];
        this._showEditor(copy, null);
    }
    async _save() {
        if (!this._draft)
            return;
        if (!this._draft.name.trim()) {
            this._error = t(this.hass, "config_panel.scenarios_err_name_required");
            this.requestUpdate();
            this.renderRoot.querySelector(".name-input")?.focus();
            return;
        }
        this._busy = true;
        this.requestUpdate();
        try {
            const res = await saveScenario(this.hass, this.entryId, this._draft);
            if (res.warnings?.length) {
                this._warnings = res.warnings;
                this._draft = { ...this._draft, id: res.id };
            }
            else {
                this._draft = null;
                this._warnings = [];
            }
            this._error = undefined;
        }
        catch (e) {
            this._error = formatApiError(e, this.hass);
        }
        finally {
            this._busy = false;
            this.requestUpdate();
        }
    }
    async _delete(scenario) {
        this._menuOpenId = null;
        if (!window.confirm(t(this.hass, "config_panel.scenarios_delete_confirm", { name: scenario.name }))) {
            return;
        }
        try {
            await deleteScenario(this.hass, this.entryId, scenario.id);
            if (this._draft?.id === scenario.id)
                this._draft = null;
        }
        catch (e) {
            this._error = formatApiError(e, this.hass);
        }
        this.requestUpdate();
    }
    async _toggleEnabled(scenario) {
        try {
            const { warnings, ...payload } = scenario;
            void warnings;
            await saveScenario(this.hass, this.entryId, {
                ...payload,
                enabled: !scenario.enabled,
            });
        }
        catch (e) {
            this._error = formatApiError(e, this.hass);
            this.requestUpdate();
        }
    }
    async _reorder(ids) {
        try {
            await reorderScenarios(this.hass, this.entryId, ids);
        }
        catch (e) {
            this._error = formatApiError(e, this.hass);
            this.requestUpdate();
        }
    }
    async _move(index, delta) {
        const ids = this.snapshot.scenarios.map((s) => s.id);
        const target = index + delta;
        if (target < 0 || target >= ids.length)
            return;
        [ids[index], ids[target]] = [ids[target], ids[index]];
        await this._reorder(ids);
    }
    async _onDrop(dropIndex) {
        const from = this._dragIndex;
        this._dragIndex = null;
        this._dragOverIndex = null;
        if (from == null || from === dropIndex) {
            this.requestUpdate();
            return;
        }
        const ids = this.snapshot.scenarios.map((s) => s.id);
        const [moved] = ids.splice(from, 1);
        ids.splice(dropIndex, 0, moved);
        await this._reorder(ids);
    }
    async _runNow(scenarioId, ignoreConditions = this._runIgnoreConditions) {
        this._runPopoverId = null;
        this._headMenuOpen = false;
        this._busy = true;
        this.requestUpdate();
        try {
            await runScenario(this.hass, this.entryId, scenarioId, { ignoreConditions });
            this._error = undefined;
        }
        catch (e) {
            this._error = formatApiError(e, this.hass);
        }
        finally {
            this._busy = false;
            this.requestUpdate();
        }
    }
    // ---------------------------------------------------------------- rendering
    _renderResultBadge(occ) {
        const runs = occ.assignments;
        let key;
        if (runs.length && runs.every((r) => r.result === "executed"))
            key = "scenarios_result_done";
        else if (runs.some((r) => r.result === "executed"))
            key = "scenarios_result_partial";
        else
            key = "scenarios_result_skipped";
        return b `<span class="badge">${t(this.hass, `config_panel.${key}`)}</span>`;
    }
    _renderBadge(s) {
        if (!s.enabled) {
            return b `<span class="badge">${t(this.hass, "config_panel.scenarios_disabled_off")}</span>`;
        }
        const occ = this._occFor(s);
        if (!occ) {
            return inActivePeriods(s.active_periods)
                ? A
                : b `<span class="badge"
            >${t(this.hass, "config_panel.scenarios_paused_until", {
                    date: formatMonthDay(this.hass, nextPeriodStart(s.active_periods)),
                })}</span
          >`;
        }
        if (occ.fired)
            return this._renderResultBadge(occ);
        return occPreflightBadge(this.hass, occ);
    }
    _renderRow(scenario, index, total) {
        const occ = this._occFor(scenario);
        const conds = scenario.conditions;
        const shownConds = conds.slice(0, 2);
        const dragover = this._dragOverIndex === index;
        return b `
      <div
        class="srow ${scenario.enabled ? "" : "inactive"} ${dragover ? "dragover" : ""}"
        @dragover=${(e) => {
            e.preventDefault();
            if (this._dragOverIndex !== index) {
                this._dragOverIndex = index;
                this.requestUpdate();
            }
        }}
        @drop=${() => this._onDrop(index)}
        @keydown=${(e) => {
            if (e.altKey && e.key === "ArrowUp") {
                e.preventDefault();
                this._move(index, -1);
            }
            else if (e.altKey && e.key === "ArrowDown") {
                e.preventDefault();
                this._move(index, 1);
            }
        }}
        tabindex="0"
      >
        <div
          class="drag-handle"
          draggable="true"
          title=${t(this.hass, "config_panel.scenarios_drag_handle")}
          @dragstart=${() => {
            this._dragIndex = index;
        }}
          @dragend=${() => {
            this._dragIndex = null;
            this._dragOverIndex = null;
            this.requestUpdate();
        }}
        >
          <ha-icon icon="mdi:drag"></ha-icon>
        </div>
        <div class="srow-body">
          <ha-switch
            .checked=${scenario.enabled}
            @click=${() => this._toggleEnabled(scenario)}
          ></ha-switch>
          <div class="srow-main">
            <div class="srow-name">
              <span class="ellipsis">${scenario.name}</span>
              ${this._renderBadge(scenario)}
            </div>
            <div class="srow-meta">
              ${scheduleText(this.hass, scenario)} ·
              ${t(this.hass, "config_panel.scenarios_covers_count", {
            n: scenario.assignments.length,
        })}
              → ${scenario.action.position}%
              ${occ
            ? b ` · ${t(this.hass, "config_panel.scenarios_today_at", {
                time: formatTime(occ.planned_at),
            })}`
            : !scenario.enabled
                ? b ` · ${t(this.hass, "config_panel.scenarios_not_in_plan")}`
                : A}
            </div>
            ${shownConds.length
            ? b `<div class="cond-chips">
                  ${shownConds.map((c) => b `<span class="cond-chip">${conditionText(this.hass, c)}</span>`)}
                  ${conds.length > 2
                ? b `<span class="cond-chip"
                        >${t(this.hass, "config_panel.scenarios_cond_more", {
                    n: conds.length - 2,
                })}</span
                      >`
                : A}
                </div>`
            : A}
            ${scenario.warnings?.length
            ? b `<div class="warn-line">
                  <ha-icon icon="mdi:alert-outline"></ha-icon>
                  <span>${scenario.warnings.join(" · ")}</span>
                </div>`
            : A}
          </div>
          ${this._renderDaypart(scenario)}
          <div class="srow-actions">
            <button
              type="button"
              class="iconbtn"
              title=${t(this.hass, "config_panel.scenarios_run")}
              aria-label=${t(this.hass, "config_panel.scenarios_run")}
              @click=${() => {
            this._runPopoverId =
                this._runPopoverId === scenario.id ? null : scenario.id;
            this._menuOpenId = null;
            this.requestUpdate();
        }}
            >
              <ha-icon icon="mdi:play"></ha-icon>
            </button>
            <button
              type="button"
              class="iconbtn"
              title=${t(this.hass, "config_panel.scenarios_edit")}
              aria-label=${t(this.hass, "config_panel.scenarios_edit")}
              @click=${() => this._openEdit(scenario)}
            >
              <ha-icon icon="mdi:pencil-outline"></ha-icon>
            </button>
            <button
              type="button"
              class="iconbtn"
              title=${t(this.hass, "config_panel.scenarios_more")}
              aria-label=${t(this.hass, "config_panel.scenarios_more")}
              @click=${() => {
            this._menuOpenId =
                this._menuOpenId === scenario.id ? null : scenario.id;
            this._runPopoverId = null;
            this.requestUpdate();
        }}
            >
              <ha-icon icon="mdi:dots-vertical"></ha-icon>
            </button>
            ${this._runPopoverId === scenario.id
            ? this._renderRunPopover(scenario)
            : A}
            ${this._menuOpenId === scenario.id
            ? this._renderMenu(scenario, index, total)
            : A}
          </div>
        </div>
      </div>
    `;
    }
    _renderRunPopover(scenario) {
        return b `
      <div class="popover" @click=${(e) => e.stopPropagation()}>
        <p style="margin:0 0 8px;font-size:0.88rem">
          ${t(this.hass, "config_panel.scenarios_run_now_confirm")}
        </p>
        <label class="checkbox-row" style="margin:0 0 10px">
          <input
            type="checkbox"
            .checked=${this._runIgnoreConditions}
            @change=${(e) => {
            this._runIgnoreConditions = e.target.checked;
        }}
          />
          ${t(this.hass, "config_panel.scenarios_run_ignore_short")}
        </label>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button
            class="btn-outline"
            @click=${() => {
            this._runPopoverId = null;
            this.requestUpdate();
        }}
          >
            ${t(this.hass, "config_panel.cancel")}
          </button>
          <button
            class="btn"
            .disabled=${this._busy}
            @click=${() => this._runNow(scenario.id)}
          >
            ${t(this.hass, "config_panel.scenarios_run")}
          </button>
        </div>
      </div>
    `;
    }
    _renderMenu(scenario, index, total) {
        return b `
      <div class="popover" @click=${(e) => e.stopPropagation()}>
        <button
          class="menu-item"
          .disabled=${index === 0}
          @click=${() => {
            this._menuOpenId = null;
            this._move(index, -1);
        }}
        >
          <ha-icon icon="mdi:chevron-up"></ha-icon>
          ${t(this.hass, "config_panel.scenarios_move_up")}
        </button>
        <button
          class="menu-item"
          .disabled=${index === total - 1}
          @click=${() => {
            this._menuOpenId = null;
            this._move(index, 1);
        }}
        >
          <ha-icon icon="mdi:chevron-down"></ha-icon>
          ${t(this.hass, "config_panel.scenarios_move_down")}
        </button>
        <button class="menu-item" @click=${() => this._duplicate(scenario)}>
          <ha-icon icon="mdi:content-copy"></ha-icon>
          ${t(this.hass, "config_panel.scenarios_duplicate")}
        </button>
        <button class="menu-item danger" @click=${() => this._delete(scenario)}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>
          ${t(this.hass, "config_panel.scenarios_delete")}
        </button>
      </div>
    `;
    }
    // ---- editor dialog: accordion sections ----
    /**
     * A row of option chips with the editor of the open one underneath.
     *
     * Everything optional in a section lives here, so the section itself stays
     * short: the chip shows the current value, a tap unfolds its editor.
     */
    _renderOptions(options) {
        const open = options.find((o) => o.id === this._openOption);
        return b `
      <div class="opt-title">${t(this.hass, "config_panel.scenarios_options")}</div>
      <div class="opt-chips">
        ${options.map((o) => b `<button
            type="button"
            class="opt-chip ${o.set ? "set" : ""} ${o === open ? "open" : ""}"
            data-option=${o.id}
            aria-expanded=${o === open ? "true" : "false"}
            @click=${() => {
            this._openOption = o === open ? null : o.id;
            this.requestUpdate();
        }}
          >
            <span class="opt-chip-label">${o.label}</span>
            <span class="opt-chip-value">${o.value}</span>
            <ha-icon icon="mdi:chevron-down"></ha-icon>
          </button>`)}
      </div>
      ${open ? b `<div class="opt-panel">${open.render()}</div>` : A}
    `;
    }
    _renderWhenBody(draft) {
        const off = t(this.hass, "config_panel.off");
        const weekdayCount = draft.weekdays.length;
        return b `
      <div class="seg seg-fill">
        ${TRIGGER_TYPES.map((tt) => b `
            <button
              type="button"
              class=${draft.trigger.type === tt ? "selected" : ""}
              @click=${() => this._patch({ trigger: { ...draft.trigger, type: tt } })}
            >
              ${t(this.hass, tt === "sun_event"
            ? "config_panel.trigger_sun"
            : `config_panel.trigger_${tt}`)}
            </button>
          `)}
      </div>
      <div class="row trigger-fields">
        ${draft.trigger.type === "fixed_time"
            ? b `<input
              type="time"
              style="width:auto"
              .value=${draft.trigger.time_local ?? "07:00"}
              @input=${(e) => this._patch({
                trigger: {
                    ...draft.trigger,
                    time_local: e.target.value,
                },
            })}
            />`
            : draft.trigger.type === "sun_event"
                ? b `
                <select
                  style="width:auto"
                  .value=${draft.trigger.sun_event ?? "sunset"}
                  @change=${(e) => this._patch({
                    trigger: {
                        ...draft.trigger,
                        sun_event: e.target
                            .value,
                    },
                })}
                >
                  ${["sunrise", "sunset", "solar_noon"].map((ev) => b `<option value=${ev} ?selected=${draft.trigger.sun_event === ev}>
                      ${t(this.hass, `config_panel.sun_${ev}`)}
                    </option>`)}
                </select>
                ${this._renderOffsetField(draft)}
              `
                : draft.trigger.type === "sun_azimuth"
                    ? this._renderSunAzimuthFields(draft)
                    : this._renderSunElevationFields(draft)}
      </div>
      ${this._renderLivePreview(draft)}
      ${this._renderOptions([
            {
                id: "random",
                label: t(this.hass, "config_panel.scenarios_opt_random"),
                value: randomText(draft) ?? off,
                set: draft.random_window_min > 0,
                render: () => this._renderRandomField(draft),
            },
            {
                id: "weekdays",
                label: t(this.hass, "config_panel.scenarios_weekdays"),
                value: weekdaysText(this.hass, draft),
                set: weekdayCount > 0 && weekdayCount < WEEKDAYS.length,
                render: () => this._renderWeekdaysField(draft),
            },
            {
                id: "period",
                label: t(this.hass, "config_panel.scenarios_period"),
                value: periodValue(this.hass, draft),
                set: (draft.active_periods ?? []).length > 0,
                render: () => this._renderPeriodField(draft),
            },
            {
                id: "retry",
                label: t(this.hass, "config_panel.scenarios_opt_retry"),
                value: draft.retry_window_min ? formatWindow(draft.retry_window_min) : off,
                set: draft.retry_window_min > 0,
                render: () => this._renderRetryField(draft),
            },
        ])}
    `;
    }
    _renderRandomField(draft) {
        return b `
      <label class="field-label">${t(this.hass, "config_panel.scenarios_random")}</label>
      <div class="row" style="align-items:center">
        <span class="chips">
          ${RANDOM_WINDOWS.map((w) => b `<button
              type="button"
              class="chip ${draft.random_window_min === w ? "selected" : ""}"
              @click=${() => this._patch({ random_window_min: w })}
            >
              ${w === 0 ? t(this.hass, "config_panel.off") : `${w} min`}
            </button>`)}
        </span>
        ${draft.random_window_min
            ? b `<select
              style="width:auto"
              .value=${draft.random_direction}
              @change=${(e) => this._patch({
                random_direction: e.target
                    .value,
            })}
            >
              ${["after", "before", "both"].map((d) => b `<option value=${d} ?selected=${draft.random_direction === d}>
                  ${t(this.hass, `config_panel.random_${d}`)}
                </option>`)}
            </select>`
            : A}
      </div>
      ${renderHelp(this.hass, "random")}
    `;
    }
    _renderWeekdaysField(draft) {
        return b `
      <label class="field-label">${t(this.hass, "config_panel.scenarios_weekdays")}</label>
      <div class="chips">
        ${WEEKDAYS.map((d) => {
            const selected = draft.weekdays.includes(d);
            return b `<button
            type="button"
            class="chip ${selected ? "selected" : ""}"
            @click=${() => this._patch({
                weekdays: selected
                    ? draft.weekdays.filter((x) => x !== d)
                    : [...draft.weekdays, d],
            })}
          >
            ${t(this.hass, `config_panel.weekday_${d}`)}
          </button>`;
        })}
      </div>
    `;
    }
    _renderRetryField(draft) {
        return b `
      <label class="field-label">${t(this.hass, "config_panel.scenarios_retry")}</label>
      <div class="chips" style="margin-bottom:8px">
        ${RETRY_WINDOWS.map((w) => b `<button
            type="button"
            class="chip ${draft.retry_window_min === w ? "selected" : ""}"
            @click=${() => this._patch({ retry_window_min: w })}
          >
            ${w === 0 ? t(this.hass, "config_panel.off") : formatWindow(w)}
          </button>`)}
      </div>
      <p class="section-desc">${t(this.hass, "config_panel.scenarios_retry_hint")}</p>
      ${renderHelp(this.hass, "retry")}
    `;
    }
    _renderPeriodField(draft) {
        const periods = draft.active_periods ?? [];
        const limited = periods.length > 0;
        const setPeriod = (index, patch) => this._patch({
            active_periods: periods.map((p, i) => (i === index ? { ...p, ...patch } : p)),
        });
        const picker = (index, key, label) => {
            const value = parseMonthDay(periods[index][key]) ?? { month: 1, day: 1 };
            const pick = (month, day) => setPeriod(index, { [key]: toMonthDay(month, day) });
            return b `<span class="period-end">
        <span>${label}</span>
        <select
          class="day"
          @change=${(e) => pick(value.month, Number(e.target.value))}
        >
          ${Array.from({ length: daysInMonth(value.month) }, (_, i) => i + 1).map((d) => b `<option value=${d} ?selected=${d === value.day}>${d}.</option>`)}
        </select>
        <select
          @change=${(e) => pick(Number(e.target.value), value.day)}
        >
          ${Array.from({ length: 12 }, (_, i) => i + 1).map((m) => b `<option value=${m} ?selected=${m === value.month}>
              ${monthName(this.hass, m)}
            </option>`)}
        </select>
      </span>`;
        };
        return b `
      <label class="field-label">${t(this.hass, "config_panel.scenarios_period")}</label>
      <div class="chips" style="margin-bottom:${limited ? 8 : 0}px">
        <button
          type="button"
          class="chip ${limited ? "" : "selected"}"
          @click=${() => this._patch({ active_periods: [] })}
        >
          ${t(this.hass, "config_panel.scenarios_period_all_year")}
        </button>
        <button
          type="button"
          class="chip ${limited ? "selected" : ""}"
          @click=${() => {
            if (!limited)
                this._patch({ active_periods: [{ ...DEFAULT_PERIOD }] });
        }}
        >
          ${t(this.hass, "config_panel.scenarios_period_limited")}
        </button>
      </div>
      ${limited
            ? b `
            ${periods.map((_p, index) => b `
                <div class="cond-row period-row">
                  <div class="period-ends">
                    ${picker(index, "from", t(this.hass, "config_panel.scenarios_period_from"))}
                    ${picker(index, "to", t(this.hass, "config_panel.scenarios_period_to"))}
                  </div>
                  <button
                    type="button"
                    class="cond-remove"
                    title=${t(this.hass, "config_panel.scenarios_period_remove")}
                    @click=${() => this._patch({
                active_periods: periods.filter((_x, i) => i !== index),
            })}
                  >
                    <ha-icon icon="mdi:close"></ha-icon>
                  </button>
                </div>
              `)}
            <div class="chips" style="margin-bottom:8px">
              <button
                type="button"
                class="chip"
                @click=${() => this._patch({ active_periods: [...periods, { ...DEFAULT_PERIOD }] })}
              >
                + ${t(this.hass, "config_panel.scenarios_period_add")}
              </button>
            </div>
            <p class="section-desc">
              ${t(this.hass, "config_panel.scenarios_period_hint")}
            </p>
          `
            : A}
    `;
    }
    _renderOffsetField(draft) {
        return b `
      <span class="inline-field">
        <span class="inline-field-label"
          >${t(this.hass, "config_panel.scenarios_offset_min")}</span
        >
        <input
          type="number"
          min="-720"
          max="720"
          style="width:80px"
          .value=${String(draft.trigger.offset_min ?? 0)}
          @input=${(e) => this._patch({
            trigger: {
                ...draft.trigger,
                offset_min: Number(e.target.value),
            },
        })}
        />
      </span>
    `;
    }
    /** Number input with a degree sign attached tightly to its right edge. */
    _degInput(value, min, max, onInput) {
        return b `
      <span class="deg-wrap">
        <input
          type="number"
          min=${min}
          max=${max}
          style="width:80px"
          .value=${String(value)}
          @input=${(e) => onInput(Number(e.target.value))}
        />
        <span class="deg-sign">°</span>
      </span>
    `;
    }
    _renderSunAzimuthFields(draft) {
        const relative = draft.trigger.az_relative ?? false;
        const deg = draft.trigger.azimuth_deg ?? 180;
        return b `
      <div>
        <div class="chips" style="margin-bottom:8px">
          ${[false, true].map((rel) => b `<button
              type="button"
              class="chip ${relative === rel ? "selected" : ""}"
              @click=${() => this._patch({ trigger: { ...draft.trigger, az_relative: rel } })}
            >
              ${t(this.hass, rel
            ? "config_panel.trigger_az_mode_facade"
            : "config_panel.trigger_az_mode_compass")}
            </button>`)}
        </div>
        ${relative
            ? b `
              <div class="row">
                <span class="inline-field-label"
                  >${t(this.hass, "config_panel.trigger_facade_offset")}</span
                >
                ${this._degInput(draft.trigger.azimuth_offset_deg ?? 0, -180, 180, (v) => this._patch({
                trigger: { ...draft.trigger, azimuth_offset_deg: v },
            }))}
                ${this._renderOffsetField(draft)}
              </div>
              <p class="section-desc">
                ${t(this.hass, "config_panel.trigger_facade_hint")}
              </p>
            `
            : b `
              ${renderCompass(deg, (d) => {
                if (d != null) {
                    this._patch({ trigger: { ...draft.trigger, azimuth_deg: d } });
                }
            })}
              <div class="row" style="justify-content:center">
                ${this._degInput(deg, 0, 359, (v) => this._patch({ trigger: { ...draft.trigger, azimuth_deg: v } }))}
                ${this._renderOffsetField(draft)}
              </div>
              <p class="section-desc">
                ${t(this.hass, "config_panel.trigger_sun_az_hint")}
              </p>
            `}
      </div>
    `;
    }
    _renderSunElevationFields(draft) {
        return b `
      <select
        style="width:auto"
        .value=${draft.trigger.elevation_dir ?? "falling"}
        @change=${(e) => this._patch({
            trigger: {
                ...draft.trigger,
                elevation_dir: e.target
                    .value,
            },
        })}
      >
        ${["rising", "falling"].map((d) => b `<option
            value=${d}
            ?selected=${(draft.trigger.elevation_dir ?? "falling") === d}
          >
            ${t(this.hass, `config_panel.trigger_dir_${d}`)}
          </option>`)}
      </select>
      ${this._degInput(draft.trigger.elevation_deg ?? 0, -20, 89, (v) => this._patch({ trigger: { ...draft.trigger, elevation_deg: v } }))}
      ${this._renderOffsetField(draft)}
    `;
    }
    _maybePreviewSun(draft) {
        const trig = draft.trigger;
        const coverIds = trig.type === "sun_azimuth" && trig.az_relative
            ? draft.assignments.map((a) => a.cover_item_id)
            : [];
        const key = JSON.stringify([trig, coverIds]);
        if (key === this._previewKey)
            return;
        this._previewKey = key;
        window.clearTimeout(this._previewTimer);
        this._previewTimer = window.setTimeout(async () => {
            try {
                const res = await previewTrigger(this.hass, this.entryId, trig, coverIds);
                if (this._previewKey === key) {
                    this._preview = res;
                    this.requestUpdate();
                }
            }
            catch {
                /* preview is best-effort */
            }
        }, 250);
    }
    /** Live preview of today's computed trigger time under the WHEN section. */
    _renderLivePreview(draft) {
        const trig = draft.trigger;
        if (trig.type === "sun_azimuth" || trig.type === "sun_elevation") {
            // Draft triggers are resolved server-side by the scheduler's own
            // solver, so the preview works before the scenario is saved.
            this._maybePreviewSun(draft);
            const pv = this._preview;
            if (pv === undefined)
                return A;
            const relative = trig.type === "sun_azimuth" && trig.az_relative;
            const missing = relative && pv.missing?.length
                ? b `<p
            class="section-desc"
            style="margin-top:2px;color:var(--warning-color,#b58c00)"
          >
            ${t(this.hass, "config_panel.trigger_facade_missing", {
                    covers: pv.missing.join(", "),
                })}
          </p>`
                : A;
            if (relative && !draft.assignments.length) {
                return b `<p class="section-desc" style="margin-top:6px">
          ${t(this.hass, "config_panel.trigger_facade_no_covers")}
        </p>`;
            }
            if (pv.time === null) {
                return b `<p
            class="section-desc"
            style="margin-top:6px;color:var(--warning-color,#b58c00)"
          >
            ${t(this.hass, "config_panel.scenarios_today_none")}
          </p>
          ${missing}`;
            }
            const range = relative && pv.time_last && pv.time_last !== pv.time
                ? `${formatTime(pv.time)}–${formatTime(pv.time_last)}`
                : formatTime(pv.time);
            return b `<p class="section-desc" style="margin-top:6px">
          ${t(this.hass, "config_panel.scenarios_today_at", { time: range })}
        </p>
        ${missing}`;
        }
        if (!draft.id)
            return A;
        const occ = this._occFor(draft);
        if (!occ)
            return A;
        return b `<p class="section-desc" style="margin-top:6px">
      ${t(this.hass, "config_panel.scenarios_today_at", {
            time: formatTime(occ.planned_at),
        })}${occ.random_offset_min
            ? ` (${t(this.hass, "config_panel.today_random_offset", {
                n: occ.random_offset_min,
            })})`
            : ""}
    </p>`;
    }
    _renderThenBody(draft) {
        const anyTilt = draft.assignments.some((a) => this.snapshot.covers.find((c) => c.id === a.cover_item_id)?.capabilities
            .supports_tilt);
        const action = draft.action;
        return b `
      <div class="slider-row">
        <ha-icon
          icon=${draft.action.position >= 50
            ? "mdi:window-shutter-open"
            : "mdi:window-shutter"}
          style="--mdc-icon-size:22px;color:var(--secondary-text-color)"
        ></ha-icon>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          .value=${String(draft.action.position)}
          @input=${(e) => this._patch({
            action: {
                ...draft.action,
                position: Number(e.target.value),
            },
        })}
        />
        <input
          type="number"
          min="0"
          max="100"
          .value=${String(draft.action.position)}
          @input=${(e) => this._patch({
            action: {
                ...draft.action,
                position: Number(e.target.value),
            },
        })}
        />
        <span class="muted">%</span>
      </div>
      <p class="section-desc">${t(this.hass, "config_panel.scenarios_position_hint")}</p>
      ${anyTilt
            ? b `<div class="slider-row">
            <span class="muted">${t(this.hass, "config_panel.scenarios_tilt")}</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              .value=${String(draft.action.tilt_position ?? 0)}
              .disabled=${draft.action.tilt_position == null}
              @input=${(e) => this._patch({
                action: {
                    ...draft.action,
                    tilt_position: Number(e.target.value),
                },
            })}
            />
            <label class="checkbox-row" style="margin:0">
              <input
                type="checkbox"
                .checked=${draft.action.tilt_position != null}
                @change=${(e) => this._patch({
                action: {
                    ...draft.action,
                    tilt_position: e.target.checked ? 50 : null,
                },
            })}
              />
              ${draft.action.tilt_position != null
                ? `${draft.action.tilt_position}%`
                : t(this.hass, "config_panel.off")}
            </label>
          </div>`
            : A}
      ${this._renderOptions([
            {
                id: "mode",
                label: t(this.hass, "config_panel.scenarios_mode"),
                value: t(this.hass, action.mode === "low" ? "config_panel.mode_low" : "config_panel.mode_normal"),
                set: action.mode === "low",
                render: () => this._renderModeField(draft),
            },
            {
                id: "safety",
                label: t(this.hass, "config_panel.scenarios_opt_safety"),
                value: t(this.hass, `config_panel.safety_override_${action.safety_override ?? "inherit"}`),
                set: action.safety_override != null,
                render: () => this._renderSafetyField(draft),
            },
            {
                id: "min_delta",
                label: t(this.hass, "config_panel.scenarios_opt_min_delta"),
                value: action.min_position_delta == null
                    ? t(this.hass, "config_panel.scenarios_opt_default", {
                        n: this.snapshot.config.default_min_position_delta,
                    })
                    : `${action.min_position_delta}%`,
                set: action.min_position_delta != null,
                render: () => this._renderMinDeltaField(draft),
            },
        ])}
    `;
    }
    _renderModeField(draft) {
        return b `
      <label class="field-label">${t(this.hass, "config_panel.scenarios_mode")}</label>
      <select
        style="width:auto"
        .value=${draft.action.mode}
        @change=${(e) => this._patch({
            action: {
                ...draft.action,
                mode: e.target.value,
            },
        })}
      >
        <option value="normal" ?selected=${draft.action.mode === "normal"}>
          ${t(this.hass, "config_panel.mode_normal")}
        </option>
        <option value="low" ?selected=${draft.action.mode === "low"}>
          ${t(this.hass, "config_panel.mode_low")}
        </option>
      </select>
      ${renderHelp(this.hass, "mode_low")}
    `;
    }
    _renderSafetyField(draft) {
        return b `
      <label class="field-label"
        >${t(this.hass, "config_panel.scenarios_safety_override")}</label
      >
      <select
        style="width:auto"
        @change=${(e) => {
            const value = e.target.value;
            this._patch({
                action: {
                    ...draft.action,
                    safety_override: value === "" ? null : value,
                },
            });
        }}
      >
        <option value="" ?selected=${draft.action.safety_override == null}>
          ${t(this.hass, "config_panel.safety_override_inherit")}
        </option>
        <option
          value="block"
          ?selected=${draft.action.safety_override === "block"}
        >
          ${t(this.hass, "config_panel.safety_override_block")}
        </option>
        <option
          value="clamp"
          ?selected=${draft.action.safety_override === "clamp"}
        >
          ${t(this.hass, "config_panel.safety_override_clamp")}
        </option>
        <option
          value="ignore"
          ?selected=${draft.action.safety_override === "ignore"}
        >
          ${t(this.hass, "config_panel.safety_override_ignore")}
        </option>
      </select>
      <p class="section-desc" style="margin-top:8px">
        ${t(this.hass, "config_panel.scenarios_safety_override_hint")}
      </p>
    `;
    }
    _renderMinDeltaField(draft) {
        return b `
      <label class="field-label">${t(this.hass, "config_panel.scenarios_min_delta")}</label>
      <input
        type="number"
        min="0"
        max="100"
        style="width:90px"
        placeholder=${String(this.snapshot.config.default_min_position_delta)}
        .value=${draft.action.min_position_delta == null
            ? ""
            : String(draft.action.min_position_delta)}
        @input=${(e) => {
            const raw = e.target.value;
            this._patch({
                action: {
                    ...draft.action,
                    min_position_delta: raw === "" ? null : Number(raw),
                },
            });
        }}
      />
      <p class="section-desc" style="margin-top:8px">
        ${t(this.hass, "config_panel.scenarios_min_delta_hint")}
      </p>
      ${renderHelp(this.hass, "min_delta")}
    `;
    }
    _patchAssignment(index, patch) {
        if (!this._draft)
            return;
        const assignments = this._draft.assignments.map((a, i) => i === index ? { ...a, ...patch } : a);
        this._patch({ assignments });
    }
    _addCovers(covers) {
        if (!this._draft || !covers.length)
            return;
        const assigned = new Set(this._draft.assignments.map((a) => a.cover_item_id));
        const additions = covers
            .filter((c) => !assigned.has(c.id))
            .map((c) => ({
            cover_item_id: c.id,
            extra_conditions: [],
            action_override: null,
        }));
        if (!additions.length)
            return;
        this._patch({ assignments: [...this._draft.assignments, ...additions] });
    }
    _renderAssignment(draft, assignment, index) {
        const cover = this.snapshot.covers.find((c) => c.id === assignment.cover_item_id);
        const ov = assignment.action_override ?? emptyOverride();
        const hasOverride = ov.position != null ||
            ov.tilt_position != null ||
            ov.mode != null ||
            ov.safety_override != null;
        return b `
      <div class="assignment-box">
        <div class="assignment-head">
          <span class="name">${this._coverName(assignment.cover_item_id)}</span>
          ${assignment.extra_conditions.length
            ? b `<span class="badge"
                >${t(this.hass, "config_panel.scenarios_extra_conditions_badge", {
                n: assignment.extra_conditions.length,
            })}</span
              >`
            : A}
          ${hasOverride
            ? b `<span class="badge"
                >${t(this.hass, "config_panel.scenarios_override_badge")}</span
              >`
            : A}
          <button
            class="iconbtn danger"
            aria-label=${t(this.hass, "config_panel.scenarios_remove_cover")}
            title=${t(this.hass, "config_panel.scenarios_remove_cover")}
            @click=${() => this._patch({
            assignments: draft.assignments.filter((_, i) => i !== index),
        })}
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        <details class="expand">
          <summary>${t(this.hass, "config_panel.scenarios_assignment_details")}</summary>
          <div class="section-title">
            ${t(this.hass, "config_panel.scenarios_extra_conditions")}
          </div>
          <p class="section-desc">
            ${t(this.hass, "config_panel.scenarios_extra_conditions_desc")}
          </p>
          ${renderConditionEditor({
            hass: this.hass,
            conditions: assignment.extra_conditions,
            onChange: (conds) => this._patchAssignment(index, { extra_conditions: conds }),
            contactAvailable: Boolean(cover?.contact_entity_id),
            coverAzimuth: cover ? cover.azimuth : undefined,
        })}
          <div class="section-title">
            ${t(this.hass, "config_panel.scenarios_override")}
          </div>
          ${renderHelp(this.hass, "override")}
          <div class="row">
            <div>
              <label class="field-label"
                >${t(this.hass, "config_panel.scenarios_position")}</label
              >
              <input
                type="number"
                min="0"
                max="100"
                style="width:90px"
                placeholder=${String(draft.action.position)}
                .value=${ov.position == null ? "" : String(ov.position)}
                @input=${(e) => {
            const raw = e.target.value;
            this._patchAssignment(index, {
                action_override: {
                    ...ov,
                    position: raw === "" ? null : Number(raw),
                },
            });
        }}
              />
            </div>
            ${cover?.capabilities.supports_tilt
            ? b `<div>
                  <label class="field-label"
                    >${t(this.hass, "config_panel.scenarios_tilt")}</label
                  >
                  <input
                    type="number"
                    min="0"
                    max="100"
                    style="width:90px"
                    .value=${ov.tilt_position == null ? "" : String(ov.tilt_position)}
                    @input=${(e) => {
                const raw = e.target.value;
                this._patchAssignment(index, {
                    action_override: {
                        ...ov,
                        tilt_position: raw === "" ? null : Number(raw),
                    },
                });
            }}
                  />
                </div>`
            : A}
            <div>
              <label class="field-label"
                >${t(this.hass, "config_panel.scenarios_mode")}</label
              >
              <select
                style="width:auto"
                @change=${(e) => {
            const value = e.target.value;
            this._patchAssignment(index, {
                action_override: {
                    ...ov,
                    mode: value === "" ? null : value,
                },
            });
        }}
              >
                <option value="" ?selected=${ov.mode == null}>
                  ${t(this.hass, "config_panel.scenarios_inherit")}
                </option>
                <option value="normal" ?selected=${ov.mode === "normal"}>
                  ${t(this.hass, "config_panel.mode_normal")}
                </option>
                <option value="low" ?selected=${ov.mode === "low"}>
                  ${t(this.hass, "config_panel.mode_low")}
                </option>
              </select>
            </div>
            ${cover?.contact_entity_id
            ? b `<div>
                  <label class="field-label"
                    >${t(this.hass, "config_panel.scenarios_safety_override")}</label
                  >
                  <select
                    style="width:auto"
                    @change=${(e) => {
                const value = e.target.value;
                this._patchAssignment(index, {
                    action_override: {
                        ...ov,
                        safety_override: value === "" ? null : value,
                    },
                });
            }}
                  >
                    <option value="" ?selected=${ov.safety_override == null}>
                      ${t(this.hass, "config_panel.scenarios_inherit")}
                    </option>
                    <option
                      value="block"
                      ?selected=${ov.safety_override === "block"}
                    >
                      ${t(this.hass, "config_panel.safety_override_block")}
                    </option>
                    <option
                      value="clamp"
                      ?selected=${ov.safety_override === "clamp"}
                    >
                      ${t(this.hass, "config_panel.safety_override_clamp")}
                    </option>
                    <option
                      value="ignore"
                      ?selected=${ov.safety_override === "ignore"}
                    >
                      ${t(this.hass, "config_panel.safety_override_ignore")}
                    </option>
                  </select>
                </div>`
            : A}
          </div>
        </details>
      </div>
    `;
    }
    _renderQuickAdd(addable) {
        if (!addable.length)
            return A;
        const byDir = new Map();
        for (const c of addable) {
            if (c.azimuth == null)
                continue;
            const deg = nearestCompassDeg(c.azimuth);
            (byDir.get(deg) ?? byDir.set(deg, []).get(deg)).push(c);
        }
        const byArea = new Map();
        for (const c of addable) {
            if (!c.area_id)
                continue;
            (byArea.get(c.area_id) ?? byArea.set(c.area_id, []).get(c.area_id)).push(c);
        }
        const areas = [...byArea.entries()]
            .map(([id, covers]) => ({ id, name: this._areaName(id), covers }))
            .sort((a, b) => a.name.localeCompare(b.name));
        const anyDir = [...byDir.values()].some((v) => v.length);
        return b `
      <div class="quick-add">
        <span class="quick-add-label"
          >${t(this.hass, "config_panel.scenarios_quick_add")}</span
        >
        <button type="button" class="chip" @click=${() => this._addCovers(addable)}>
          ${t(this.hass, "config_panel.scenarios_quick_add_all", { n: addable.length })}
        </button>
        ${anyDir
            ? b `<span class="quick-add-group">
              <span class="quick-add-sub"
                >${t(this.hass, "config_panel.scenarios_quick_add_direction")}</span
              >
              ${COMPASS.map(([label, deg]) => {
                const covers = byDir.get(deg) ?? [];
                return covers.length
                    ? b `<button
                      type="button"
                      class="chip"
                      @click=${() => this._addCovers(covers)}
                    >
                      <ha-icon icon="mdi:compass-outline"></ha-icon>${label} ·${covers.length}
                    </button>`
                    : A;
            })}
            </span>`
            : A}
        ${areas.length
            ? b `<span class="quick-add-group">
              <span class="quick-add-sub"
                >${t(this.hass, "config_panel.scenarios_quick_add_room")}</span
              >
              ${areas.map((a) => b `<button
                  type="button"
                  class="chip"
                  @click=${() => this._addCovers(a.covers)}
                >
                  <ha-icon icon="mdi:map-marker-outline"></ha-icon>${a.name} ·${a.covers.length}
                </button>`)}
            </span>`
            : A}
      </div>
    `;
    }
    _renderCoversBody(draft) {
        const assignedIds = new Set(draft.assignments.map((a) => a.cover_item_id));
        const addable = this.snapshot.covers.filter((c) => !assignedIds.has(c.id));
        return b `
      ${renderHelp(this.hass, "assignments")}
      ${this._renderQuickAdd(addable)}
      ${draft.assignments.map((a, i) => this._renderAssignment(draft, a, i))}
      ${addable.length
            ? b `<select
            @change=${(e) => {
                const sel = e.target;
                if (!sel.value)
                    return;
                this._patch({
                    assignments: [
                        ...draft.assignments,
                        {
                            cover_item_id: sel.value,
                            extra_conditions: [],
                            action_override: null,
                        },
                    ],
                });
                sel.value = "";
            }}
          >
            <option value="">+ ${t(this.hass, "config_panel.scenarios_add_cover")}</option>
            ${addable.map((c) => b `<option value=${c.id}>${c.name}</option>`)}
          </select>`
            : A}
      ${!this.snapshot.covers.length
            ? b `<p class="muted">${t(this.hass, "config_panel.scenarios_no_covers_hint")}</p>`
            : A}
    `;
    }
    /** One accordion section: a summary header, the body only while open. */
    _renderSection(draft, id, summary, tone, body) {
        const open = this._openSection === id;
        const next = SECTIONS[SECTIONS.indexOf(id) + 1];
        return b `
      <section class="acc ${open ? "open" : ""}" data-section=${id}>
        <button
          type="button"
          class="acc-head"
          aria-expanded=${open ? "true" : "false"}
          @click=${() => this._toggleSection(id)}
        >
          <span class="acc-icon"><ha-icon icon=${SECTION_ICONS[id]}></ha-icon></span>
          <span class="acc-text">
            <span class="acc-label">${this._sectionLabel(id)}</span>
            <span class="acc-summary ${tone}">${summary}</span>
          </span>
          <ha-icon class="acc-chevron" icon="mdi:chevron-down"></ha-icon>
        </button>
        ${open
            ? b `<div class="acc-body">
              ${body()}
              ${
            // A scenario that was never saved is filled in top to bottom.
            !draft.id && next
                ? b `<div class="acc-next">
                      <button
                        type="button"
                        class="btn-outline"
                        @click=${() => this._toggleSection(next)}
                      >
                        ${t(this.hass, "config_panel.scenarios_next", {
                    section: this._sectionLabel(next),
                })}
                        <ha-icon icon="mdi:arrow-down"></ha-icon>
                      </button>
                    </div>`
                : A}
            </div>`
            : A}
      </section>
    `;
    }
    _renderOnlyIfBody(draft) {
        return b `
      <p class="section-desc">${t(this.hass, "config_panel.scenarios_only_if_desc")}</p>
      ${renderHelp(this.hass, "conditions_scope")}
      ${renderConditionEditor({
            hass: this.hass,
            conditions: draft.conditions,
            onChange: (conds) => this._patch({ conditions: conds }),
            contactAvailable: draft.assignments.some((a) => Boolean(this.snapshot.covers.find((c) => c.id === a.cover_item_id)
                ?.contact_entity_id)),
        })}
    `;
    }
    /** Test-run entries of the editor's overflow menu (saved scenarios only). */
    _renderHeadMenu(draft) {
        return b `
      <div class="head-menu" @click=${(e) => e.stopPropagation()}>
        <button
          class="iconbtn"
          aria-label=${t(this.hass, "config_panel.scenarios_more_actions")}
          title=${t(this.hass, "config_panel.scenarios_more_actions")}
          aria-expanded=${this._headMenuOpen ? "true" : "false"}
          @click=${() => {
            this._headMenuOpen = !this._headMenuOpen;
            this.requestUpdate();
        }}
        >
          <ha-icon icon="mdi:dots-vertical"></ha-icon>
        </button>
        ${this._headMenuOpen
            ? b `<div class="popover">
              <button
                class="menu-item"
                .disabled=${this._busy}
                @click=${() => this._runNow(draft.id, false)}
              >
                <ha-icon icon="mdi:play"></ha-icon>
                ${t(this.hass, "config_panel.scenarios_run_now")}
              </button>
              <button
                class="menu-item"
                .disabled=${this._busy}
                title=${t(this.hass, "config_panel.scenarios_run_ignore_help")}
                @click=${() => this._runNow(draft.id, true)}
              >
                <ha-icon icon="mdi:play-outline"></ha-icon>
                ${t(this.hass, "config_panel.scenarios_run_now_ignore")}
              </button>
              <p class="menu-note">
                ${t(this.hass, "config_panel.scenarios_run_saved_hint")}
              </p>
            </div>`
            : A}
      </div>
    `;
    }
    _renderDialog() {
        const draft = this._draft;
        if (!draft)
            return A;
        const coverNames = draft.assignments.map((a) => this._coverName(a.cover_item_id));
        return b `
      <div
        class="dialog-backdrop editor"
        @click=${(e) => {
            if (e.target === e.currentTarget)
                this._closeEditor();
        }}
      >
        <div
          class="dialog sticky"
          @click=${() => {
            if (!this._headMenuOpen)
                return;
            this._headMenuOpen = false;
            this.requestUpdate();
        }}
        >
          <div class="dialog-head">
            <input
              type="text"
              class="name-input ${this._error && !draft.name.trim() ? "invalid" : ""}"
              aria-label=${t(this.hass, "config_panel.scenarios_name_placeholder")}
              placeholder=${t(this.hass, "config_panel.scenarios_name_placeholder")}
              .value=${draft.name}
              @input=${(e) => {
            // Typing a name answers the "name required" error.
            this._error = undefined;
            this._patch({ name: e.target.value });
        }}
            />
            <label class="head-switch">
              <ha-switch
                .checked=${draft.enabled}
                @change=${(e) => this._patch({ enabled: e.target.checked })}
              ></ha-switch>
              <span>${t(this.hass, "config_panel.scenarios_enabled")}</span>
            </label>
            ${draft.id ? this._renderHeadMenu(draft) : A}
          </div>
          <div class="dialog-scroll">
            ${this._error ? b `<p class="error">${this._error}</p>` : A}
            ${this._warnings.map((w) => b `<p class="warning">
                <ha-icon icon="mdi:alert-outline" style="--mdc-icon-size:16px"></ha-icon>
                ${w}
              </p>`)}
            ${this._renderSection(draft, "when", summarizeWhen(this.hass, draft), "", () => this._renderWhenBody(draft))}
            ${this._renderSection(draft, "only_if", summarizeConditions(this.hass, draft.conditions), draft.conditions.length ? "" : "muted", () => this._renderOnlyIfBody(draft))}
            ${this._renderSection(draft, "then", summarizeThen(this.hass, draft), "", () => this._renderThenBody(draft))}
            ${this._renderSection(draft, "covers", summarizeCovers(this.hass, coverNames), coverNames.length ? "" : "warn", () => this._renderCoversBody(draft))}
          </div>
          <div class="dialog-foot">
            <button class="btn-outline" @click=${() => this._closeEditor()}>
              ${t(this.hass, "config_panel.cancel")}
            </button>
            <button class="btn" .disabled=${this._busy} @click=${this._save}>
              ${this._busy
            ? t(this.hass, "config_panel.saving")
            : t(this.hass, "config_panel.save")}
            </button>
          </div>
        </div>
      </div>
    `;
    }
    render() {
        const snap = this.snapshot;
        if (!snap)
            return A;
        return b `
      <ha-card>
        <div class="card-header">
          <ha-icon icon="mdi:script-text-outline"></ha-icon>
          ${t(this.hass, "config_panel.scenarios_title")}
          <span class="muted" style="font-weight:400">${snap.scenarios.length}</span>
          <span class="header-actions">
            <button class="btn" @click=${this._openAdd}>
              ${t(this.hass, "config_panel.scenarios_add")}
            </button>
          </span>
        </div>
        <div class="card-content">
          <p class="intro">${t(this.hass, "config_panel.scenarios_order_desc")}</p>
          ${renderHelp(this.hass, "priority")}
          ${this._error && !this._draft
            ? b `<p class="error">${this._error}</p>`
            : A}
          ${snap.scenarios.length
            ? snap.scenarios.map((s, i) => this._renderRow(s, i, snap.scenarios.length))
            : b `<div class="empty-state">
                <ha-icon icon="mdi:script-text-outline"></ha-icon>
                <p>${t(this.hass, "config_panel.scenarios_empty")}</p>
              </div>`}
        </div>
      </ha-card>
      ${this._renderDialog()}
    `;
    }
}
defineCustomElementOnce("ac-view-scenarios", ViewScenarios);

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
              ${opts.showTimeLabels
            ? b `<span class="tl-time">${ev.timeLabel}</span>`
            : A}
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
const timelineStyles = i$5 `
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

const EXPAND_KEY = "ac-today-expanded";
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
/** Per-result counts of a fired block's runs, in display order.

    Unknown result strings are appended verbatim so no outcome is ever
    silently dropped from the badge row. */
const COUNT_ORDER = [
    "executed",
    "armed",
    "skipped",
    "expired",
    "unavailable",
    "blocked_safety",
];
function occStatusCounts(occ) {
    const counts = new Map();
    for (const r of occ.assignments) {
        const kind = r.status === "armed" ? "armed" : (r.result ?? "skipped");
        counts.set(kind, (counts.get(kind) ?? 0) + 1);
    }
    const ordered = COUNT_ORDER.filter((k) => counts.has(k)).map((k) => [k, counts.get(k)]);
    for (const [k, n] of counts) {
        if (!COUNT_ORDER.includes(k))
            ordered.push([k, n]);
    }
    return ordered;
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
function occHasIssue(occ) {
    if (occ.fired) {
        return occ.assignments.some((r) => ["blocked_safety", "unavailable"].includes(r.result ?? ""));
    }
    if (occVerdict(occ) !== "would_run")
        return true;
    // Partially blocked blocks still deserve the issues filter.
    return occ.assignments.some((r) => r.preflight && r.preflight.verdict !== "would_run");
}
class ViewToday extends i$2 {
    static { this.properties = {
        hass: { attribute: false },
        entryId: { type: String },
        snapshot: { attribute: false },
    }; }
    constructor() {
        super();
        this._busy = false;
        this._filter = "all";
        this._expanded = new Set();
        try {
            const raw = sessionStorage.getItem(EXPAND_KEY);
            if (raw)
                this._expanded = new Set(JSON.parse(raw));
        }
        catch {
            /* ignore */
        }
    }
    static _occKey(occ) {
        return `${occ.scenario_id}@${occ.planned_at}`;
    }
    _isExpanded(occ) {
        const key = ViewToday._occKey(occ);
        if (this._expanded.has(`-${key}`))
            return false; // explicitly collapsed
        if (this._expanded.has(key))
            return true;
        // Blocks with problems auto-expand unless the user collapsed them.
        return !occ.fired && occHasIssue(occ);
    }
    _toggleOcc(occ) {
        const key = ViewToday._occKey(occ);
        const auto = !occ.fired && occHasIssue(occ);
        const open = this._isExpanded(occ);
        this._expanded.delete(key);
        this._expanded.delete(`-${key}`);
        if (open) {
            // collapse: for auto-expanded blocks store an explicit "-" marker
            if (auto)
                this._expanded.add(`-${key}`);
        }
        else {
            this._expanded.add(key);
        }
        try {
            sessionStorage.setItem(EXPAND_KEY, JSON.stringify([...this._expanded]));
        }
        catch {
            /* ignore */
        }
        this.requestUpdate();
    }
    static { this.styles = [
        sharedStyles,
        timelineStyles,
        i$5 `
      /* Status card: two-column head + Next up. */
      .status-grid {
        display: grid;
        grid-template-columns: 1fr minmax(280px, 0.9fr);
        gap: 20px;
        align-items: start;
      }
      .status-main {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .master {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1rem;
        font-weight: 500;
      }
      .summary {
        font-size: 0.85rem;
        color: var(--secondary-text-color);
      }
      .sun-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 18px;
        margin-top: 2px;
      }
      .sun-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85rem;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }
      .sun-item ha-icon {
        --mdc-icon-size: 18px;
        color: var(--warning-color, #f0b23a);
      }
      .status-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
      }
      /* Next up panel. */
      .nextup {
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        padding: 14px 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
      }
      .nextup-label {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--secondary-text-color);
        font-weight: 600;
        margin-bottom: 6px;
      }
      .nextup-time {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 4px;
      }
      .nextup-time .clock {
        font-size: 1.15rem;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .nextup-in {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
      }
      .nextup-name {
        font-size: 0.92rem;
        margin: 2px 0;
        text-wrap: pretty;
      }
      .nextup-detail {
        font-size: 0.82rem;
        color: var(--secondary-text-color);
      }
      /* Timeline legend. */
      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 14px;
        margin-left: auto;
        font-size: 0.74rem;
        color: var(--secondary-text-color);
        font-weight: 400;
      }
      .legend span {
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .legend .dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
      }
      .legend .dot.executed {
        background: var(--success-color, #43a047);
      }
      .legend .dot.will_run {
        background: var(--primary-color);
      }
      .legend .dot.would_skip {
        background: var(--warning-color, #f0b23a);
      }
      .legend .dot.skipped {
        background: var(--disabled-text-color, #6d7476);
      }
      .legend .dot.executed_partial {
        width: 11px;
        height: 11px;
        background: var(--success-color, #43a047);
        border: 2px solid var(--error-color, #d93025);
        box-sizing: border-box;
      }
      .legend .swatch-retry {
        width: 16px;
        height: 9px;
        border-radius: 3px;
        background: color-mix(in srgb, var(--warning-color, #f0b23a) 16%, transparent);
        border: 1px dashed
          color-mix(in srgb, var(--warning-color, #f0b23a) 55%, transparent);
        box-sizing: border-box;
      }
      /* Plan blocks. */
      .plan-toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 12px;
      }
      .block {
        border: 1px solid var(--divider-color);
        border-left: 3px solid var(--divider-color);
        border-radius: 10px;
        margin-bottom: 8px;
        overflow: hidden;
      }
      .block.would_skip,
      .block.armed {
        border-left-color: var(--warning-color, #f0b23a);
      }
      .block.would_run,
      .block.executed {
        border-left-color: var(--primary-color);
      }
      .block.blocked_safety,
      .block.unavailable {
        border-left-color: var(--error-color, #d93025);
      }
      /* Row: full-width clickable toggle + trailing icon buttons.
         The icon buttons are siblings of the toggle (never nested inside
         it) — a native <button> nested in a <button> is invalid HTML and
         the parser expels it onto its own line. */
      .block-head {
        display: flex;
        align-items: center;
        gap: 2px;
        padding-right: 6px;
      }
      .block-head:hover {
        background: color-mix(in srgb, var(--primary-color) 5%, transparent);
      }
      .block-toggle {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 0;
        padding: 8px 6px 8px 12px;
        cursor: pointer;
        background: none;
        border: none;
        text-align: left;
        font: inherit;
        color: inherit;
        box-sizing: border-box;
      }
      .block-time {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
      }
      .block-titles {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        flex: 1;
      }
      .block-line1 {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .block-name {
        font-weight: 500;
      }
      .block-offset {
        font-size: 0.76rem;
        color: var(--secondary-text-color);
      }
      .block-reason {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
      }
      .block-edit,
      .block-chevron-btn {
        flex-shrink: 0;
        width: 34px;
        height: 34px;
        border-radius: 8px;
      }
      .block-chevron {
        color: var(--secondary-text-color);
        --mdc-icon-size: 22px;
      }
      .block-body {
        padding: 0 14px 14px;
        border-top: 1px solid var(--divider-color);
      }
      .only-if {
        margin: 12px 0;
      }
      .only-if-label {
        font-size: 0.74rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
        font-weight: 600;
        margin-bottom: 4px;
      }
      .covers-summary {
        font-size: 0.82rem;
        color: var(--secondary-text-color);
        margin: 10px 0 8px;
      }
      .area-groups {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 8px 16px;
      }
      .area-group-title {
        font-size: 0.76rem;
        font-weight: 600;
        color: var(--secondary-text-color);
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 6px 0 2px;
      }
      .area-group-title .n {
        opacity: 0.7;
      }
      .cover-line {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
        padding: 3px 0;
      }
      .cover-line .cover-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
        background: var(--disabled-text-color, #6d7476);
      }
      .cover-line .cover-dot.would_run,
      .cover-line .cover-dot.executed {
        background: var(--primary-color);
      }
      .cover-line .cover-dot.would_skip,
      .cover-line .cover-dot.armed {
        background: var(--warning-color, #f0b23a);
      }
      .cover-line .cover-dot.blocked_safety,
      .cover-line .cover-dot.unavailable {
        background: var(--error-color, #d93025);
      }
      .cover-line .cover-badge {
        flex-shrink: 0;
      }
      .cover-reason {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-size: 0.78rem;
        color: var(--secondary-text-color);
        margin: 0 0 4px 16px;
      }
      .cover-reason.error {
        color: var(--error-color, #d93025);
      }
      .cover-reason ha-icon {
        --mdc-icon-size: 15px;
        margin-top: 1px;
        flex-shrink: 0;
      }
      .block-reason.error {
        color: var(--error-color, #d93025);
      }
      .cover-line .cover-fire-at {
        font-size: 0.78rem;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
      }
      .cover-line .cover-target {
        margin-left: auto;
        font-variant-numeric: tabular-nums;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }
      .cover-safety {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-size: 0.78rem;
        color: var(--error-color, #d93025);
        margin: 2px 0 4px 16px;
      }
      .cover-safety ha-icon {
        --mdc-icon-size: 15px;
        margin-top: 1px;
        flex-shrink: 0;
      }
      .show-all {
        font: inherit;
        font-size: 0.8rem;
        color: var(--primary-color);
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px 0;
      }

      @container acview (max-width: 900px) {
        .status-grid {
          grid-template-columns: 1fr;
        }
        .legend {
          margin-left: 0;
        }
        .area-groups {
          grid-template-columns: 1fr 1fr;
        }
      }
      @container acview (max-width: 620px) {
        .area-groups {
          grid-template-columns: 1fr;
        }
      }
    `,
    ]; }
    async _toggleMaster() {
        this._busy = true;
        this.requestUpdate();
        try {
            await saveConfig(this.hass, this.entryId, {
                enabled: !this.snapshot.config.enabled,
            });
        }
        catch (e) {
            this._error = formatApiError(e, this.hass);
        }
        finally {
            this._busy = false;
            this.requestUpdate();
        }
    }
    async _recalculate() {
        this._busy = true;
        this.requestUpdate();
        try {
            await recalculate(this.hass, this.entryId);
            this._error = undefined;
        }
        catch (e) {
            this._error = formatApiError(e, this.hass);
        }
        finally {
            this._busy = false;
            this.requestUpdate();
        }
    }
    _openScenario(scenarioId) {
        navigate(this, `${exportPath(this.entryId, "scenarios")}?editScenario=${scenarioId}`);
    }
    _scrollToBlock(occ) {
        const el = this.renderRoot.querySelector(`#block-${CSS.escape(ViewToday._occKey(occ))}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (!this._isExpanded(occ))
            this._toggleOcc(occ);
    }
    _areaName(areaId) {
        if (!areaId)
            return t(this.hass, "config_panel.covers_no_area");
        return this.hass.areas?.[areaId]?.name ?? areaId;
    }
    // ------------------------------------------------------------- status card
    _nextUp() {
        const nowMin = minutesOfDay(this.snapshot.now) ?? 0;
        const upcoming = this.snapshot.plan
            .filter((o) => !o.fired && (minutesOfDay(o.planned_at) ?? -1) >= nowMin)
            .sort((a, b) => (minutesOfDay(a.planned_at) ?? 0) - (minutesOfDay(b.planned_at) ?? 0));
        return upcoming[0] ?? null;
    }
    _renderStatusCard() {
        const snap = this.snapshot;
        const coverCount = snap.covers.length;
        const scenarioCount = snap.scenarios.length;
        const next = this._nextUp();
        return b `
      <ha-card>
        <div class="card-content">
          <div class="status-grid">
            <div class="status-main">
              <label class="master">
                <ha-switch
                  .checked=${snap.config.enabled}
                  .disabled=${this._busy}
                  @click=${this._toggleMaster}
                ></ha-switch>
                ${t(this.hass, "config_panel.today_master")}
              </label>
              <div class="summary">
                ${t(this.hass, "config_panel.today_summary", {
            scenarios: scenarioCount,
            covers: coverCount,
            time: formatTime(this._planRolledAt()),
        })}
              </div>
              <div class="sun-row">
                <span class="sun-item">
                  <ha-icon icon="mdi:weather-sunset-up"></ha-icon>
                  ${t(this.hass, "config_panel.today_sun_sunrise")}
                  ${formatTime(snap.sun.sunrise)}
                </span>
                <span class="sun-item">
                  <ha-icon icon="mdi:weather-sunset-down"></ha-icon>
                  ${t(this.hass, "config_panel.today_sun_sunset")}
                  ${formatTime(snap.sun.sunset)}
                </span>
                ${snap.sun.solar_noon
            ? b `<span class="sun-item">
                      <ha-icon icon="mdi:weather-sunny"></ha-icon>
                      ${t(this.hass, "config_panel.today_sun_noon")}
                      ${formatTime(snap.sun.solar_noon)}
                    </span>`
            : A}
              </div>
              <div class="status-actions">
                <button
                  type="button"
                  class="iconbtn"
                  aria-label=${t(this.hass, "config_panel.today_recalculate")}
                  title=${t(this.hass, "config_panel.today_recalculate")}
                  .disabled=${this._busy}
                  @click=${this._recalculate}
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
                <span class="muted">${t(this.hass, "config_panel.today_recalculate")}</span>
              </div>
              ${this._error ? b `<p class="error">${this._error}</p>` : A}
              ${!snap.config.enabled
            ? b `<p class="warning">
                    ${t(this.hass, "config_panel.today_master_off_hint")}
                  </p>`
            : A}
            </div>
            ${next ? this._renderNextUp(next) : A}
          </div>
        </div>
      </ha-card>
    `;
    }
    _planRolledAt() {
        // Plan is rebuilt at local midnight; use the earliest base_at's day start.
        const first = this.snapshot.plan[0];
        if (!first)
            return null;
        const d = new Date(first.base_at);
        if (Number.isNaN(d.getTime()))
            return null;
        d.setHours(0, 0, 0, 0);
        return d.toISOString();
    }
    _renderNextUp(occ) {
        const nowMin = minutesOfDay(this.snapshot.now) ?? 0;
        const occMin = minutesOfDay(occ.planned_at) ?? 0;
        const inMin = Math.max(0, occMin - nowMin);
        const targetPos = occ.assignments[0]?.target_position ?? 0;
        const reason = occPreflightReason(this.hass, occ);
        return b `
      <div class="nextup">
        <div class="nextup-label">${t(this.hass, "config_panel.today_next_up")}</div>
        <div class="nextup-time">
          <span class="clock">${formatTime(occ.planned_at)}</span>
          <span class="nextup-in"
            >${t(this.hass, "config_panel.today_in_min", { n: inMin })}</span
          >
          ${occPreflightBadge(this.hass, occ)}
        </div>
        <div class="nextup-name">${occ.scenario_name}</div>
        <div class="nextup-detail">
          ${t(this.hass, "config_panel.today_covers_target", {
            n: occ.assignments.length,
            pos: targetPos,
        })}${reason ? b ` · ${reason}` : A}
        </div>
      </div>
    `;
    }
    // ---------------------------------------------------------- timeline card
    _timelineEvents() {
        return this.snapshot.plan
            .map((occ) => {
            const m = minutesOfDay(occ.planned_at);
            if (m == null)
                return null;
            // Retry window: visualize when a not-yet-decided occurrence would
            // still re-try (upcoming blocks and blocks with armed runs).
            let spanEndMinute = null;
            if (occ.retry_until &&
                (!occ.fired || occ.assignments.some((r) => r.status === "armed"))) {
                const end = minutesOfDay(occ.retry_until);
                // A window past midnight clamps to the end of today's strip.
                spanEndMinute = end == null || end <= m ? 1440 : end;
            }
            return {
                id: ViewToday._occKey(occ),
                minute: m,
                colorClass: timelineClass(occ),
                label: `${formatTime(occ.planned_at)} · ${occ.scenario_name}`,
                timeLabel: formatTime(occ.planned_at),
                spanEndMinute,
                onClick: () => this._scrollToBlock(occ),
            };
        })
            .filter((e) => e !== null);
    }
    get _phone() {
        return this.renderRoot?.host?.clientWidth
            ? this.renderRoot.host.clientWidth < 620
            : window.innerWidth < 620;
    }
    _renderTimelineCard() {
        const snap = this.snapshot;
        const phone = this._phone;
        return b `
      <ha-card>
        <div class="card-header">
          <ha-icon icon="mdi:chart-timeline-variant"></ha-icon>
          ${t(this.hass, "config_panel.today_timeline")}
          <span class="legend">
            <span><span class="dot executed"></span>${t(this.hass, "config_panel.today_legend_executed")}</span>
            <span><span class="dot will_run"></span>${t(this.hass, "config_panel.today_legend_will_run")}</span>
            <span><span class="dot would_skip"></span>${t(this.hass, "config_panel.today_legend_would_skip")}</span>
            <span><span class="dot skipped"></span>${t(this.hass, "config_panel.today_legend_skipped")}</span>
            <span><span class="dot executed_partial"></span>${t(this.hass, "config_panel.today_legend_partial")}</span>
            <span><span class="swatch-retry"></span>${t(this.hass, "config_panel.today_legend_retry")}</span>
          </span>
        </div>
        <div class="card-content">
          ${snap.plan.length
            ? renderTimeline({
                events: this._timelineEvents(),
                sunriseMin: snap.sun.sunrise ? minutesOfDay(snap.sun.sunrise) : null,
                sunsetMin: snap.sun.sunset ? minutesOfDay(snap.sun.sunset) : null,
                nowMin: minutesOfDay(snap.now) ?? 0,
                showTimeLabels: !phone,
                axisEveryH: phone ? 4 : 2,
            })
            : b `<p class="muted">
                ${t(this.hass, "config_panel.today_empty_nothing_planned")}
              </p>`}
        </div>
      </ha-card>
    `;
    }
    // -------------------------------------------------------------- plan card
    _filteredPlan() {
        const nowMin = minutesOfDay(this.snapshot.now) ?? 0;
        return this.snapshot.plan.filter((occ) => {
            if (this._filter === "upcoming") {
                return !occ.fired && (minutesOfDay(occ.planned_at) ?? -1) >= nowMin;
            }
            if (this._filter === "issues")
                return occHasIssue(occ);
            return true;
        });
    }
    _renderBlockBody(occ) {
        const scenario = this.snapshot.scenarios.find((s) => s.id === occ.scenario_id);
        const blockedCount = occ.assignments.filter((r) => runKind(occ, r) === "blocked_safety" || r.result === "blocked_safety").length;
        // Group runs by area.
        const groups = new Map();
        for (const run of occ.assignments) {
            const key = run.area_id ?? null;
            (groups.get(key) ?? groups.set(key, []).get(key)).push(run);
        }
        const orderedGroups = [...groups.entries()].sort((a, b) => this._areaName(a[0]).localeCompare(this._areaName(b[0])));
        const conds = occ.preflight?.conditions ?? [];
        return b `
      <div class="block-body">
        ${!occ.fired && conds.length
            ? b `<div class="only-if">
              <div class="only-if-label">
                ${t(this.hass, "config_panel.preflight_only_if")}
              </div>
              ${renderCondChecklist(this.hass, conds)}
            </div>`
            : A}
        <div class="covers-summary">
          ${t(this.hass, "config_panel.today_covers_target", {
            n: occ.assignments.length,
            pos: scenario?.action.position ?? occ.assignments[0]?.target_position ?? 0,
        })}
          ${!occ.fired
            ? b ` ·
                ${t(this.hass, "config_panel.today_covers_split", {
                run: occ.covers_would_run,
                blocked: occ.assignments.length - occ.covers_would_run,
            })}`
            : blockedCount
                ? b ` ·
                  ${t(this.hass, "config_panel.today_covers_blocked", {
                    n: blockedCount,
                })}`
                : A}
        </div>
        <div class="area-groups">
          ${orderedGroups.map(([areaId, runs]) => b `
              <div>
                <div class="area-group-title">
                  <ha-icon icon="mdi:map-marker-outline" style="--mdc-icon-size:16px"></ha-icon>
                  ${this._areaName(areaId)}
                  <span class="n">${runs.length}</span>
                </div>
                ${runs.map((run) => this._renderCoverLine(occ, run))}
              </div>
            `)}
        </div>
      </div>
    `;
    }
    _renderCoverLine(occ, run) {
        const kind = runKind(occ, run);
        const safety = (run.preflight?.conditions ?? []).find((c) => c.scope === "safety" && c.ok === false);
        const cover = this.snapshot.covers.find((c) => c.id === run.cover_item_id);
        // After firing, a non-executed run explains itself inline — except for
        // everyday outcomes (trigger passed, already in position), where the
        // status badge alone is enough and a repeated hint per cover is noise.
        const severity = reasonSeverity(run.reason);
        // Before firing: the cover's own failing condition (a scenario condition
        // like "position above 5%" is checked per cover, so this is where it
        // belongs). After firing: the recorded reason.
        const pending = !occ.fired
            ? (run.preflight?.conditions ?? []).find((c) => c.scope !== "safety" && c.ok !== true)
            : undefined;
        const reason = pending
            ? condSummary(this.hass, pending)
            : occ.fired && run.result !== "executed" && severity !== "noise"
                ? formatReason(this.hass, run.reason)
                : null;
        const severe = ["unavailable", "blocked_safety"].includes(kind) || severity === "error";
        return b `
      <div class="cover-line">
        <span class="cover-dot ${kind}"></span>
        <span class="ellipsis">${run.cover_name}</span>
        ${occ.fired
            ? b `<span class="badge badge-${kind} cover-badge"
              >${t(this.hass, `config_panel.status_${kind}`)}</span
            >`
            : A}
        ${run.status === "armed" && run.fire_at
            ? b `<span class="cover-fire-at">≈ ${formatTime(run.fire_at)}</span>`
            : A}
        <span class="cover-target">${run.target_position}%</span>
      </div>
      ${reason
            ? b `<div class="cover-reason ${severe ? "error" : ""}">
            <ha-icon
              icon=${severe ? "mdi:alert-outline" : "mdi:information-outline"}
            ></ha-icon>
            <span>${reason}</span>
          </div>`
            : A}
      ${safety
            ? b `<div class="cover-safety">
            <ha-icon icon="mdi:alert-outline"></ha-icon>
            <span>
              ${cover?.name}:
              ${t(this.hass, "config_panel.cond_sum_safety", {
                ventilation: cover?.safety.ventilation_position ?? 20,
            })}
            </span>
          </div>`
            : A}
    `;
    }
    _renderBlock(occ) {
        const kind = occKind(occ);
        const expanded = this._isExpanded(occ);
        const reason = !occ.fired
            ? occPreflightReason(this.hass, occ)
            : occReasonSummary(this.hass, occ);
        return b `
      <div class="block ${kind}" id="block-${ViewToday._occKey(occ)}">
        <div class="block-head">
          <button
            type="button"
            class="block-toggle"
            aria-expanded=${expanded ? "true" : "false"}
            @click=${() => this._toggleOcc(occ)}
          >
            <span class="block-time">${formatTime(occ.planned_at)}</span>
            <span class="block-titles">
            <span class="block-line1">
              <span class="block-name ellipsis">${occ.scenario_name}</span>
              ${occ.random_offset_min
            ? b `<span class="block-offset"
                    >${t(this.hass, "config_panel.today_random_offset", {
                n: occ.random_offset_min,
            })}</span
                  >`
            : A}
              ${occ.fired
            ? this._renderResultBadge(occ)
            : occPreflightBadge(this.hass, occ)}
              ${occ.fired &&
            occ.assignments.some((r) => r.status === "armed") &&
            occ.retry_until
            ? b `<span class="block-offset"
                    >${t(this.hass, "config_panel.today_armed_until", {
                time: formatTime(occ.retry_until),
            })}</span
                  >`
            : A}
            </span>
              ${reason && !expanded
            ? b `<span
                    class="block-reason ${["unavailable", "blocked_safety"].includes(kind)
                ? "error"
                : ""}"
                    >${reason}</span
                  >`
            : A}
            </span>
          </button>
          <button
            type="button"
            class="iconbtn block-edit"
            aria-label=${t(this.hass, "config_panel.scenarios_edit")}
            title=${t(this.hass, "config_panel.scenarios_edit")}
            @click=${() => this._openScenario(occ.scenario_id)}
          >
            <ha-icon icon="mdi:pencil-outline"></ha-icon>
          </button>
          <button
            type="button"
            class="iconbtn block-chevron-btn"
            aria-expanded=${expanded ? "true" : "false"}
            aria-label=${t(this.hass, expanded
            ? "config_panel.today_collapse"
            : "config_panel.today_expand")}
            @click=${() => this._toggleOcc(occ)}
          >
            <ha-icon
              class="block-chevron"
              icon=${expanded ? "mdi:chevron-up" : "mdi:chevron-down"}
            ></ha-icon>
          </button>
        </div>
        ${expanded && occ.assignments.length ? this._renderBlockBody(occ) : A}
        ${expanded && !occ.assignments.length
            ? b `<div class="block-body">
              <p class="muted">${t(this.hass, "config_panel.today_no_assignments")}</p>
            </div>`
            : A}
      </div>
    `;
    }
    _renderResultBadge(occ) {
        const counts = occStatusCounts(occ);
        if (counts.length <= 1) {
            const kind = occKind(occ);
            return b `<span class="badge badge-${kind}"
        >${t(this.hass, `config_panel.status_${kind}`)}</span
      >`;
        }
        // Mixed outcomes: one count badge per result ("13× Executed · 1× Blocked").
        return counts.map(([kind, n]) => b `<span class="badge badge-${kind}"
        >${n}× ${t(this.hass, `config_panel.status_${kind}`)}</span
      >`);
    }
    _renderPlanCard() {
        const snap = this.snapshot;
        const issues = snap.plan.filter(occHasIssue).length;
        const filtered = this._filteredPlan();
        return b `
      <ha-card>
        <div class="card-header">
          <ha-icon icon="mdi:format-list-checks"></ha-icon>
          ${t(this.hass, "config_panel.today_plan_title")}
        </div>
        <div class="card-content">
          <div class="plan-toolbar">
            <div class="segmented">
              ${["all", "upcoming", "issues"].map((f) => b `
                  <button
                    type="button"
                    class=${this._filter === f ? "selected" : ""}
                    @click=${() => {
            this._filter = f;
            this.requestUpdate();
        }}
                  >
                    ${t(this.hass, `config_panel.today_filter_${f}`)}
                    ${f === "issues" && issues
            ? b `<span class="count">${issues}</span>`
            : A}
                  </button>
                `)}
            </div>
            ${renderHelp(this.hass, "today_statuses")}
          </div>
          <p class="intro">
            ${t(this.hass, "config_panel.today_plan_intro")}
            ${t(this.hass, "config_panel.preflight_evaluated_at", {
            time: formatTime(snap.now),
        })}
          </p>
          ${filtered.length
            ? filtered.map((occ) => this._renderBlock(occ))
            : b `<div class="empty-state">
                <ha-icon icon="mdi:calendar-blank-outline"></ha-icon>
                <p>
                  ${snap.scenarios.length
                ? t(this.hass, "config_panel.today_empty_nothing_planned")
                : t(this.hass, "config_panel.today_empty_no_scenarios")}
                </p>
              </div>`}
        </div>
      </ha-card>
    `;
    }
    render() {
        if (!this.snapshot)
            return A;
        return b `
      ${this._renderStatusCard()} ${this._renderTimelineCard()}
      ${this._renderPlanCard()}
    `;
    }
}
defineCustomElementOnce("ac-view-today", ViewToday);

const VERSION = "0.8.0";
const PANEL_PAGES = ["today", "covers", "scenarios", "log"];
const TAB_LABEL_KEYS = {
    today: "config_panel.tab_today",
    covers: "config_panel.tab_covers",
    scenarios: "config_panel.tab_scenarios",
    log: "config_panel.tab_log",
};
function normalizePage(raw) {
    const p = raw || "today";
    return PANEL_PAGES.includes(p) ? p : "today";
}
class AdvancedCoverPanel extends i$2 {
    constructor() {
        super(...arguments);
        this.narrow = false;
        this._snapshot = null;
        this._loading = true;
        this._entries = [];
        this._entriesLoading = false;
        this._initialPanelI18nDone = false;
        this._onVisibility = () => {
            if (document.visibilityState !== "visible")
                return;
            if (!window.location.pathname.includes("advanced-cover"))
                return;
            const { entryId } = getPath();
            if (entryId && this.hass) {
                void this._refreshOnce(entryId);
            }
        };
        this._locChanged = () => {
            if (!window.location.pathname.includes("advanced-cover"))
                return;
            void this._reloadPath();
        };
    }
    static { this.properties = {
        hass: { attribute: false },
        narrow: { type: Boolean, reflect: true },
        route: { attribute: false },
        panel: { attribute: false },
    }; }
    static { this.styles = panelStyles; }
    setProperties(props) {
        if (props.hass !== undefined) {
            const next = props.hass;
            if (this.hass?.language !== next?.language) {
                this._panelI18nLang = undefined;
            }
            this.hass = next;
            void this._ensurePanelI18n();
        }
        if (props.narrow !== undefined)
            this.narrow = Boolean(props.narrow);
        if (props.route !== undefined)
            this.route = props.route;
        if (props.panel !== undefined)
            this.panel = props.panel;
        this.requestUpdate();
    }
    async _ensurePanelI18n() {
        if (!this.hass)
            return;
        if (!this.hass.loadBackendTranslation) {
            this._markI18nDone();
            return;
        }
        const lang = this.hass.language ?? "en";
        if (this._panelI18nLang === lang) {
            this._markI18nDone();
            return;
        }
        try {
            await this.hass.loadBackendTranslation("config_panel", TRANSLATION_DOMAIN);
        }
        catch {
            /* localize may keep returning missing keys */
        }
        this._panelI18nLang = lang;
        this._markI18nDone();
    }
    _markI18nDone() {
        if (!this._initialPanelI18nDone) {
            this._initialPanelI18nDone = true;
        }
        this.requestUpdate();
    }
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener("location-changed", this._locChanged);
        document.addEventListener("visibilitychange", this._onVisibility);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("location-changed", this._locChanged);
        document.removeEventListener("visibilitychange", this._onVisibility);
        void this._teardownSubscription();
    }
    async _teardownSubscription() {
        if (this._unsub) {
            try {
                await this._unsub();
            }
            catch {
                /* ignore */
            }
            this._unsub = undefined;
        }
        this._subscribedEntryId = undefined;
    }
    async _refreshOnce(entryId) {
        if (!this.hass)
            return;
        try {
            this._snapshot = await fetchState(this.hass, entryId);
            this._error = undefined;
        }
        catch (e) {
            this._error = String(e);
        }
        this.requestUpdate();
    }
    async _ensureSubscription(entryId) {
        if (!this.hass || this._subscribedEntryId === entryId)
            return;
        await this._teardownSubscription();
        this._subscribedEntryId = entryId;
        try {
            const unsubPromise = subscribeState(this.hass, entryId, (snapshot) => {
                this._snapshot = snapshot;
                this._loading = false;
                this._error = undefined;
                this.requestUpdate();
            });
            if (unsubPromise) {
                this._unsub = await unsubPromise;
            }
            else {
                // No connection object: fall back to a one-shot fetch.
                await this._refreshOnce(entryId);
                this._loading = false;
            }
        }
        catch (e) {
            this._error = String(e);
            this._loading = false;
            this._subscribedEntryId = undefined;
        }
        this.requestUpdate();
    }
    async _reloadPath() {
        const { entryId } = getPath();
        if (!entryId) {
            await this._teardownSubscription();
            this._snapshot = null;
            await this._loadEntryList();
            /* A concurrent reload may have navigated to an entry meanwhile. */
            if (getPath().entryId) {
                this.requestUpdate();
                return;
            }
            if (this._entries.length === 1) {
                navigate(this, exportPath(this._entries[0].entry_id, "today"), true);
                return;
            }
            this._loading = false;
            this.requestUpdate();
            return;
        }
        this._loading = this._snapshot === null;
        this.requestUpdate();
        await this._ensureSubscription(entryId);
    }
    async _loadEntryList() {
        if (!this.hass)
            return;
        this._entriesLoading = true;
        this.requestUpdate();
        try {
            this._entries = await listEntries(this.hass);
            this._error = undefined;
        }
        catch (e) {
            this._error = String(e);
            this._entries = [];
        }
        finally {
            this._entriesLoading = false;
            this.requestUpdate();
        }
    }
    async firstUpdated() {
        await loadHaPanelElements();
        await this._ensurePanelI18n();
        if (this.hass) {
            await this._reloadPath();
        }
    }
    updated(changed) {
        if (!changed.has("hass") || !this.hass)
            return;
        const prev = changed.get("hass");
        if (prev === undefined || prev.connection !== this.hass.connection) {
            this._subscribedEntryId = undefined;
            void this._reloadPath();
        }
    }
    _onTab(ev) {
        const name = ev.detail?.name;
        const { entryId, page } = getPath();
        if (!name || !entryId || name === page)
            return;
        navigate(this, exportPath(entryId, name));
        this.requestUpdate();
    }
    render() {
        if (!this.hass || !this._initialPanelI18nDone) {
            return b `<div class="view"><div class="view-inner">Loading…</div></div>`;
        }
        const path = getPath();
        const page = normalizePage(path.page);
        if (!path.entryId) {
            return b `
        <div class="entry-picker">
          <h2>${t(this.hass, "config_panel.entry_picker_title")}</h2>
          <p class="lead">${t(this.hass, "config_panel.entry_picker_lead")}</p>
          ${this._error ? b `<p class="error">${this._error}</p>` : A}
          ${this._entriesLoading
                ? b `<p class="muted">${t(this.hass, "config_panel.loading")}</p>`
                : A}
          <div class="entry-cards">
            ${this._entries.map((e) => b `
                <button
                  type="button"
                  class="entry-card"
                  @click=${() => navigate(this, exportPath(e.entry_id, "today"))}
                >
                  <div class="entry-card-title">${e.name}</div>
                </button>
              `)}
          </div>
          ${!this._entries.length && !this._entriesLoading
                ? b `<p class="muted">
                ${t(this.hass, "config_panel.entry_picker_empty")}
              </p>`
                : A}
        </div>
      `;
        }
        if (this._loading || !this._snapshot) {
            return b `<div class="view">
        <div class="view-inner">
          ${this._error || t(this.hass, "config_panel.loading")}
        </div>
      </div>`;
        }
        return b `
      <div class="header">
        <div class="toolbar">
          <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
          <div class="main-title">${t(this.hass, "config_panel.main_title")}</div>
          <div class="version">v${VERSION}</div>
        </div>
        <ha-tab-group @wa-tab-show=${this._onTab}>
          ${PANEL_PAGES.map((p) => b `
              <ha-tab-group-tab slot="nav" panel=${p} .active=${page === p}>
                ${t(this.hass, TAB_LABEL_KEYS[p])}
              </ha-tab-group-tab>
            `)}
        </ha-tab-group>
      </div>
      <div class="view">
        <div class="view-inner">
          ${page === "today"
            ? b `<ac-view-today
                .hass=${this.hass}
                .entryId=${path.entryId}
                .snapshot=${this._snapshot}
              ></ac-view-today>`
            : A}
          ${page === "covers"
            ? b `<ac-view-covers
                .hass=${this.hass}
                .entryId=${path.entryId}
                .snapshot=${this._snapshot}
              ></ac-view-covers>`
            : A}
          ${page === "scenarios"
            ? b `<ac-view-scenarios
                .hass=${this.hass}
                .entryId=${path.entryId}
                .snapshot=${this._snapshot}
                .editScenarioId=${getEditScenarioQuery() ?? undefined}
              ></ac-view-scenarios>`
            : A}
          ${page === "log"
            ? b `<ac-view-log
                .hass=${this.hass}
                .entryId=${path.entryId}
                .snapshot=${this._snapshot}
              ></ac-view-log>`
            : A}
        </div>
      </div>
    `;
    }
}
defineCustomElementOnce("advanced-cover-panel", AdvancedCoverPanel);

export { AdvancedCoverPanel };
//# sourceMappingURL=advanced-cover-panel.js.map
