var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=/* @__PURE__ */ new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:f,getOwnPropertySymbols:p,getPrototypeOf:m}=Object,h=globalThis,ee=h.trustedTypes,te=ee?ee.emptyScript:``,ne=h.reactiveElementPolyfillSupport,g=(e,t)=>e,_={toAttribute(e,t){switch(t){case Boolean:e=e?te:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},v=(e,t)=>!l(e,t),re={attribute:!0,type:String,converter:_,reflect:!1,useDefault:!1,hasChanged:v};Symbol.metadata??=Symbol(`metadata`),h.litPropertyMetadata??=/* @__PURE__ */ new WeakMap;var y=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=re){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??re}static _$Ei(){if(this.hasOwnProperty(g(`elementProperties`)))return;let e=m(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(g(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(g(`properties`))){let e=this.properties,t=[...f(e),...p(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=/* @__PURE__ */ new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=/* @__PURE__ */ new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=/* @__PURE__ */ new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=/* @__PURE__ */ new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?_:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?_:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??v)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=/* @__PURE__ */ new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=/* @__PURE__ */ new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=/* @__PURE__ */ new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};y.elementStyles=[],y.shadowRootOptions={mode:`open`},y[g(`elementProperties`)]=/* @__PURE__ */ new Map,y[g(`finalized`)]=/* @__PURE__ */ new Map,ne?.({ReactiveElement:y}),(h.reactiveElementVersions??=[]).push(`2.1.2`);var ie=globalThis,ae=e=>e,b=ie.trustedTypes,oe=b?b.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,se=`$lit$`,x=`lit$${Math.random().toFixed(9).slice(2)}$`,ce=`?`+x,le=`<${ce}>`,S=document,ue=()=>S.createComment(``),de=e=>e===null||typeof e!=`object`&&typeof e!=`function`,fe=Array.isArray,pe=e=>fe(e)||typeof e?.[Symbol.iterator]==`function`,me=`[ 	
\f\r]`,he=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ge=/-->/g,_e=/>/g,C=RegExp(`>|${me}(?:([^\\s"'>=/]+)(${me}*=${me}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),ve=/'/g,ye=/"/g,be=/^(?:script|style|textarea|title)$/i,xe=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),w=xe(1),T=xe(2),E=Symbol.for(`lit-noChange`),D=Symbol.for(`lit-nothing`),Se=/* @__PURE__ */ new WeakMap,O=S.createTreeWalker(S,129);function Ce(e,t){if(!fe(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return oe===void 0?t:oe.createHTML(t)}var we=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=he;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===he?c[1]===`!--`?o=ge:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=C):(be.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=C):o=_e:o===C?c[0]===`>`?(o=i??he,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?C:c[3]===`"`?ye:ve):o===ye||o===ve?o=C:o===ge||o===_e?o=he:(o=C,i=void 0);let d=o===C&&e[t+1].startsWith(`/>`)?` `:``;a+=o===he?n+le:l>=0?(r.push(s),n.slice(0,l)+se+n.slice(l)+x+d):n+x+(l===-2?t:d)}return[Ce(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},Te=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=we(t,n);if(this.el=e.createElement(l,r),O.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=O.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(se)){let t=u[o++],n=i.getAttribute(e).split(x),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?ke:r[1]===`?`?Ae:r[1]===`@`?je:Oe}),i.removeAttribute(e)}else e.startsWith(x)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(be.test(i.tagName)){let e=i.textContent.split(x),t=e.length-1;if(t>0){i.textContent=b?b.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],ue()),O.nextNode(),c.push({type:2,index:++a});i.append(e[t],ue())}}}else if(i.nodeType===8){if(i.data===ce)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(x,e+1))!==-1;)c.push({type:7,index:a}),e+=x.length-1}}a++}}static createElement(e,t){let n=S.createElement(`template`);return n.innerHTML=e,n}};function k(e,t,n=e,r){if(t===E)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=de(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=k(e,i._$AS(e,t.values),i,r)),t}var Ee=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??S).importNode(t,!0);O.currentNode=r;let i=O.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new De(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Me(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=O.nextNode(),a++)}return O.currentNode=S,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},De=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=D,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=k(this,e,t),de(e)?e===D||e==null||e===``?(this._$AH!==D&&this._$AR(),this._$AH=D):e!==this._$AH&&e!==E&&this._(e):e._$litType$===void 0?e.nodeType===void 0?pe(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==D&&de(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=Te.createElement(Ce(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new Ee(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=Se.get(e.strings);return t===void 0&&Se.set(e.strings,t=new Te(e)),t}k(t){fe(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(ue()),this.O(ue()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=ae(e).nextSibling;ae(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Oe=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=D,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(/* @__PURE__ */ new String),this.strings=n):this._$AH=D}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=k(this,e,t,0),a=!de(e)||e!==this._$AH&&e!==E,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=k(this,r[n+o],t,o),s===E&&(s=this._$AH[o]),a||=!de(s)||s!==this._$AH[o],s===D?e=D:e!==D&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===D?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},ke=class extends Oe{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===D?void 0:e}},Ae=class extends Oe{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==D)}},je=class extends Oe{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=k(this,e,t,0)??D)===E)return;let n=this._$AH,r=e===D&&n!==D||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==D&&(n===D||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Me=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){k(this,e)}},Ne={M:se,P:x,A:ce,C:1,L:we,R:Ee,D:pe,V:k,I:De,H:Oe,N:Ae,U:je,B:ke,F:Me},Pe=ie.litHtmlPolyfillSupport;Pe?.(Te,De),(ie.litHtmlVersions??=[]).push(`3.3.3`);var Fe=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new De(t.insertBefore(ue(),e),e,void 0,n??{})}return i._$AI(e),i},Ie=globalThis,A=class extends y{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Fe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return E}};A._$litElement$=!0,A.finalized=!0,Ie.litElementHydrateSupport?.({LitElement:A});var Le=Ie.litElementPolyfillSupport;Le?.({LitElement:A}),(Ie.litElementVersions??=[]).push(`4.2.2`);var Re={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},ze=e=>(...t)=>({_$litDirective$:e,values:t}),Be=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},{I:Ve}=Ne,He=e=>e,Ue=()=>document.createComment(``),We=(e,t,n)=>{let r=e._$AA.parentNode,i=t===void 0?e._$AB:t._$AA;if(n===void 0)n=new Ve(r.insertBefore(Ue(),i),r.insertBefore(Ue(),i),e,e.options);else{let t=n._$AB.nextSibling,a=n._$AM,o=a!==e;if(o){let t;n._$AQ?.(e),n._$AM=e,n._$AP!==void 0&&(t=e._$AU)!==a._$AU&&n._$AP(t)}if(t!==i||o){let e=n._$AA;for(;e!==t;){let t=He(e).nextSibling;He(r).insertBefore(e,i),e=t}}}return n},j=(e,t,n=e)=>(e._$AI(t,n),e),Ge={},Ke=(e,t=Ge)=>e._$AH=t,qe=e=>e._$AH,Je=e=>{e._$AR(),e._$AA.remove()},Ye=(e,t,n)=>{let r=/* @__PURE__ */ new Map;for(let i=t;i<=n;i++)r.set(e[i],i);return r},M=ze(class extends Be{constructor(e){if(super(e),e.type!==Re.CHILD)throw Error(`repeat() can only be used in text expressions`)}dt(e,t,n){let r;n===void 0?n=t:t!==void 0&&(r=t);let i=[],a=[],o=0;for(let t of e)i[o]=r?r(t,o):o,a[o]=n(t,o),o++;return{values:a,keys:i}}render(e,t,n){return this.dt(e,t,n).values}update(e,[t,n,r]){let i=qe(e),{values:a,keys:o}=this.dt(t,n,r);if(!Array.isArray(i))return this.ut=o,a;let s=this.ut??=[],c=[],l,u,d=0,f=i.length-1,p=0,m=a.length-1;for(;d<=f&&p<=m;)if(i[d]===null)d++;else if(i[f]===null)f--;else if(s[d]===o[p])c[p]=j(i[d],a[p]),d++,p++;else if(s[f]===o[m])c[m]=j(i[f],a[m]),f--,m--;else if(s[d]===o[m])c[m]=j(i[d],a[m]),We(e,c[m+1],i[d]),d++,m--;else if(s[f]===o[p])c[p]=j(i[f],a[p]),We(e,i[d],i[f]),f--,p++;else if(l===void 0&&(l=Ye(o,p,m),u=Ye(s,d,f)),l.has(s[d])){if(l.has(s[f])){let t=u.get(o[p]),n=t===void 0?null:i[t];if(n===null){let t=We(e,i[d]);j(t,a[p]),c[p]=t}else c[p]=j(n,a[p]),We(e,i[d],n),i[t]=null;p++}else Je(i[f]),f--}else Je(i[d]),d++;for(;p<=m;){let t=We(e,c[m+1]);j(t,a[p]),c[p++]=t}for(;d<=f;){let e=i[d++];e!==null&&Je(e)}return this.ut=o,Ke(e,c),E}}),Xe=1e-9,Ze=(e,t)=>({x:e.x+t.x,y:e.y+t.y}),N=(e,t)=>({x:e.x-t.x,y:e.y-t.y}),P=(e,t)=>Math.hypot(e.x-t.x,e.y-t.y);function Qe(e,t,n){let r=n.x-t.x,i=n.y-t.y,a=r*r+i*i,o=a<Xe?0:Math.max(0,Math.min(1,((e.x-t.x)*r+(e.y-t.y)*i)/a));return{x:t.x+o*r,y:t.y+o*i,t:o}}function $e(e,t,n){return P(e,Qe(e,t,n))}function et(e,t){let n=!1;for(let r=0,i=t.length-1;r<t.length;i=r++){let a=t[r],o=t[i];a.y>e.y!=o.y>e.y&&e.x<(o.x-a.x)*(e.y-a.y)/(o.y-a.y)+a.x&&(n=!n)}return n}function tt(e){let t=0;for(let n=0,r=e.length-1;n<e.length;r=n++)t+=(e[r].x+e[n].x)*(e[r].y-e[n].y);return Math.abs(t)/2}function nt(e){let t=0,n=0;for(let r of e)t+=r.x,n+=r.y;return{x:t/e.length,y:n/e.length}}function rt(e){if(!e.length)return null;let t=1/0,n=1/0,r=-1/0,i=-1/0;for(let a of e)a.x<t&&(t=a.x),a.y<n&&(n=a.y),a.x>r&&(r=a.x),a.y>i&&(i=a.y);return{minX:t,minY:n,maxX:r,maxY:i}}function it(e,t){return e?t?{minX:Math.min(e.minX,t.minX),minY:Math.min(e.minY,t.minY),maxX:Math.max(e.maxX,t.maxX),maxY:Math.max(e.maxY,t.maxY)}:e:t}var F={drywall:{id:`drywall`,db:3,wall:!0,color:`#b8bcc6`,pattern:`solid`},wood:{id:`wood`,db:4,wall:!0,color:`#b98a5a`,pattern:`solid`},glass:{id:`glass`,db:3,wall:!0,color:`#7cc4e4`,pattern:`glass`},glass_lowe:{id:`glass_lowe`,db:15,wall:!0,color:`#4f8fb3`,pattern:`glass`},brick:{id:`brick`,db:8,wall:!0,color:`#c0634a`,pattern:`hatch`},block:{id:`block`,db:11,wall:!0,color:`#9a8f84`,pattern:`hatch`},concrete:{id:`concrete`,db:15,wall:!0,color:`#7d838c`,pattern:`dense`},reinforced:{id:`reinforced`,db:22,wall:!0,color:`#555b66`,pattern:`dense`},metal:{id:`metal`,db:30,wall:!0,color:`#3d4450`,pattern:`dense`},slab_wood:{id:`slab_wood`,db:8,wall:!1,color:`#b98a5a`,pattern:`solid`},slab_concrete:{id:`slab_concrete`,db:20,wall:!1,color:`#7d838c`,pattern:`dense`}},at=Object.values(F).filter(e=>e.wall),ot=Object.values(F).filter(e=>!e.wall);function st(e,t){return e.materials[t]??F[t]?.db??0}function ct(e){return typeof e==`string`&&e in F}var I={pathLossExponent:2.2,refLoss1m:40,rxSensitivity:-100,defaultTx:{Coordinator:5,Router:5,EndDevice:3},materials:{},autoCalibrate:!0};function lt(e,t){return t===`Unknown`?e.defaultTx.EndDevice:e.defaultTx[t]}var ut=2.7,dt=.15,L=1e-6;function R(){let e=/* @__PURE__ */ new Uint8Array(6);return crypto.getRandomValues(e),Array.from(e,e=>e.toString(16).padStart(2,`0`)).join(``)}function ft(){return{version:1,buildings:[],floors:[],placements:{},settings:mt(I)}}var z=[`#7c3aed`,`#0284c7`,`#0d9488`,`#d97706`,`#db2777`,`#4f46e5`,`#65a30d`,`#dc2626`],pt=5;function mt(e){return{...e,defaultTx:{...e.defaultTx},materials:{...e.materials}}}var ht=e=>[...e].sort((e,t)=>e.level-t.level);function B(e,t,n){return{...e,floors:e.floors.map(e=>e.id===t?n(e):e)}}function V(e,t){return e.floors.find(e=>e.id===t)}function gt(e,t){return e.buildings.find(e=>e.id===t)}function H(e,t){return e.floors.filter(e=>e.buildingId===t)}function _t(e,t){return rt([...t.walls.flatMap(e=>[e.a,e.b]),...t.rooms.flatMap(e=>e.points),...Object.values(e.placements).filter(e=>e.floorId===t.id)])}function vt(e,t){let n=null;for(let r of H(e,t))n=it(n,_t(e,r));return n}function yt(e,t){return e.buildings.filter(e=>e.visible).map(n=>H(e,n.id).find(e=>e.level===t)).filter(e=>!!e)}function bt(e){let t=new Set(e.buildings.filter(e=>e.visible).map(e=>e.id));return[...new Set(e.floors.filter(e=>t.has(e.buildingId)).map(e=>e.level))].sort((e,t)=>e-t)}function xt(e,t){let n=0,r=0;for(let t of e.buildings){let i=vt(e,t.id);n=Math.max(n,t.x+(i?i.maxX:0)+pt),r=Math.min(r,t.y+(i?i.minY:0))}let i={id:R(),name:t,color:z[e.buildings.length%z.length],x:e.buildings.length?Jt(n):0,y:e.buildings.length?Jt(r):0,visible:!0};return{project:{...e,buildings:[...e.buildings,i]},buildingId:i.id}}function St(e,t,n){return{...e,buildings:e.buildings.map(e=>e.id===t?{...e,...n}:e)}}function Ct(e,t){let n=new Set(H(e,t).map(e=>e.id)),r=Object.fromEntries(Object.entries(e.placements).filter(([,e])=>!n.has(e.floorId)));return{...e,buildings:e.buildings.filter(e=>e.id!==t),floors:e.floors.filter(e=>!n.has(e.id)),placements:r}}function wt(e,t,n){let r=H(e,n),i=r[r.length-1],a={id:R(),buildingId:n,name:t,level:i?i.level+1:0,elevation:i?Jt(i.elevation+i.height):0,height:ut,slab:`slab_concrete`,walls:[],rooms:[]};return{project:{...e,floors:ht([...e.floors,a])},floorId:a.id}}function Tt(e,t,n){let r=B(e,t,e=>({...e,...n}));return{...r,floors:ht(r.floors)}}function Et(e,t){let n=Object.fromEntries(Object.entries(e.placements).filter(([,e])=>e.floorId!==t));return{...e,floors:e.floors.filter(e=>e.id!==t),placements:n}}function Dt(e,t){let n=V(e,t);if(!n)return{project:e,floorId:t};let r=H(e,n.buildingId),i=r[r.length-1],a={...n,id:R(),name:`${n.name} (2)`,level:i.level+1,elevation:Jt(i.elevation+i.height),walls:n.walls.map(e=>({...e,id:R()})),rooms:n.rooms.map(e=>({...e,id:R(),points:e.points.map(e=>({...e}))}))};return{project:{...e,floors:ht([...e.floors,a])},floorId:a.id}}function Ot(e,t,n){return B(e,t,e=>{let t={...e};return n?t.background=n:delete t.background,t})}function kt(e,t,n){let r=n.filter(e=>P(e.a,e.b)>L).map(e=>({...e,id:R()}));return{project:B(e,t,e=>({...e,walls:[...e.walls,...r]})),ids:r.map(e=>e.id)}}function At(e,t,n,r){let i=new Set(n);return B(e,t,e=>({...e,walls:e.walls.map(e=>i.has(e.id)?{...e,...r}:e)}))}function jt(e,t,n,r){let i={id:R(),name:n,points:r.map(e=>({...e}))};return{project:B(e,t,e=>({...e,rooms:[...e.rooms,i]})),id:i.id}}function Mt(e,t,n,r){return B(e,t,e=>({...e,rooms:e.rooms.map(e=>e.id===n?{...e,...r}:e)}))}function Nt(e,t,n){let r=new Set(n);return B(e,t,e=>({...e,walls:e.walls.filter(e=>!r.has(e.id)),rooms:e.rooms.filter(e=>!r.has(e.id))}))}function Pt(e,t,n,r){let i=new Set(n);return B(e,t,e=>{let t=e.walls.filter(e=>i.has(e.id)).flatMap(e=>[e.a,e.b]),n=e=>t.some(t=>P(t,e)<L);return{...e,walls:e.walls.map(e=>{if(i.has(e.id))return{...e,a:Ze(e.a,r),b:Ze(e.b,r)};let t=n(e.a),a=n(e.b);return!t&&!a?e:{...e,a:t?Ze(e.a,r):e.a,b:a?Ze(e.b,r):e.b}}),rooms:e.rooms.map(e=>i.has(e.id)?{...e,points:e.points.map(e=>Ze(e,r))}:e)}})}function Ft(e,t,n,r){return B(e,t,e=>{if(n.kind===`room`)return{...e,rooms:e.rooms.map(e=>e.id===n.id?{...e,points:e.points.map((e,t)=>t===n.index?{...r}:e)}:e)};let t=e.walls.find(e=>e.id===n.id);if(!t)return e;let i=t[n.end];return{...e,walls:e.walls.map(e=>({...e,a:P(e.a,i)<L?{...r}:e.a,b:P(e.b,i)<L?{...r}:e.b})).filter(e=>P(e.a,e.b)>L)}})}function It(e,t,n){return{...e,placements:{...e.placements,[t]:n}}}function Lt(e,t,n){let r=e.placements[t];return r?It(e,t,{...r,...n}):e}function Rt(e,t){let n={...e.placements};return delete n[t],{...e,placements:n}}function zt(e,t){return{...e,settings:{...e.settings,...t}}}var U=(e,t)=>typeof e==`number`&&Number.isFinite(e)?e:t,Bt=e=>!!e&&typeof e==`object`&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&typeof e.x==`number`&&typeof e.y==`number`,W=(e,t)=>typeof e==`string`&&e?e:t,G=e=>e&&typeof e==`object`&&!Array.isArray(e)?e:{};function Vt(e){let t=G(e);return!Bt(t.a)||!Bt(t.b)||P(t.a,t.b)<=L?null:{id:W(t.id,R()),a:{x:t.a.x,y:t.a.y},b:{x:t.b.x,y:t.b.y},thickness:Math.max(.02,U(t.thickness,dt)),material:ct(t.material)?t.material:`drywall`}}function Ht(e){let t=G(e),n=Array.isArray(t.points)?t.points.filter(Bt).map(e=>({x:e.x,y:e.y})):[];return n.length<3?null:{id:W(t.id,R()),name:W(t.name,``),points:n}}function Ut(e){let t=G(e);if(typeof t.imageId==`string`&&/^[0-9a-f]{32}$/.test(t.imageId)&&U(t.width,0)>0&&U(t.height,0)>0)return{imageId:t.imageId,width:U(t.width,0),height:U(t.height,0),x:U(t.x,0),y:U(t.y,0),scale:U(t.scale,.01)>0?U(t.scale,.01):.01,rotation:U(t.rotation,0),opacity:Math.min(1,Math.max(0,U(t.opacity,.5))),visible:t.visible!==!1}}function Wt(e,t){let n=G(e);if(typeof n.id!=`string`||!n.id)return null;let r=U(n.level,t),i={id:n.id,buildingId:W(n.buildingId,``),name:W(n.name,`Floor ${t+1}`),level:r,elevation:U(n.elevation,r*ut),height:Math.max(1,U(n.height,ut)),slab:ct(n.slab)?n.slab:`slab_concrete`,walls:Array.isArray(n.walls)?n.walls.map(Vt).filter(e=>!!e):[],rooms:Array.isArray(n.rooms)?n.rooms.map(Ht).filter(e=>!!e):[]},a=Ut(n.background);return a&&(i.background=a),i}var Gt=`main`;function Kt(e,t){let n=G(e);return typeof n.id!=`string`||!n.id?null:{id:n.id,name:W(n.name,`Building ${t+1}`),color:typeof n.color==`string`&&/^#[0-9a-f]{6}$/i.test(n.color)?n.color:z[t%z.length],x:U(n.x,0),y:U(n.y,0),visible:n.visible!==!1}}function qt(e,t={}){let n=G(e),r=(Array.isArray(n.buildings)?n.buildings:[]).map(Kt).filter(e=>!!e).filter((e,t,n)=>n.findIndex(t=>t.id===e.id)===t),i=ht((Array.isArray(n.floors)?n.floors:[]).map(Wt).filter(e=>!!e)),a=new Set(r.map(e=>e.id)),o=i.filter(e=>!a.has(e.buildingId));if(o.length){let e=r[0];e||(e={id:Gt,name:t.defaultBuildingName??`Building 1`,color:z[0],x:0,y:0,visible:!0},r.push(e));for(let t of o)t.buildingId=e.id}let s=new Set(i.map(e=>e.id)),c={};for(let[e,t]of Object.entries(G(n.placements))){let n=G(t);if(typeof n.floorId!=`string`||!s.has(n.floorId)||!Number.isFinite(n.x)||!Number.isFinite(n.y))continue;let r={floorId:n.floorId,x:n.x,y:n.y,height:U(n.height,1)};typeof n.txPower==`number`&&Number.isFinite(n.txPower)&&(r.txPower=n.txPower),c[e]=r}let l=G(n.settings);return{version:1,buildings:r,floors:i,placements:c,settings:{pathLossExponent:U(l.pathLossExponent,I.pathLossExponent),refLoss1m:U(l.refLoss1m,I.refLoss1m),rxSensitivity:U(l.rxSensitivity,I.rxSensitivity),defaultTx:{Coordinator:U(G(l.defaultTx).Coordinator,I.defaultTx.Coordinator),Router:U(G(l.defaultTx).Router,I.defaultTx.Router),EndDevice:U(G(l.defaultTx).EndDevice,I.defaultTx.EndDevice)},materials:Object.fromEntries(Object.entries(G(l.materials)).filter(([e,t])=>ct(e)&&typeof t==`number`&&Number.isFinite(t))),autoCalibrate:l.autoCalibrate!==!1}}}var Jt=e=>Math.round(e*1e3)/1e3,Yt=[{id:`excellent`,min:-65,color:`#16a34a`},{id:`good`,min:-75,color:`#65a30d`},{id:`fair`,min:-85,color:`#ca8a04`},{id:`weak`,min:-95,color:`#ea580c`},{id:`none`,min:-1/0,color:`#dc2626`}];function Xt(e){return(Yt.find(t=>e>=t.min)??Yt[Yt.length-1]).id}var Zt=`M4.93,4.93C3.12,6.74 2,9.24 2,12C2,14.76 3.12,17.26 4.93,19.07L6.34,17.66C4.89,16.22 4,14.22 4,12C4,9.79 4.89,7.78 6.34,6.34L4.93,4.93M19.07,4.93L17.66,6.34C19.11,7.78 20,9.79 20,12C20,14.22 19.11,16.22 17.66,17.66L19.07,19.07C20.88,17.26 22,14.76 22,12C22,9.24 20.88,6.74 19.07,4.93M7.76,7.76C6.67,8.85 6,10.35 6,12C6,13.65 6.67,15.15 7.76,16.24L9.17,14.83C8.45,14.11 8,13.11 8,12C8,10.89 8.45,9.89 9.17,9.17L7.76,7.76M16.24,7.76L14.83,9.17C15.55,9.89 16,10.89 16,12C16,13.11 15.55,14.11 14.83,14.83L16.24,16.24C17.33,15.15 18,13.65 18,12C18,10.35 17.33,8.85 16.24,7.76M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z`,Qt=`M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z`,$t=`M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16`,en=`M14 20H6V6H14M14.67 4H13V2H7V4H5.33C4.6 4 4 4.6 4 5.33V20.67C4 21.4 4.6 22 5.33 22H14.67C15.4 22 16 21.4 16 20.67V5.33C16 4.6 15.4 4 14.67 4M21 7H19V13H21V8M21 15H19V17H21V15Z`,tn=`M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z`,nn=`M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z`,rn=`M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z`,an=`M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z`,on=`M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z`,sn=`M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20H13Q12.18 20 11.59 19.41 11 18.83 11 18V12.85L9.4 14.4L8 13L12 9L16 13L14.6 14.4L13 12.85V18H18.5Q19.55 18 20.27 17.27 21 16.55 21 15.5 21 14.45 20.27 13.73 19.55 13 18.5 13H17V11Q17 8.93 15.54 7.46 14.08 6 12 6 9.93 6 8.46 7.46 7 8.93 7 11H6.5Q5.05 11 4.03 12.03 3 13.05 3 14.5 3 15.95 4.03 17 5.05 18 6.5 18H9V20M12 13Z`,cn=`M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z`,ln=`M10.07,14.27C10.57,14.03 11.16,14.25 11.4,14.75L13.7,19.74L15.5,18.89L13.19,13.91C12.95,13.41 13.17,12.81 13.67,12.58L13.95,12.5L16.25,12.05L8,5.12V15.9L9.82,14.43L10.07,14.27M13.64,21.97C13.14,22.21 12.54,22 12.31,21.5L10.13,16.76L7.62,18.78C7.45,18.92 7.24,19 7,19A1,1 0 0,1 6,18V3A1,1 0 0,1 7,2C7.24,2 7.47,2.09 7.64,2.23L7.65,2.22L19.14,11.86C19.57,12.22 19.62,12.85 19.27,13.27C19.12,13.45 18.91,13.57 18.7,13.61L15.54,14.23L17.74,18.96C18,19.46 17.76,20.05 17.26,20.28L13.64,21.97Z`,un=`M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z`,dn=`M3 6H21V4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H7V18H3V6M13 12H9V13.78C8.39 14.33 8 15.11 8 16C8 16.89 8.39 17.67 9 18.22V20H13V18.22C13.61 17.67 14 16.88 14 16S13.61 14.33 13 13.78V12M11 17.5C10.17 17.5 9.5 16.83 9.5 16S10.17 14.5 11 14.5 12.5 15.17 12.5 16 11.83 17.5 11 17.5M22 8H16C15.5 8 15 8.5 15 9V19C15 19.5 15.5 20 16 20H22C22.5 20 23 19.5 23 19V9C23 8.5 22.5 8 22 8M21 18H17V10H21V18Z`,fn=`M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z`,pn=`M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z`,mn=`M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z`,hn=`M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z`,gn=`M17 4H20C21.1 4 22 4.9 22 6V8H20V6H17V4M4 8V6H7V4H4C2.9 4 2 4.9 2 6V8H4M20 16V18H17V20H20C21.1 20 22 19.1 22 18V16H20M7 18H4V16H2V18C2 19.1 2.9 20 4 20H7V18M16 10V14H8V10H16M18 8H6V16H18V8Z`,_n=`M10,5V10H9V5H5V13H9V12H10V17H9V14H5V19H12V17H13V19H19V17H21V21H3V3H21V15H19V10H13V15H12V9H19V5H10Z`,vn=`M21 7C21 5.62 19.88 4.5 18.5 4.5C18.33 4.5 18.16 4.5 18 4.55V4C18 2.62 16.88 1.5 15.5 1.5C15.27 1.5 15.04 1.53 14.83 1.59C14.46 .66 13.56 0 12.5 0C11.27 0 10.25 .89 10.04 2.06C9.87 2 9.69 2 9.5 2C8.12 2 7 3.12 7 4.5V10.39C6.66 10.08 6.24 9.85 5.78 9.73L5 9.5C4.18 9.29 3.31 9.61 2.82 10.35C2.44 10.92 2.42 11.66 2.67 12.3L5.23 18.73C6.5 21.91 9.57 24 13 24C17.42 24 21 20.42 21 16V7M19 16C19 19.31 16.31 22 13 22C10.39 22 8.05 20.41 7.09 18L4.5 11.45L5 11.59C5.5 11.71 5.85 12.05 6 12.5L7 15H9V4.5C9 4.22 9.22 4 9.5 4S10 4.22 10 4.5V12H12V2.5C12 2.22 12.22 2 12.5 2S13 2.22 13 2.5V12H15V4C15 3.72 15.22 3.5 15.5 3.5S16 3.72 16 4V12H18V7C18 6.72 18.22 6.5 18.5 6.5S19 6.72 19 7V16Z`,yn=`M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z`,bn=`M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z`,xn=`M12,18.54L19.37,12.8L21,14.07L12,21.07L3,14.07L4.62,12.81L12,18.54M12,16L3,9L12,2L21,9L12,16M12,4.53L6.26,9L12,13.47L17.74,9L12,4.53Z`,Sn=`M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M11,18H13V15.87C14.73,15.43 16,13.86 16,12A4,4 0 0,0 12,8A4,4 0 0,0 8,12C8,13.86 9.27,15.43 11,15.87V18Z`,Cn=`M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z`,wn=`M15 17H18V14H20V17H23V19H20V22H18V19H15V17M9 6.5C10.4 6.5 11.5 7.6 11.5 9S10.4 11.5 9 11.5 6.5 10.4 6.5 9 7.6 6.5 9 6.5M9 2C12.9 2 16 5.1 16 9C16 14.2 9 22 9 22S2 14.2 2 9C2 5.1 5.1 2 9 2M9 4C6.2 4 4 6.2 4 9C4 10 4 12 9 18.7C14 12 14 10 14 9C14 6.2 11.8 4 9 4Z`,Tn=`M20.5,3L20.34,3.03L15,5.1L9,3L3.36,4.9C3.15,4.97 3,5.15 3,5.38V20.5A0.5,0.5 0 0,0 3.5,21L3.66,20.97L9,18.9L15,21L20.64,19.1C20.85,19.03 21,18.85 21,18.62V3.5A0.5,0.5 0 0,0 20.5,3M10,5.47L14,6.87V18.53L10,17.13V5.47M5,6.46L8,5.45V17.15L5,18.31V6.46M19,17.54L16,18.55V6.86L19,5.7V17.54Z`,En=`M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z`,Dn=`M19,13H5V11H19V13Z`,On=`M19 3V21H13V17.5H11V21H5V3H19M15 7H17V5H15V7M11 7H13V5H11V7M7 7H9V5H7V7M15 11H17V9H15V11M11 11H13V9H11V11M7 11H9V9H7V11M15 15H17V13H15V15M11 15H13V13H11V15M7 15H9V13H7V15M15 19H17V17H15V19M7 19H9V17H7V19M21 1H3V23H21V1Z`,kn=`M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z`,An=`M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z`,K=`M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z`,jn=`M19.07,4.93L17.66,6.34C19.1,7.79 20,9.79 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12C4,7.92 7.05,4.56 11,4.07V6.09C8.16,6.57 6,9.03 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12C18,10.34 17.33,8.84 16.24,7.76L14.83,9.17C15.55,9.9 16,10.9 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12C8,10.14 9.28,8.59 11,8.14V10.28C10.4,10.63 10,11.26 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12C14,11.26 13.6,10.62 13,10.28V2H12A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,9.24 20.88,6.74 19.07,4.93Z`,Mn=`M18.4,10.6C16.55,9 14.15,8 11.5,8C6.85,8 2.92,11.03 1.54,15.22L3.9,16C4.95,12.81 7.95,10.5 11.5,10.5C13.45,10.5 15.23,11.22 16.62,12.38L13,16H22V7L18.4,10.6Z`,Nn=`M20.2,5.9L21,5.1C19.6,3.7 17.8,3 16,3C14.2,3 12.4,3.7 11,5.1L11.8,5.9C13,4.8 14.5,4.2 16,4.2C17.5,4.2 19,4.8 20.2,5.9M19.3,6.7C18.4,5.8 17.2,5.3 16,5.3C14.8,5.3 13.6,5.8 12.7,6.7L13.5,7.5C14.2,6.8 15.1,6.5 16,6.5C16.9,6.5 17.8,6.8 18.5,7.5L19.3,6.7M19,13H17V9H15V13H5A2,2 0 0,0 3,15V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V15A2,2 0 0,0 19,13M8,18H6V16H8V18M11.5,18H9.5V16H11.5V18M15,18H13V16H15V18Z`,Pn=`M1.39,18.36L3.16,16.6L4.58,18L5.64,16.95L4.22,15.54L5.64,14.12L8.11,16.6L9.17,15.54L6.7,13.06L8.11,11.65L9.53,13.06L10.59,12L9.17,10.59L10.59,9.17L13.06,11.65L14.12,10.59L11.65,8.11L13.06,6.7L14.47,8.11L15.54,7.05L14.12,5.64L15.54,4.22L18,6.7L19.07,5.64L16.6,3.16L18.36,1.39L22.61,5.64L5.64,22.61L1.39,18.36Z`,Fn=`M20 19.88V22L18.2 20.83L13.41 11.83A4.94 4.94 0 0 0 15.19 10.83M15 7A3 3 0 0 1 12 10A3.27 3.27 0 0 1 11.56 10L5.8 20.83L4 22V19.88L9.79 9A3 3 0 0 1 12 4V2A1 1 0 0 1 13 3V4.18A3 3 0 0 1 15 7M13 7A1 1 0 1 0 12 8A1 1 0 0 0 13 7M4.22 10L6 11.8L4.56 14.56L2.1 12.1M12 17.76L10.5 16.25L9 19L12 22L15 19L13.53 16.23M19.78 10L18 11.8L19.5 14.56L21.9 12.1Z`,In=`M3,21H6V18H3M8,21H11V14H8M13,21H16V9H13M18,21H21V3H18V21Z`,Ln=`M15,5V9H11V13H7V17H3V20H10V16H14V12H18V8H22V5H15Z`,Rn=`M12,18A6,6 0 0,1 6,12C6,11 6.25,10.03 6.7,9.2L5.24,7.74C4.46,8.97 4,10.43 4,12A8,8 0 0,0 12,20V23L16,19L12,15M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12C18,13 17.75,13.97 17.3,14.8L18.76,16.26C19.54,15.03 20,13.57 20,12A8,8 0 0,0 12,4Z`,zn=`M8 13C6.14 13 4.59 14.28 4.14 16H2V18H4.14C4.59 19.72 6.14 21 8 21S11.41 19.72 11.86 18H22V16H11.86C11.41 14.28 9.86 13 8 13M8 19C6.9 19 6 18.1 6 17C6 15.9 6.9 15 8 15S10 15.9 10 17C10 18.1 9.1 19 8 19M19.86 6C19.41 4.28 17.86 3 16 3S12.59 4.28 12.14 6H2V8H12.14C12.59 9.72 14.14 11 16 11S19.41 9.72 19.86 8H22V6H19.86M16 9C14.9 9 14 8.1 14 7C14 5.9 14.9 5 16 5S18 5.9 18 7C18 8.1 17.1 9 16 9Z`,Bn=`M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z`,Vn=`M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z`,Hn=`M2,2V8H4.28L5.57,16H4V22H10V20.06L15,20.05V22H21V16H19.17L20,9H22V3H16V6.53L14.8,8H9.59L8,5.82V2M4,4H6V6H4M18,5H20V7H18M6.31,8H7.11L9,10.59V14H15V10.91L16.57,9H18L17.16,16H15V18.06H10V16H7.6M11,10H13V12H11M6,18H8V20H6M17,18H19V20H17`,Un=`M3,16H12V21H3V16M2,10H8V15H2V10M9,10H15V15H9V10M16,10H22V15H16V10M13,16H21V21H13V16M3,4H11V9H3V4M12,4H21V9H12V4Z`,Wn=`M4.06,6.15C3.97,6.17 3.88,6.22 3.8,6.28C2.66,7.9 2,9.87 2,12A10,10 0 0,0 12,22C15,22 17.68,20.68 19.5,18.6L17,18.85C14.25,19.15 11.45,19.19 8.66,18.96C7.95,18.94 7.24,18.76 6.59,18.45C5.73,18.06 5.15,17.23 5.07,16.29C5.06,16.13 5.12,16 5.23,15.87L7.42,13.6L15.03,5.7V5.6H10.84C8.57,5.64 6.31,5.82 4.06,6.15M20.17,17.5C20.26,17.47 20.35,17.44 20.43,17.39C21.42,15.83 22,14 22,12A10,10 0 0,0 12,2C9.22,2 6.7,3.13 4.89,4.97H5.17C8.28,4.57 11.43,4.47 14.56,4.65C15.5,4.64 16.45,4.82 17.33,5.17C18.25,5.53 18.89,6.38 19,7.37C19,7.53 18.93,7.7 18.82,7.82L9.71,17.19L9,17.95V18.06H13.14C15.5,18 17.84,17.81 20.17,17.5Z`,q=(e,t=20)=>T`<svg class="icon" viewBox="0 0 24 24" width=${t} height=${t} aria-hidden="true"><path d=${e} fill="currentColor"></path></svg>`,Gn={Coordinator:`#7c3aed`,Router:`#0284c7`,EndDevice:`#0d9488`,Unknown:`#64748b`},Kn={Coordinator:Wn,Router:Nn,EndDevice:Zt,Unknown:yn},qn={ok:`#16a34a`,warn:`#d97706`,bad:`#ea580c`,offline:`#dc2626`,unknown:`#94a3b8`};function Jn(e,t){if(!e)return`unknown`;if(e.available===!1)return`offline`;if(e.type===`Coordinator`)return`ok`;if(e.lqi!==null)return e.lqi>=100?`ok`:e.lqi>=60?`warn`:`bad`;if(t!==void 0){let e=Xt(t);return e===`excellent`||e===`good`?`ok`:e===`fair`?`warn`:`bad`}return e.available===!0?`ok`:`unknown`}function Yn(e){return e===null?`#94a3b8`:e>=150?`#16a34a`:e>=100?`#65a30d`:e>=60?`#d97706`:`#dc2626`}function Xn(e){return e===null?1.5:1.5+Math.min(1,e/255)*2.5}var Zn=e=>e!==void 0&&e<-85;function Qn(e,t){return t===`all`?e:e.filter(e=>e.relationship===`tree`)}var J=o`
  :host {
    --zfp-bg: var(--primary-background-color, #f4f5f7);
    --zfp-surface: var(--card-background-color, var(--ha-card-background, #ffffff));
    --zfp-surface-2: color-mix(in srgb, var(--zfp-text) 4%, var(--zfp-surface));
    --zfp-surface-3: color-mix(in srgb, var(--zfp-text) 8%, var(--zfp-surface));
    --zfp-text: var(--primary-text-color, #1c1f24);
    --zfp-text-2: var(--secondary-text-color, #5d6470);
    --zfp-text-3: color-mix(in srgb, var(--zfp-text-2) 70%, transparent);
    --zfp-accent: var(--primary-color, #039be5);
    --zfp-accent-soft: color-mix(in srgb, var(--zfp-accent) 14%, transparent);
    --zfp-on-accent: var(--text-primary-color, #ffffff);
    --zfp-divider: var(--divider-color, rgba(0, 0, 0, 0.12));
    --zfp-success: var(--success-color, #16a34a);
    --zfp-warning: var(--warning-color, #d97706);
    --zfp-error: var(--error-color, #dc2626);
    --zfp-radius: var(--ha-card-border-radius, 12px);
    --zfp-radius-sm: 8px;
    --zfp-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.08);
    --zfp-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.18);
    --zfp-ease: cubic-bezier(0.2, 0, 0, 1);
    --zfp-font: var(--paper-font-body1_-_font-family, var(--ha-font-family-body, Roboto, system-ui, sans-serif));
    font-family: var(--zfp-font);
    color: var(--zfp-text);
    -webkit-font-smoothing: antialiased;
  }
`,$n=o`
  .icon {
    display: block;
    flex: none;
  }
  button {
    font: inherit;
    color: inherit;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 36px;
    padding: 0 14px;
    border-radius: 18px;
    border: 1px solid var(--zfp-divider);
    background: var(--zfp-surface);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    transition: background 0.15s var(--zfp-ease), border-color 0.15s, box-shadow 0.15s, transform 0.1s;
  }
  .btn:hover {
    background: var(--zfp-surface-2);
  }
  .btn:active {
    transform: scale(0.98);
  }
  .btn.primary {
    background: var(--zfp-accent);
    border-color: transparent;
    color: var(--zfp-on-accent);
  }
  .btn.primary:hover {
    background: color-mix(in srgb, var(--zfp-accent) 88%, black);
  }
  .btn.danger {
    color: var(--zfp-error);
  }
  .btn[disabled],
  .icon-btn[disabled] {
    opacity: 0.45;
    pointer-events: none;
  }
  .btn.small {
    height: 30px;
    padding: 0 10px;
    font-size: 13px;
  }
  .icon-btn {
    display: inline-grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--zfp-text-2);
    transition: background 0.15s var(--zfp-ease), color 0.15s;
  }
  .icon-btn:hover {
    background: var(--zfp-surface-3);
    color: var(--zfp-text);
  }
  .icon-btn.active {
    background: var(--zfp-accent-soft);
    color: var(--zfp-accent);
  }
  button:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--zfp-accent);
    outline-offset: 2px;
  }
  .field {
    display: grid;
    gap: 4px;
    font-size: 12px;
    color: var(--zfp-text-2);
  }
  .field > span {
    font-weight: 500;
  }
  .row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 10px;
  }
  .field {
    min-width: 0;
  }
  select {
    text-overflow: ellipsis;
  }
  input[type="text"],
  input[type="number"],
  input[type="search"],
  select {
    height: 36px;
    box-sizing: border-box;
    width: 100%;
    padding: 0 10px;
    border-radius: var(--zfp-radius-sm);
    border: 1px solid var(--zfp-divider);
    background: var(--zfp-surface);
    color: var(--zfp-text);
    font: inherit;
    font-size: 14px;
    transition: border-color 0.15s;
  }
  input:hover,
  select:hover {
    border-color: color-mix(in srgb, var(--zfp-text) 30%, transparent);
  }
  input[type="range"] {
    width: 100%;
    accent-color: var(--zfp-accent);
  }
  input[type="checkbox"] {
    accent-color: var(--zfp-accent);
    width: 16px;
    height: 16px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 24px;
    padding: 0 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    background: var(--zfp-surface-3);
    color: var(--zfp-text-2);
    white-space: nowrap;
  }
  .chip.ok {
    background: color-mix(in srgb, var(--zfp-success) 15%, transparent);
    color: var(--zfp-success);
  }
  .chip.warn {
    background: color-mix(in srgb, var(--zfp-warning) 16%, transparent);
    color: var(--zfp-warning);
  }
  .chip.bad {
    background: color-mix(in srgb, var(--zfp-error) 14%, transparent);
    color: var(--zfp-error);
  }
  .muted {
    color: var(--zfp-text-2);
  }
  .section-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--zfp-text-3);
    margin: 0 0 8px;
  }
  .segmented {
    display: inline-flex;
    padding: 3px;
    border-radius: 20px;
    background: var(--zfp-surface-3);
    gap: 2px;
  }
  .segmented button {
    height: 30px;
    padding: 0 12px;
    border: none;
    border-radius: 15px;
    background: transparent;
    color: var(--zfp-text-2);
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background 0.15s var(--zfp-ease), color 0.15s;
  }
  .segmented button.active {
    background: var(--zfp-surface);
    color: var(--zfp-text);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  }
`,er=(e,t)=>Math.round(e/t)*t,tr=e=>Math.round(e*1e6)/1e6;function nr(e,t){if(t.disabled)return{pt:e,kind:`none`};let n=e=>t.exclude?.some(t=>P(t,e)<1e-6)??!1,r=null,i=t.tolerance;for(let a of t.vertices){if(n(a))continue;let t=P(a,e);t<=i&&(r=a,i=t)}if(r)return{pt:{x:r.x,y:r.y},kind:`vertex`};let a=null;i=t.tolerance;for(let n of t.walls){let t=Qe(e,n.a,n.b),r=P(t,e);r<=i&&(a={x:tr(t.x),y:tr(t.y)},i=r)}if(a)return{pt:a,kind:`wall`};if(t.anchor&&t.angleStep){let n=t.anchor,r=P(n,e);if(r>t.tolerance){let i=t.angleStep*Math.PI/180,a=er(Math.atan2(e.y-n.y,e.x-n.x),i),o=Math.max(t.grid,er(r,t.grid)),s={x:tr(n.x+Math.cos(a)*o),y:tr(n.y+Math.sin(a)*o)};if(P({x:n.x+Math.cos(a)*r,y:n.y+Math.sin(a)*r},e)<=t.tolerance)return{pt:s,kind:`angle`}}}return{pt:{x:tr(er(e.x,t.grid)),y:tr(er(e.y,t.grid))},kind:`grid`}}var Y=`dev:`,rr=4,ir=e=>`${e.toFixed(e<10?2:1)} m`;function ar(e,t){if(!t)return D;let n=e.toScreen(t.pt);switch(t.kind){case`vertex`:return T`<rect class="snap vertex" x=${n.x-6} y=${n.y-6} width="12" height="12" rx="2"></rect>`;case`wall`:return T`<path class="snap wall" d="M${n.x} ${n.y-7}L${n.x+7} ${n.y}L${n.x} ${n.y+7}L${n.x-7} ${n.y}Z"></path>`;case`angle`:return T`<circle class="snap angle" cx=${n.x} cy=${n.y} r="6"></circle>`;default:return T`<circle class="snap grid" cx=${n.x} cy=${n.y} r="3.5"></circle>`}}function or(e,t,n,r=ir(P(t,n))){let i=e.toScreen(t),a=e.toScreen(n),o=(i.x+a.x)/2,s=(i.y+a.y)/2,c=r.length*7+14;return T`<g class="dim" transform="translate(${o} ${s-16})">
    <rect x=${-c/2} y="-11" width=${c} height="22" rx="11"></rect>
    <text text-anchor="middle" dy="4">${r}</text>
  </g>`}function sr(e,t,n,r=`rubber`){let i=e.toScreen(t),a=e.toScreen(n);return T`<line class=${r} x1=${i.x} y1=${i.y} x2=${a.x} y2=${a.y}></line>`}var cr=class{constructor(){this.id=`select`,this.drag=null,this.snap=null}cursor(){return this.drag?.kind===`move`||this.drag?.kind===`device`?`grabbing`:`default`}down(e,t){let n=t.hitTest(e),r=t.world(e),i={x:e.clientX,y:e.clientY},a=t.selection;if(n?.kind===`device`){let o=Y+n.ieee;a.includes(o)||t.select(e.shiftKey?[...a,o]:[o]);let s=t.project.placements[n.ieee];this.drag={kind:`device`,ieee:n.ieee,startScreen:i,moved:!1,offset:N(r,s)}}else if(n?.kind===`vertex`)this.drag={kind:`vertex`,ref:n.ref,start:n.pt,startScreen:i,moved:!1};else if(n?.kind===`wall`||n?.kind===`room`){let o=a;e.shiftKey?(o=a.includes(n.id)?a.filter(e=>e!==n.id):[...a,n.id],t.select(o)):a.includes(n.id)||(o=[n.id],t.select(o));let s=o.filter(e=>!e.startsWith(Y));s.length&&(this.drag={kind:`move`,ids:s,start:r,startScreen:i,moved:!1,anchor:t.snap(r,{gridOnly:!0}).pt})}else this.drag={kind:`marquee`,start:r,startScreen:i,current:r,additive:e.shiftKey}}moved(e,t){return Math.hypot(e.clientX-t.x,e.clientY-t.y)>rr}move(e,t){let n=this.drag;if(!n)return;let r=t.world(e);if(n.kind===`marquee`)n.current=r,t.redraw();else if(n.moved||this.moved(e,n.startScreen)){if(n.moved=!0,n.kind===`move`){let i=t.snap(N(r,N(n.start,n.anchor)),{free:e.shiftKey,gridOnly:!0}).pt,a=N(i,n.anchor);t.setPreview(Pt(t.project,t.floor.id,n.ids,a))}else if(n.kind===`vertex`)this.snap=t.snap(r,{exclude:[n.start],free:e.shiftKey}),t.setPreview(Ft(t.project,t.floor.id,n.ref,this.snap.pt));else if(n.kind===`device`){let i=N(r,n.offset),a=e.shiftKey?i:{x:Math.round(i.x*20)/20,y:Math.round(i.y*20)/20};t.setPreview(Lt(t.project,n.ieee,a))}}}up(e,t){let n=this.drag;if(this.drag=null,this.snap=null,!n)return;if(n.kind===`marquee`){this.moved(e,n.startScreen)?t.select(lr(t,n.start,n.current,n.additive?t.selection:[])):n.additive||t.select([]),t.redraw();return}if(!n.moved){n.kind===`device`&&t.emit(`zfp-device-click`,{ieee:n.ieee});return}let r=t.world(e);if(t.setPreview(null),n.kind===`move`){let i=t.snap(N(r,N(n.start,n.anchor)),{free:e.shiftKey,gridOnly:!0}).pt,a=N(i,n.anchor);(a.x||a.y)&&t.commit(e=>Pt(e,t.floor.id,n.ids,a))}else if(n.kind===`vertex`){let i=t.snap(r,{exclude:[n.start],free:e.shiftKey}).pt;t.commit(e=>Ft(e,t.floor.id,n.ref,i))}else if(n.kind===`device`){let i=N(r,n.offset),a=e.shiftKey?i:{x:Math.round(i.x*20)/20,y:Math.round(i.y*20)/20};t.commit(e=>Lt(e,n.ieee,a))}}key(e,t){let n=t.selection;if((e.key===`Delete`||e.key===`Backspace`)&&n.length){let e=n.filter(e=>e.startsWith(Y)).map(e=>e.slice(4)),r=n.filter(e=>!e.startsWith(Y));return t.commit(n=>{let i=Nt(n,t.floor.id,r);for(let t of e)i=Rt(i,t);return i}),t.select([]),!0}if(e.key.startsWith(`Arrow`)&&n.length){let r=t.gridSize*(e.shiftKey?10:1),i={x:e.key===`ArrowLeft`?-r:e.key===`ArrowRight`?r:0,y:e.key===`ArrowUp`?-r:e.key===`ArrowDown`?r:0},a=n.filter(e=>!e.startsWith(Y)),o=n.filter(e=>e.startsWith(Y)).map(e=>e.slice(4));return t.commit(e=>{let n=a.length?Pt(e,t.floor.id,a,i):e;for(let e of o){let t=n.placements[e];t&&(n=Lt(n,e,{x:t.x+i.x,y:t.y+i.y}))}return n}),!0}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()===`d`){let e=t.floor.walls.filter(e=>n.includes(e.id));if(!e.length)return!1;let r=t.gridSize*2,i=[];return t.commit(n=>{let a=kt(n,t.floor.id,e.map(e=>({...e,a:{x:e.a.x+r,y:e.a.y+r},b:{x:e.b.x+r,y:e.b.y+r}})));return i=a.ids,a.project}),t.select(i),!0}return e.key===`Escape`&&n.length?(t.select([]),!0):!1}cancel(e){this.drag=null,this.snap=null,e.setPreview(null)}overlay(e){let t=this.drag;if(t?.kind===`marquee`){let n=e.toScreen(t.start),r=e.toScreen(t.current);return T`<rect class="marquee" x=${Math.min(n.x,r.x)} y=${Math.min(n.y,r.y)}
        width=${Math.abs(n.x-r.x)} height=${Math.abs(n.y-r.y)}></rect>`}return t?.kind===`vertex`?ar(e,this.snap):D}};function lr(e,t,n,r){let i=Math.min(t.x,n.x),a=Math.max(t.x,n.x),o=Math.min(t.y,n.y),s=Math.max(t.y,n.y),c=e=>e.x>=i&&e.x<=a&&e.y>=o&&e.y<=s,l=new Set(r);for(let t of e.floor.walls)c(t.a)&&c(t.b)&&l.add(t.id);for(let t of e.floor.rooms)t.points.every(c)&&l.add(t.id);for(let[t,n]of Object.entries(e.project.placements))n.floorId===e.floor.id&&c(n)&&l.add(Y+t);return[...l]}var ur=class{constructor(){this.id=`wall`,this.chain=[],this.hover=null}cursor(){return`crosshair`}down(e,t){if(e.button===2){this.finish(t);return}let n=this.chain[this.chain.length-1]??null,r=t.snap(t.world(e),{anchor:n,free:e.shiftKey}).pt;n?P(r,n)<1e-6||(t.commit(e=>kt(e,t.floor.id,[{a:n,b:r,thickness:t.wallThickness,material:t.wallMaterial}]).project),this.chain.length>=2&&P(r,this.chain[0])<1e-6?this.chain=[]:this.chain.push(r)):(this.chain=[r],t.redraw())}move(e,t){let n=this.chain[this.chain.length-1]??null;this.hover=t.snap(t.world(e),{anchor:n,free:e.shiftKey}),t.redraw()}up(){}dblclick(e,t){this.finish(t)}finish(e){this.chain=[],e.redraw()}key(e,t){return(e.key===`Enter`||e.key===`Escape`)&&this.chain.length?(this.finish(t),!0):e.key===`Backspace`&&this.chain.length?(this.chain.pop(),t.redraw(),!0):!1}cancel(e){this.chain=[],this.hover=null,e.redraw()}overlay(e){let t=this.chain[this.chain.length-1],n=[];if(t&&this.hover&&(n.push(sr(e,t,this.hover.pt,`rubber wall-preview`)),n.push(or(e,t,this.hover.pt))),t){let r=e.toScreen(t);n.push(T`<circle class="chain-pt" cx=${r.x} cy=${r.y} r="4"></circle>`)}return n.push(ar(e,this.hover)),T`${n}`}},dr=class{constructor(){this.id=`room`,this.pts=[],this.hover=null}cursor(){return`crosshair`}down(e,t){let n=t.snap(t.world(e),{anchor:this.pts[this.pts.length-1]??null,free:e.shiftKey}).pt,r=10/t.vp.scale;this.pts.length>=3&&P(n,this.pts[0])<=r?this.close(t):this.pts.length&&P(n,this.pts[this.pts.length-1])<1e-6||(this.pts.push(n),t.redraw())}close(e){if(this.pts.length<3)return;let t=this.pts,n=e.floor.rooms.length+1,r=``;e.commit(i=>{let a=jt(i,e.floor.id,`${e.t(`inspector.room`)} ${n}`,t);return r=a.id,a.project}),this.pts=[],r&&e.select([r]),e.redraw()}move(e,t){this.hover=t.snap(t.world(e),{anchor:this.pts[this.pts.length-1]??null,free:e.shiftKey}),t.redraw()}up(){}dblclick(e,t){this.close(t)}key(e,t){return e.key===`Enter`&&this.pts.length>=3?(this.close(t),!0):e.key===`Escape`&&this.pts.length?(this.pts=[],t.redraw(),!0):e.key===`Backspace`&&this.pts.length?(this.pts.pop(),t.redraw(),!0):!1}cancel(e){this.pts=[],this.hover=null,e.redraw()}overlay(e){if(!this.pts.length)return ar(e,this.hover);let t=this.hover?[...this.pts,this.hover.pt]:this.pts,n=t.map(t=>e.toScreen(t)),r=t.length>=3?tt(t):0,i=n[0];return T`
      <polygon class="room-preview" points=${n.map(e=>`${e.x},${e.y}`).join(` `)}></polygon>
      ${this.pts.length>=3?T`<circle class="close-target" cx=${i.x} cy=${i.y} r="9"></circle>`:D}
      ${r>0?or(e,t[0],t[Math.floor(t.length/2)],`${r.toFixed(1)} m²`):D}
      ${ar(e,this.hover)}`}},fr=class{constructor(e){this.id=e,this.a=null,this.b=null,this.hover=null,this.done=!1}cursor(){return`crosshair`}down(e,t){let n=t.snap(t.world(e),{anchor:this.done?null:this.a,free:e.shiftKey||this.id===`calibrate`}).pt;!this.a||this.done?(this.a=n,this.b=null,this.done=!1):(this.b=n,this.done=!0,this.complete(t)),t.redraw()}complete(e){}move(e,t){this.hover=t.snap(t.world(e),{anchor:this.done?null:this.a,free:e.shiftKey||this.id===`calibrate`}),t.redraw()}up(){}key(e,t){return e.key===`Escape`&&this.a?(this.cancel(t),!0):!1}cancel(e){this.a=this.b=null,this.hover=null,this.done=!1,e.redraw()}overlay(e){let t=this.b??(this.a&&!this.done?this.hover?.pt:null);if(!this.a)return ar(e,this.hover);let n=e.toScreen(this.a);return T`
      ${t?sr(e,this.a,t,`rubber measure`):D}
      <circle class="chain-pt" cx=${n.x} cy=${n.y} r="4"></circle>
      ${t?T`<circle class="chain-pt" cx=${e.toScreen(t).x} cy=${e.toScreen(t).y} r="4"></circle>`:D}
      ${t?or(e,this.a,t):D}
      ${this.done?D:ar(e,this.hover)}`}},pr=class extends fr{constructor(){super(`measure`)}},mr=class extends fr{constructor(){super(`calibrate`)}complete(e){this.a&&this.b&&P(this.a,this.b)>.001&&e.emit(`zfp-calibrate`,{a:this.a,b:this.b})}},hr=class{constructor(){this.id=`pan`}cursor(){return`grab`}down(){}move(){}up(){}key(){return!1}cancel(){}overlay(){return D}},gr=class{constructor(){this.id=`image`,this.drag=null}cursor(){return this.drag?`grabbing`:`move`}down(e,t){let n=t.floor.background;n&&(this.drag={start:t.world(e),origin:{x:n.x,y:n.y}})}target(e,t){if(!this.drag)return null;let n=t.world(e);return{x:this.drag.origin.x+n.x-this.drag.start.x,y:this.drag.origin.y+n.y-this.drag.start.y}}withBg(e,t,n){return{...e,floors:e.floors.map(e=>e.id===t.floor.id&&e.background?{...e,background:{...e.background,...n}}:e)}}move(e,t){let n=this.target(e,t);n&&t.setPreview(this.withBg(t.project,t,n))}up(e,t){let n=this.target(e,t);this.drag=null,t.setPreview(null),n&&t.commit(e=>this.withBg(e,t,n))}key(){return!1}cancel(e){this.drag=null,e.setPreview(null)}overlay(){return D}};function _r(e){switch(e){case`wall`:return new ur;case`room`:return new dr;case`measure`:return new pr;case`calibrate`:return new mr;case`pan`:return new hr;case`image`:return new gr;default:return new cr}}function vr(e,t,n,r){let i=e.placements[t];return It(e,t,{floorId:n,x:Math.round(r.x*20)/20,y:Math.round(r.y*20)/20,height:i?.height??1,...i?.txPower===void 0?{}:{txPower:i.txPower}})}var yr=40,X=(e,t)=>({x:t.x*e.scale+e.tx,y:t.y*e.scale+e.ty}),br=(e,t)=>({x:(t.x-e.tx)/e.scale,y:(t.y-e.ty)/e.scale});function xr(e,t,n){let r=Math.min(800,Math.max(4,e.scale*n)),i=r/e.scale;return{scale:r,tx:t.x-(t.x-e.tx)*i,ty:t.y-(t.y-e.ty)*i}}function Sr(e,t,n,r=48){if(!e||t<=0||n<=0)return{scale:yr,tx:t/2,ty:n/2};let i=Math.max(e.maxX-e.minX,1),a=Math.max(e.maxY-e.minY,1),o=Math.min(800,Math.max(4,Math.min((t-2*r)/i,(n-2*r)/a))),s=(e.minX+e.maxX)/2,c=(e.minY+e.maxY)/2;return{scale:o,tx:t/2-s*o,ty:n/2-c*o}}var Cr={heatmap:!0,links:!0,labels:!0,background:!0,suggestions:!0},wr=`application/x-zigbee-floorplan-device`,Tr=.6,Er=15,Dr=10,Or=6,kr=class extends A{static{this.properties={project:{attribute:!1},floorId:{attribute:!1},network:{attribute:!1},rf:{attribute:!1},editable:{type:Boolean},tool:{attribute:!1},layers:{attribute:!1},linkMode:{attribute:!1},selection:{attribute:!1},placing:{attribute:!1},imageUrls:{attribute:!1},site:{attribute:!1},t:{attribute:!1},wallMaterial:{attribute:!1},wallThickness:{attribute:!1},gridSize:{attribute:!1},highlight:{attribute:!1},editHint:{attribute:!1},_vp:{state:!0},_preview:{state:!0},_tick:{state:!0},_hoverDevice:{state:!0},_ghost:{state:!0}}}constructor(){super(),this.toolImpl=_r(`select`),this.viewports=/* @__PURE__ */ new Map,this.pointers=/* @__PURE__ */ new Map,this.pan=null,this.viewPress=null,this.labelPress=!1,this.pinch=null,this.spaceDown=!1,this.size={w:0,h:0},this.heatBitmaps=/* @__PURE__ */ new Map,this.buildingDrag=null,this.rafId=0,this.needsFit=!0,this.userMoved=!1,this.onPointerDown=e=>{if(e.pointerType===`mouse`&&e.button!==0&&e.button!==1&&e.button!==2)return;e.currentTarget.setPointerCapture(e.pointerId),this.renderRoot.querySelector(`.wrap`)?.focus({preventScroll:!0});let t=this.eventPoint(e);if(this.pointers.set(e.pointerId,t),this.pointers.size===2){this.toolImpl.cancel(this.host());let[e,t]=[...this.pointers.values()];this.pinch={d:P(e,t),mid:{x:(e.x+t.x)/2,y:(e.y+t.y)/2},vp:this._vp},this.pan=null;return}if(this.placing&&e.button===0){let t=this.placing;this.placeAtView(t,this.eventWorld(e))&&(this.emit(`zfp-placed`,{ieee:t}),this._ghost=null);return}if(this.site&&e.button===0){let n=this.hitTest(e);if(n?.kind===`device`){this.viewPress={ieee:n.ieee,x:t.x,y:t.y,hinted:!1};return}if(n?.kind===`building`&&(this.editable||n.label)){let r=this.shown.buildings.find(e=>e.id===n.id);this.buildingDrag={id:n.id,start:this.eventWorld(e),origin:{x:r.x,y:r.y},moved:!1,screen:t},this.labelPress=n.label;return}}let n=this.activeTool;if(e.button===1||this.spaceDown||n?.id===`pan`||!n&&!this.hitTest(e)||n?.id===`select`&&e.pointerType===`touch`&&!this.hitTest(e)){let r=!n&&this.editHint&&!!this.hitTest(e,!0);this.pan={x:t.x,y:t.y,vp:this._vp,onItem:r},this._tick++}else if(n)n.down(e,this.host()),this._tick++;else{let n=this.hitTest(e);n?.kind===`device`&&(this.viewPress={ieee:n.ieee,x:t.x,y:t.y,hinted:!1})}},this.onPointerMove=e=>{let t=this.eventPoint(e);if(this.pointers.has(e.pointerId)&&this.pointers.set(e.pointerId,t),this.pinch&&this.pointers.size>=2){let[e,t]=[...this.pointers.values()],n=P(e,t),r={x:(e.x+t.x)/2,y:(e.y+t.y)/2},i=this.pinch.vp;this.userMoved=!0;let a=xr(i,this.pinch.mid,n/this.pinch.d);this._vp={...a,tx:a.tx+r.x-this.pinch.mid.x,ty:a.ty+r.y-this.pinch.mid.y};return}if(this.buildingDrag){let n=this.buildingDrag;if(!n.moved&&Math.hypot(t.x-n.screen.x,t.y-n.screen.y)<=4||!this.editable)return;n.moved=!0;let r=this.eventWorld(e),i=e=>Math.round(e*2)/2,a={x:i(n.origin.x+r.x-n.start.x),y:i(n.origin.y+r.y-n.start.y)};this._preview=St(this.project,n.id,a);return}if(this.viewPress){let e=this.viewPress;!e.hinted&&Math.hypot(t.x-e.x,t.y-e.y)>6&&(e.hinted=!0,this.editHint&&this.emit(`zfp-edit-hint`));return}if(this.pan){this.pan.onItem&&Math.hypot(t.x-this.pan.x,t.y-this.pan.y)>6&&(this.pan.onItem=!1,this.emit(`zfp-edit-hint`)),this.userMoved=!0,this._vp={...this.pan.vp,tx:this.pan.vp.tx+t.x-this.pan.x,ty:this.pan.vp.ty+t.y-this.pan.y};return}if(this.placing){this._ghost=this.eventWorld(e);return}let n=this.activeTool;if(n&&n.move(e,this.host()),e.pointerType===`mouse`&&!this.pointers.size){let t=this.hitTest(e),n=t?.kind===`device`?t.ieee:null;n!==this._hoverDevice&&(this._hoverDevice=n)}},this.onPointerUp=e=>{let t=!!this.pinch;if(this.pointers.delete(e.pointerId),this.pointers.size<2&&(this.pinch=null),t){if(this.pointers.size===1){let[e]=[...this.pointers.values()];this.pan={x:e.x,y:e.y,vp:this._vp}}return}if(this.buildingDrag){let e=this.buildingDrag;this.buildingDrag=null;let t=this._preview;if(this._preview=null,e.moved&&t){let n=t.buildings.find(t=>t.id===e.id);this.emit(`zfp-commit`,{fn:t=>St(t,e.id,{x:n.x,y:n.y})})}else!e.moved&&this.labelPress&&this.emit(`zfp-open-building`,{id:e.id});return}if(this.viewPress){let e=this.viewPress;this.viewPress=null,e.hinted||this.emit(`zfp-device-click`,{ieee:e.ieee});return}if(this.pan){let t=Math.hypot(this._vp.tx-this.pan.vp.tx,this._vp.ty-this.pan.vp.ty)>3;this.pan=null,this._tick++,!t&&this.activeTool?.id===`select`&&e.pointerType===`touch`&&this.host().select([]);return}let n=this.activeTool;n&&(n.up(e,this.host()),this._tick++)},this.onDblClick=e=>{this.activeTool?.dblclick?.(e,this.host())},this.onWheel=e=>{e.preventDefault(),this.userMoved=!0;let t=this.eventPoint(e),n=e.deltaMode===1?e.deltaY*16:e.deltaY;if(!e.ctrlKey&&Math.abs(e.deltaX)>.5){this._vp={...this._vp,tx:this._vp.tx-e.deltaX,ty:this._vp.ty-e.deltaY};return}let r=Math.exp(-n*(e.ctrlKey?.01:.0018));this._vp=xr(this._vp,t,r)},this.onContextMenu=e=>{this.editable&&e.preventDefault()},this.onKeyUp=e=>{e.code===`Space`&&(this.spaceDown=!1,this._tick++)},this.onDragOver=e=>{this.editable&&e.dataTransfer?.types.includes(`application/x-zigbee-floorplan-device`)&&(e.preventDefault(),e.dataTransfer.dropEffect=`move`,this._ghost=this.eventWorld(e))},this.onDragLeave=()=>{this._ghost=null},this.onDrop=e=>{let t=e.dataTransfer?.getData(wr);this._ghost=null,t&&this.editable&&(e.preventDefault(),this.placeAtView(t,this.eventWorld(e))&&(this.emit(`zfp-placed`,{ieee:t}),this.emit(`zfp-select`,{ids:[Y+t]})))},this.network=null,this.rf=null,this.editable=!1,this.tool=`select`,this.layers=Cr,this.linkMode=`tree`,this.selection=[],this.placing=null,this.imageUrls={},this.site=null,this.t=e=>e,this.wallMaterial=`brick`,this.wallThickness=.15,this.gridSize=.25,this.highlight=null,this.editHint=!1,this._vp={scale:40,tx:0,ty:0},this._preview=null,this._tick=0,this._hoverDevice=null,this._ghost=null}get shown(){return this._preview??this.project}get floor(){return this.shown?.floors.find(e=>e.id===this.floorId)}viewLayers(){let e=this.shown;if(!e)return[];if(!this.site){let t=this.floor,n=t&&e.buildings.find(e=>e.id===t.buildingId);return t&&n?[{floor:t,building:n,dx:0,dy:0}]:[]}let t=[];for(let n of e.buildings){if(!n.visible)continue;let r=H(e,n.id).find(e=>e.level===this.site.level);r&&t.push({floor:r,building:n,dx:n.x,dy:n.y})}return t}siteShift(){if(this.site)return{x:0,y:0};let e=this.shown?.buildings.find(e=>e.id===this.floor?.buildingId);return e?{x:-e.x,y:-e.y}:{x:0,y:0}}viewPositions(){let e=new Map(this.viewLayers().map(e=>[e.floor.id,e])),t=/* @__PURE__ */ new Map;for(let[n,r]of Object.entries(this.shown?.placements??{})){let i=e.get(r.floorId);i&&t.set(n,{pt:{x:r.x+i.dx,y:r.y+i.dy},floorId:r.floorId})}return t}footprints(){if(!this.site)return[];let e=this.shown,t=new Set(this.viewLayers().map(e=>e.building.id));return e.buildings.filter(e=>e.visible).map(n=>{let r=vt(e,n.id)??{minX:0,minY:0,maxX:6,maxY:4};return{building:n,hasLevel:t.has(n.id),box:{minX:r.minX+n.x-Tr,minY:r.minY+n.y-Tr,maxX:r.maxX+n.x+Tr,maxY:r.maxY+n.y+Tr}}})}viewKey(){return this.site?`site:${this.site.level}`:this.floorId}deviceMap(){return new Map((this.network?.devices??[]).map(e=>[e.ieee,e]))}fit(e=!0){this.userMoved=!1;let t=Sr(this.contentBox(),this.size.w,this.size.h,56);this.animateTo(e?t:null,t)}zoomBy(e){this.userMoved=!0,this.animateTo({...xr(this._vp,{x:this.size.w/2,y:this.size.h/2},e)},null)}centerOn(e){this.userMoved=!0;let t=Math.max(this._vp.scale,60);this.animateTo({scale:t,tx:this.size.w/2-e.x*t,ty:this.size.h/2-e.y*t},null)}centerOnSite(e){let t=this.siteShift();this.centerOn({x:e.x+t.x,y:e.y+t.y})}centerOnDevice(e){let t=this.viewPositions().get(e);return t&&this.centerOn(t.pt),!!t}animateTo(e,t){if(cancelAnimationFrame(this.rafId),t&&!e){this._vp=t;return}if(!e)return;if(window.matchMedia?.(`(prefers-reduced-motion: reduce)`).matches){this._vp=e;return}let n=this._vp,r=performance.now(),i=t=>{let a=Math.min(1,(t-r)/260),o=1-(1-a)**3,s=Math.exp(Math.log(n.scale)+(Math.log(e.scale)-Math.log(n.scale))*o);this._vp={scale:s,tx:n.tx+(e.tx-n.tx)*o,ty:n.ty+(e.ty-n.ty)*o},a<1&&(this.rafId=requestAnimationFrame(i))};this.rafId=requestAnimationFrame(i)}contentBox(){let e=null;for(let{floor:t,dx:n,dy:r}of this.viewLayers()){let i=[...t.walls.flatMap(e=>[e.a,e.b]),...t.rooms.flatMap(e=>e.points)];if(i.push(...Object.values(this.shown.placements).filter(e=>e.floorId===t.id)),t.background&&this.layers.background&&t.background.visible){let e=t.background;i.push({x:e.x,y:e.y},{x:e.x+e.width*e.scale,y:e.y+e.height*e.scale})}e=it(e,rt(i.map(e=>({x:e.x+n,y:e.y+r}))))}for(let t of this.footprints())e=it(e,t.box);return e}connectedCallback(){super.connectedCallback(),this.ro=new ResizeObserver(([e])=>{let{width:t,height:n}=e.contentRect,r=this.size,i=r.w===0;this.size={w:t,h:n},i||this.needsFit||!this.userMoved?(this.needsFit=!1,this.fit(!1)):this._vp={...this._vp,tx:this._vp.tx+(t-r.w)/2,ty:this._vp.ty+(n-r.h)/2},this.drawBase(),this._tick++}),this.updateComplete.then(()=>{let e=this.renderRoot.querySelector(`.wrap`);e&&this.ro?.observe(e)}),window.addEventListener(`keyup`,this.onKeyUp)}disconnectedCallback(){super.disconnectedCallback(),this.ro?.disconnect(),cancelAnimationFrame(this.rafId),window.removeEventListener(`keyup`,this.onKeyUp)}willUpdate(e){if(e.has(`tool`)&&this.toolImpl.id!==this.tool&&(this.toolImpl.cancel(this.host()),this.toolImpl=_r(this.tool)),e.has(`floorId`)||e.has(`site`)){let t=e.has(`floorId`)?e.get(`floorId`):this.floorId,n=e.has(`site`)?e.get(`site`):this.site,r=n?`site:${n.level}`:t;r&&this.size.w&&this.viewports.set(r,this._vp);let i=this.viewports.get(this.viewKey());this._preview=null,this.toolImpl.cancel(this.host()),i?this._vp=i:this.size.w?this.fit(!1):this.needsFit=!0}e.has(`project`)&&e.get(`project`)===void 0&&this.size.w&&this.fit(!1)}updated(e){e.has(`rf`)&&this.refreshHeat(),(e.has(`_vp`)||e.has(`rf`)||e.has(`layers`)||e.has(`floorId`)||e.has(`gridSize`)||e.has(`site`)||e.has(`project`))&&this.drawBase()}async refreshHeat(){let e=this.rf?.heats??[],t=/* @__PURE__ */ new Map;for(let n of e){let e=this.heatBitmaps.get(n);if(e)t.set(n,e);else if(n.rgba.length)try{t.set(n,await createImageBitmap(new ImageData(new Uint8ClampedArray(n.rgba),n.cols,n.rows)))}catch{}}for(let[e,n]of this.heatBitmaps)t.has(e)||n.close();this.heatBitmaps=t,this.drawBase()}textRgb(){let e=this.colorProbe??=this.renderRoot.querySelector(`.probe`),t=e?getComputedStyle(e).color.match(/\d+(\.\d+)?/g):null;return t?[Number(t[0]),Number(t[1]),Number(t[2])]:[30,30,30]}drawBase(){let e=this.renderRoot.querySelector(`canvas`);if(!e||!this.size.w)return;let t=window.devicePixelRatio||1,n=Math.round(this.size.w*t),r=Math.round(this.size.h*t);(e.width!==n||e.height!==r)&&(e.width=n,e.height=r);let i=e.getContext(`2d`);if(!i)return;i.setTransform(t,0,0,t,0,0),i.clearRect(0,0,this.size.w,this.size.h);let a=this._vp,[o,s,c]=this.textRgb(),l=[this.gridSize,.5,1,2,5,10].find(e=>e*a.scale>=9)??10,u=l<1?1:l*5,d=br(a,{x:0,y:0}),f=br(a,{x:this.size.w,y:this.size.h}),p=(e,t)=>{i.strokeStyle=`rgba(${o},${s},${c},${t})`,i.lineWidth=1,i.beginPath();for(let t=Math.floor(d.x/e)*e;t<=f.x;t+=e){let e=Math.round(t*a.scale+a.tx)+.5;i.moveTo(e,0),i.lineTo(e,this.size.h)}for(let t=Math.floor(d.y/e)*e;t<=f.y;t+=e){let e=Math.round(t*a.scale+a.ty)+.5;i.moveTo(0,e),i.lineTo(this.size.w,e)}i.stroke()};if(p(l,.05),p(u,.1),this.layers.heatmap){let e=new Set(this.viewLayers().map(e=>e.floor.id)),t=this.siteShift();i.imageSmoothingEnabled=!0,i.imageSmoothingQuality=`high`,i.globalAlpha=.9;for(let n of this.rf?.heats??[]){let r=this.heatBitmaps.get(n);if(!r||!e.has(n.floorId))continue;let o=X(a,{x:n.originX+t.x,y:n.originY+t.y});i.drawImage(r,o.x,o.y,n.cols*n.cell*a.scale,n.rows*n.cell*a.scale)}i.globalAlpha=1}}host(){let e=this;return{get project(){return e.project},get floor(){return e.project.floors.find(t=>t.id===e.floorId)},get vp(){return e._vp},get selection(){return e.selection},get wallMaterial(){return e.wallMaterial},get wallThickness(){return e.wallThickness},get gridSize(){return e.gridSize},world:e=>this.eventWorld(e),toScreen:e=>X(this._vp,e),snap:(e,t)=>this.snap(e,t),hitTest:e=>this.hitTest(e),commit:e=>this.emit(`zfp-commit`,{fn:e}),select:e=>{this.selection=e,this.emit(`zfp-select`,{ids:e})},setPreview:e=>{this._preview=e},redraw:()=>{this._tick++},emit:(e,t)=>this.emit(e,t),t:(e,t)=>this.t(e,t)}}emit(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}eventPoint(e){let t=this.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}eventWorld(e){return br(this._vp,this.eventPoint(e))}snap(e,t={}){let n=this.floor,r=n?[...n.walls.flatMap(e=>[e.a,e.b]),...n.rooms.flatMap(e=>e.points)]:[];return nr(e,{grid:this.gridSize,vertices:t.gridOnly?[]:r,walls:t.gridOnly?[]:n?.walls??[],tolerance:Dr/this._vp.scale,anchor:t.anchor??null,angleStep:15,disabled:t.free,exclude:t.exclude})}hitTest(e,t=this.editable){let n=this.eventPoint(e),r=br(this._vp,n),i=null;for(let[e,{pt:t}]of this.viewPositions()){let r=P(X(this._vp,t),n);r<=19&&(!i||r<i.d)&&(i={ieee:e,d:r})}if(i)return{kind:`device`,ieee:i.ieee};if(this.site){for(let e of[...this.footprints()].reverse()){let t=X(this._vp,{x:e.box.minX,y:e.box.minY}),r=e.building.name.length*7.2+28;if(n.x>=t.x&&n.x<=t.x+r&&n.y>=t.y-26&&n.y<=t.y)return{kind:`building`,id:e.building.id,label:!0}}for(let e of[...this.footprints()].reverse())if(r.x>=e.box.minX&&r.x<=e.box.maxX&&r.y>=e.box.minY&&r.y<=e.box.maxY)return{kind:`building`,id:e.building.id,label:!1};return null}let a=this.floor;if(!a||!t)return null;for(let e of a.walls)if(this.selection.includes(e.id)){for(let t of[`a`,`b`])if(P(X(this._vp,e[t]),n)<=8)return{kind:`vertex`,ref:{kind:`wall`,id:e.id,end:t},pt:e[t]}}for(let e of a.rooms){if(!this.selection.includes(e.id))continue;let t=e.points.findIndex(e=>P(X(this._vp,e),n)<=8);if(t>=0)return{kind:`vertex`,ref:{kind:`room`,id:e.id,index:t},pt:e.points[t]}}let o=null;for(let e of a.walls){let t=$e(r,e.a,e.b);t<=e.thickness/2+Or/this._vp.scale&&(!o||t<o.d)&&(o={id:e.id,d:t})}if(o)return{kind:`wall`,id:o.id};let s=a.rooms.filter(e=>et(r,e.points)).sort((e,t)=>tt(e.points)-tt(t.points));return s.length?{kind:`room`,id:s[0].id}:null}get activeTool(){return this.editable&&!this.placing&&!this.site?this.toolImpl:null}layerAt(e){let t=this.viewLayers();if(!this.site)return t[0]??null;let n=this.footprints().find(t=>t.hasLevel&&e.x>=t.box.minX&&e.x<=t.box.maxX&&e.y>=t.box.minY&&e.y<=t.box.maxY);return n?t.find(e=>e.building.id===n.building.id)??null:null}placeAtView(e,t){let n=this.layerAt(t);if(!n)return!1;let r={x:t.x-n.dx,y:t.y-n.dy};return this.emit(`zfp-commit`,{fn:t=>vr(t,e,n.floor.id,r)}),!0}handleKey(e){if(e.code===`Space`)return this.spaceDown||(this.spaceDown=!0,this._tick++),!0;if(e.key===`Escape`&&this.placing)return this.emit(`zfp-placed`,{ieee:null}),this._ghost=null,!0;let t=this.activeTool;return t?t.key(e,this.host()):!1}cursor(){if(this.pan||this.pinch)return`grabbing`;if(this.spaceDown)return`grab`;if(this.placing)return`copy`;if(this.buildingDrag?.moved)return`grabbing`;if(this.site)return this._hoverDevice?`pointer`:this.editable?`default`:`grab`;let e=this.activeTool;return e?e.id===`select`&&this._hoverDevice?`pointer`:e.cursor(this.host()):this._hoverDevice?`pointer`:`grab`}render(){let e=this.floor,t=this._vp,n=this.deviceMap(),r=this.viewLayers();return w`
      <div
        class="wrap"
        tabindex="0"
        style="cursor:${this.cursor()}"
        @pointerdown=${this.onPointerDown}
        @pointermove=${this.onPointerMove}
        @pointerup=${this.onPointerUp}
        @pointercancel=${this.onPointerUp}
        @pointerleave=${()=>this._ghost=this.placing?null:this._ghost}
        @dblclick=${this.onDblClick}
        @wheel=${this.onWheel}
        @contextmenu=${this.onContextMenu}
        @dragover=${this.onDragOver}
        @dragleave=${this.onDragLeave}
        @drop=${this.onDrop}
      >
        <span class="probe"></span>
        <canvas></canvas>
        <svg class="layer">
          ${e||this.site?T`
              <g transform="matrix(${t.scale} 0 0 ${t.scale} ${t.tx} ${t.ty})">
                ${M(r,e=>e.floor.id,e=>T`<g transform="translate(${e.dx} ${e.dy})">
                    ${this.renderBackground(e.floor)}
                    ${this.renderRooms(e.floor)}
                    ${this.renderWalls(e.floor)}
                  </g>`)}
              </g>
              ${this.renderFootprints()}
              ${this.layers.links?this.renderLinks(n):D}
              ${this.layers.labels?r.map(e=>this.renderRoomLabels(e.floor,e.dx,e.dy)):D}
              ${e&&!this.site?this.renderSelectionHandles(e):D}
              ${this.layers.suggestions?this.renderSuggestions():D}
              ${this.renderDevices(n)}
              ${this.renderGhost(n)}
              ${this.activeTool?this.activeTool.overlay(this.host()):D}`:D}
        </svg>
        <div class="scale-bar">${this.renderScaleBar()}</div>
      </div>
    `}renderBackground(e){let t=e.background,n=t&&this.imageUrls[t.imageId];if(!t||!this.layers.background||!t.visible||!n)return D;let r=t.width*t.scale,i=t.height*t.scale;return T`<image href=${n} x=${t.x} y=${t.y} width=${r} height=${i}
      opacity=${t.opacity} preserveAspectRatio="none"
      transform=${t.rotation?`rotate(${t.rotation} ${t.x+r/2} ${t.y+i/2})`:``}
      class=${this.tool===`image`&&this.editable?`bg editing`:`bg`}></image>`}renderRooms(e){return M(e.rooms,e=>e.id,e=>T`<polygon class="room ${this.selection.includes(e.id)?`selected`:``}"
        points=${e.points.map(e=>`${e.x},${e.y}`).join(` `)}></polygon>`)}renderWalls(e){let t=new Set(this.selection),n=1/this._vp.scale;return T`
      ${M(e.walls.filter(e=>t.has(e.id)),e=>`sel-${e.id}`,e=>T`<line class="wall-sel" x1=${e.a.x} y1=${e.a.y} x2=${e.b.x} y2=${e.b.y}
          stroke-width=${e.thickness+6*n}></line>`)}
      ${M(e.walls,e=>e.id,e=>{let t=F[e.material],r=t.pattern===`glass`;return T`<line class="wall" x1=${e.a.x} y1=${e.a.y} x2=${e.b.x} y2=${e.b.y}
            stroke=${t.color} stroke-width=${Math.max(e.thickness,2*n)}></line>
          ${r?T`<line class="wall-glass" x1=${e.a.x} y1=${e.a.y} x2=${e.b.x} y2=${e.b.y}
                stroke-width=${Math.max(e.thickness*.3,n)}></line>`:t.pattern===`dense`?T`<line class="wall-core" x1=${e.a.x} y1=${e.a.y} x2=${e.b.x} y2=${e.b.y}
                  stroke-width=${Math.max(e.thickness*.25,n)} stroke-dasharray=${`${4*n} ${3*n}`}></line>`:D}`})}`}renderRoomLabels(e,t=0,n=0){if(this._vp.scale<14)return D;let r=e=>X(this._vp,{x:e.x+t,y:e.y+n});return M(e.rooms,e=>e.id,e=>{let i=rt(e.points),a=r({x:i.minX,y:i.minY});a={x:a.x+10,y:a.y+18};let o=br(this._vp,a);return et({x:o.x-t,y:o.y-n},e.points)||(a=r(nt(e.points))),T`<g class="room-label" transform="translate(${a.x} ${a.y})">
        <text>${e.name}</text>
        <text class="area" dy="14">${tt(e.points).toFixed(1)} m²</text>
      </g>`})}renderSelectionHandles(e){if(!this.editable||this.tool!==`select`)return D;let t=[];for(let n of e.walls)this.selection.includes(n.id)&&t.push(n.a,n.b);for(let n of e.rooms)this.selection.includes(n.id)&&t.push(...n.points);return t.map(e=>{let t=X(this._vp,e);return T`<rect class="handle" x=${t.x-5} y=${t.y-5} width="10" height="10" rx="2"></rect>`})}renderLinks(e){let t=Qn(this.network?.links??[],this.linkMode),n=this.shown.placements,r=this.viewPositions(),i=this.siteShift(),a=e=>{let t=this.shown.floors.find(t=>t.id===e);return{floor:t,building:this.shown.buildings.find(e=>e.id===t?.buildingId)}},o=this._hoverDevice??this.highlight??this.selectedDevice(),s=o&&t.some(e=>e.a===o||e.b===o)?o:null,c=[],l=[];for(let o of t){let t=n[o.a],u=n[o.b];if(!t||!u||!e.has(o.a)||!e.has(o.b))continue;let d=r.has(o.a),f=r.has(o.b);if(!d&&!f)continue;let p=!s||o.a===s||o.b===s,m=`link ${o.relationship} ${p?``:`dim`} ${s&&p?`focus`:``}`,h=Yn(o.lqi),ee=Xn(o.lqi);if(d&&f){let e=X(this._vp,r.get(o.a).pt),t=X(this._vp,r.get(o.b).pt),[n,i]=o.parent===o.a?[t,e]:[e,t];if(c.push(T`<line class=${m} x1=${n.x} y1=${n.y} x2=${i.x} y2=${i.y}
          stroke=${h} stroke-width=${ee}></line>`),this.layers.labels&&o.lqi!==null&&(s?p:this._vp.scale>30)){let n=(e.x+t.x)/2,r=(e.y+t.y)/2;c.push(T`<g class="lqi-tag ${p?``:`dim`}" transform="translate(${n} ${r})">
            <rect x="-14" y="-9" width="28" height="18" rx="9" fill=${h}></rect>
            <text text-anchor="middle" dy="4">${o.lqi}</text></g>`)}}else{let e=r.get(d?o.a:o.b),n=d?u:t,s=a(e.floorId),c=a(n.floorId),f=c.floor,te=X(this._vp,e.pt),ne={x:e.pt.x-i.x,y:e.pt.y-i.y},g={x:n.x+(c.building?.x??0),y:n.y+(c.building?.y??0)},_=g.x-ne.x,v=g.y-ne.y;Math.hypot(_,v)<.3&&(_=.7,v=-.7);let re=52/Math.hypot(_,v),y=te.x+_*re,ie=te.y+v*re,ae=c.building?.id===s.building?.id,b=s.floor?.level??0,oe=f?f.level===b?``:`${f.level>b?`↑`:`↓`}${f.level}`:`?`,se=ae?oe:`${(c.building?.name??`?`).slice(0,10)}${oe?` ${oe}`:``}`,x=Math.max(24,se.length*6.5+10);l.push(T`<g class="stub ${p?``:`dim`}">
          <line class=${m} x1=${te.x} y1=${te.y} x2=${y} y2=${ie} stroke=${h} stroke-width=${ee}></line>
          <g transform="translate(${y} ${ie})">
            <rect x=${-x/2} y="-9" width=${x} height="18" rx="5"
              style=${!ae&&c.building?`stroke:${c.building.color}`:``}></rect>
            <text text-anchor="middle" dy="4">${se}</text>
          </g></g>`)}}return T`<g class="links">${c}${l}</g>`}selectedDevice(){let e=this.selection.find(e=>e.startsWith(Y));return e?e.slice(Y.length):null}renderDevices(e){let t=[...this.viewPositions()].map(([e,t])=>[e,t.pt]),n={Coordinator:3,Router:2,EndDevice:1,Unknown:0};t.sort(([t],[r])=>n[e.get(t)?.type??`Unknown`]-n[e.get(r)?.type??`Unknown`]);let r=this.rf?.deviceRssi??{},i=this.layers.labels&&this._vp.scale>=26;return T`<g class="devices">${M(t,([e])=>e,([t,n])=>{let a=e.get(t),o=X(this._vp,n),s=a?.type??`Unknown`,c=Jn(a,r[t]),l=this.selection.includes(Y+t),u=this._hoverDevice===t||this.highlight===t,d=a?.battery!==null&&a?.battery!==void 0&&a.battery<=15;return T`<g class="device ${s} ${c} ${l?`selected`:``} ${u?`hover`:``} ${a?``:`missing`}"
            transform="translate(${o.x} ${o.y})">
          ${this.highlight===t?T`<circle class="pulse" r=${Er}></circle>`:D}
          ${l?T`<circle class="sel-ring" r=${20}></circle>`:D}
          <circle class="body" r=${Er} stroke=${qn[c]}></circle>
          <g transform="translate(-10 -10)" fill=${Gn[s]}>
            <path transform="scale(0.8333)" d=${Kn[s]}></path>
          </g>
          ${d?T`<g class="badge" transform="translate(9 -17)"><circle r="8"></circle>
                <path transform="translate(-6 -6) scale(0.5)" d=${en}></path></g>`:D}
          ${i||l||u?T`<text class="dev-label" text-anchor="middle" y=${30}>${a?.name??t}</text>`:D}
        </g>`})}</g>`}renderSuggestions(){let e=new Set(this.viewLayers().map(e=>e.floor.id)),t=this.siteShift();return(this.rf?.suggestions??[]).filter(t=>e.has(t.floorId)).map((e,n)=>{let r=X(this._vp,{x:e.pos.x+t.x,y:e.pos.y+t.y});return T`<g class="suggestion" transform="translate(${r.x} ${r.y})">
        <circle class="halo" r="22"></circle>
        <circle class="core" r="14"></circle>
        <path transform="translate(-9 -9) scale(0.75)" d=${K}></path>
        <text class="sugg-label" text-anchor="middle" y="36">${n+1}. +${Math.round(e.gainArea)} m²</text>
      </g>`})}renderFootprints(){return this.site?this.footprints().map(({building:e,box:t,hasLevel:n})=>{let r=X(this._vp,{x:t.minX,y:t.minY}),i=X(this._vp,{x:t.maxX,y:t.maxY}),a=e.name.length*7.2+28,o=this.buildingDrag?.id===e.id&&this.buildingDrag.moved;return T`<g class="footprint ${n?``:`empty`} ${o?`dragging`:``} ${this.editable?`movable`:``}"
          style="--b:${e.color}">
        <rect class="fp-box" x=${r.x} y=${r.y} width=${i.x-r.x} height=${i.y-r.y} rx="10"></rect>
        <g class="fp-label" transform="translate(${r.x} ${r.y-26})">
          <rect width=${a} height="22" rx="11"></rect>
          <circle cx="12" cy="11" r="4"></circle>
          <text x="22" y="15">${e.name}</text>
        </g>
      </g>`}):D}renderGhost(e){if(!this._ghost)return D;let t=this.placing,n=t&&e.get(t)?.type||`Router`,r=X(this._vp,this._ghost);return T`<g class="device ghost" transform="translate(${r.x} ${r.y})">
      <circle class="body" r=${Er}></circle>
      <g transform="translate(-10 -10)" fill=${Gn[n]}><path transform="scale(0.8333)" d=${Kn[n]}></path></g>
    </g>`}renderScaleBar(){let e=90/this._vp.scale,t=[.1,.2,.25,.5,1,2,5,10,20,50].find(t=>t>=e)??50;return w`<span class="bar" style="width:${t*this._vp.scale}px"></span><span>${t<1?`${t*100} cm`:`${t} m`}</span>`}static{this.styles=[J,o`
      :host {
        display: block;
        position: relative;
        overflow: hidden;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
      }
      .wrap {
        position: absolute;
        inset: 0;
        outline: none;
        background:
          radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--zfp-surface) 92%, var(--zfp-accent)), var(--zfp-surface) 70%);
      }
      .probe {
        position: absolute;
        visibility: hidden;
        color: var(--zfp-text);
      }
      canvas,
      svg.layer {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      svg.layer {
        overflow: visible;
      }
      .bg {
        image-rendering: auto;
      }
      .bg.editing {
        outline: 2px dashed var(--zfp-accent);
      }
      .fp-box {
        fill: color-mix(in srgb, var(--b) 4%, transparent);
        stroke: var(--b);
        stroke-width: 1.5px;
        stroke-dasharray: 6 5;
        opacity: 0.8;
      }
      .footprint.movable .fp-box {
        cursor: move;
      }
      .footprint.dragging .fp-box {
        fill: color-mix(in srgb, var(--b) 12%, transparent);
        stroke-dasharray: none;
      }
      .footprint.empty .fp-box {
        opacity: 0.4;
      }
      .fp-label {
        cursor: pointer;
      }
      .fp-label rect {
        fill: var(--zfp-surface);
        stroke: var(--b);
        stroke-width: 1.5px;
      }
      .fp-label circle {
        fill: var(--b);
      }
      .fp-label text {
        font-size: 12px;
        font-weight: 600;
        fill: var(--zfp-text);
      }
      .footprint.empty .fp-label {
        opacity: 0.6;
      }
      .room {
        fill: color-mix(in srgb, var(--zfp-text) 4%, transparent);
        stroke: color-mix(in srgb, var(--zfp-text) 18%, transparent);
        stroke-width: 1px;
        vector-effect: non-scaling-stroke;
        stroke-dasharray: 4 3;
        transition: fill 0.15s;
      }
      .room.selected {
        fill: var(--zfp-accent-soft);
        stroke: var(--zfp-accent);
        stroke-dasharray: none;
      }
      .wall {
        stroke-linecap: square;
      }
      .wall-sel {
        stroke: var(--zfp-accent);
        stroke-linecap: round;
        opacity: 0.55;
      }
      .wall-glass {
        stroke: color-mix(in srgb, white 85%, transparent);
        stroke-linecap: butt;
      }
      .wall-core {
        stroke: rgba(0, 0, 0, 0.35);
      }
      .room-label text {
        font-size: 12px;
        font-weight: 600;
        fill: var(--zfp-text-2);
        paint-order: stroke;
        stroke: var(--zfp-surface);
        stroke-width: 3px;
      }
      .room-label .area {
        font-size: 10.5px;
        font-weight: 500;
        fill: var(--zfp-text-3);
      }
      .handle {
        fill: var(--zfp-surface);
        stroke: var(--zfp-accent);
        stroke-width: 2px;
        cursor: move;
      }
      .link {
        stroke-linecap: round;
        opacity: 0.9;
        transition: opacity 0.2s;
      }
      .link.tree {
        stroke-dasharray: 10 6;
        animation: flow 1.6s linear infinite;
      }
      .link.sibling,
      .link.other {
        stroke-dasharray: 2 5;
        opacity: 0.55;
      }
      .link.dim,
      .lqi-tag.dim,
      .stub.dim {
        opacity: 0.12;
      }
      .link.focus {
        opacity: 1;
      }
      @keyframes flow {
        to {
          stroke-dashoffset: -32;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .link.tree {
          animation: none;
        }
        .device .pulse,
        .suggestion .halo {
          animation: none !important;
        }
      }
      .lqi-tag text {
        font-size: 10px;
        font-weight: 700;
        fill: #fff;
      }
      .stub rect {
        fill: var(--zfp-surface);
        stroke: var(--zfp-divider);
      }
      .stub text {
        font-size: 10px;
        font-weight: 700;
        fill: var(--zfp-text-2);
      }
      .device .body {
        fill: var(--zfp-surface);
        stroke-width: 3px;
        filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.25));
        transition: r 0.15s var(--zfp-ease);
      }
      .device.hover .body,
      .device.selected .body {
        r: 17px;
      }
      .device.offline {
        opacity: 0.75;
      }
      .device.missing .body {
        stroke-dasharray: 3 3;
      }
      .device .sel-ring {
        fill: none;
        stroke: var(--zfp-accent);
        stroke-width: 2.5px;
      }
      .device .pulse {
        fill: none;
        stroke: var(--zfp-accent);
        stroke-width: 3px;
        animation: pulse 1.2s ease-out infinite;
      }
      @keyframes pulse {
        from {
          r: 16px;
          opacity: 0.9;
        }
        to {
          r: 42px;
          opacity: 0;
        }
      }
      .device .badge circle {
        fill: var(--zfp-error);
      }
      .device .badge path {
        fill: #fff;
      }
      .dev-label {
        font-size: 11.5px;
        font-weight: 600;
        fill: var(--zfp-text);
        paint-order: stroke;
        stroke: var(--zfp-surface);
        stroke-width: 3.5px;
        stroke-linejoin: round;
        pointer-events: none;
      }
      .device.ghost {
        opacity: 0.7;
        pointer-events: none;
      }
      .device.ghost .body {
        stroke: var(--zfp-accent);
        stroke-dasharray: 4 3;
      }
      .suggestion .halo {
        fill: var(--zfp-accent-soft);
        stroke: var(--zfp-accent);
        stroke-dasharray: 4 4;
        animation: breathe 2.4s ease-in-out infinite;
      }
      @keyframes breathe {
        50% {
          r: 28px;
          opacity: 0.6;
        }
      }
      .suggestion .core {
        fill: var(--zfp-accent);
      }
      .suggestion path {
        fill: var(--zfp-on-accent);
      }
      .sugg-label {
        font-size: 11px;
        font-weight: 700;
        fill: var(--zfp-accent);
        paint-order: stroke;
        stroke: var(--zfp-surface);
        stroke-width: 3px;
      }
      .rubber {
        stroke: var(--zfp-accent);
        stroke-width: 2px;
        stroke-dasharray: 6 4;
      }
      .rubber.wall-preview {
        stroke-width: 4px;
        stroke-dasharray: none;
        opacity: 0.7;
      }
      .chain-pt {
        fill: var(--zfp-accent);
      }
      .snap {
        fill: none;
        stroke: var(--zfp-accent);
        stroke-width: 2px;
      }
      .snap.grid {
        fill: var(--zfp-accent);
        stroke: none;
        opacity: 0.7;
      }
      .room-preview {
        fill: var(--zfp-accent-soft);
        stroke: var(--zfp-accent);
        stroke-width: 2px;
        stroke-dasharray: 6 4;
      }
      .close-target {
        fill: none;
        stroke: var(--zfp-accent);
        stroke-width: 2px;
      }
      .marquee {
        fill: var(--zfp-accent-soft);
        stroke: var(--zfp-accent);
        stroke-width: 1px;
        stroke-dasharray: 4 3;
      }
      .dim rect {
        fill: var(--zfp-text);
        opacity: 0.85;
      }
      .dim text {
        fill: var(--zfp-surface);
        font-size: 11.5px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .scale-bar {
        position: absolute;
        left: 16px;
        bottom: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        font-weight: 600;
        color: var(--zfp-text-2);
        pointer-events: none;
      }
      .scale-bar .bar {
        height: 6px;
        border: 2px solid var(--zfp-text-2);
        border-top: none;
        box-sizing: border-box;
      }
    `]}};customElements.get(`zfp-canvas`)||customElements.define(`zfp-canvas`,kr);var Z=`zigbee_floorplan`,Ar=4096,jr=class{constructor(e){this.hass=e,this.blobUrls=/* @__PURE__ */ new Map}info(){return this.hass().callWS({type:`${Z}/info`})}getProject(){return this.hass().callWS({type:`${Z}/project/get`})}async saveProject(e,t){return(await this.hass().callWS({type:`${Z}/project/save`,project:e,base_revision:t})).revision}subscribeNetwork(e){return this.hass().connection.subscribeMessage(t=>e(t.state),{type:`${Z}/network/subscribe`})}subscribeProject(e){return this.hass().connection.subscribeMessage(t=>e(t.revision,t.project),{type:`${Z}/project/subscribe`})}scan(){return this.hass().callWS({type:`${Z}/network/scan`})}deleteImage(e){return this.blobUrls.delete(e),this.hass().callWS({type:`${Z}/image/delete`,image_id:e})}async uploadImage(e,t){let n=new FormData;n.append(`file`,e,t);let r=await this.hass().fetchWithAuth(`/api/${Z}/images`,{method:`POST`,body:n});if(!r.ok){let e=`${r.status}`;try{e=(await r.json()).message??e}catch{}throw Error(e)}return(await r.json()).id}imageUrl(e){let t=this.blobUrls.get(e);return t||(t=this.hass().fetchWithAuth(`/api/${Z}/images/${e}`).then(async e=>{if(!e.ok)throw Error(`${e.status}`);return URL.createObjectURL(await e.blob())}),t.catch(()=>this.blobUrls.delete(e)),this.blobUrls.set(e,t)),t}};async function Mr(e){let t=await createImageBitmap(e),{width:n,height:r}=t,i=Math.min(1,Ar/Math.max(n,r)),a=[`image/png`,`image/jpeg`,`image/webp`].includes(e.type);if(i===1&&a)return t.close(),{blob:e,width:n,height:r,name:e.name};let o=Math.round(n*i),s=Math.round(r*i),c=document.createElement(`canvas`);c.width=o,c.height=s;let l=c.getContext(`2d`);return l.imageSmoothingQuality=`high`,l.drawImage(t,0,0,o,s),t.close(),{blob:await new Promise((e,t)=>c.toBlob(n=>n?e(n):t(/* @__PURE__ */ Error(`encode failed`)),`image/png`)),width:o,height:s,name:e.name.replace(/\.[^.]+$/,``)+`.png`}}var Nr=class{constructor(e,t=200){this.current=e,this.limit=t,this.past=[],this.future=[]}get present(){return this.current}get canUndo(){return this.past.length>0}get canRedo(){return this.future.length>0}push(e){e!==this.current&&(this.past.push(this.current),this.past.length>this.limit&&this.past.shift(),this.current=e,this.future=[])}undo(){let e=this.past.pop();return e!==void 0&&(this.future.push(this.current),this.current=e),this.current}redo(){let e=this.future.pop();return e!==void 0&&(this.past.push(this.current),this.current=e),this.current}reset(e){this.current=e,this.past=[],this.future=[]}},Pr={"app.title":`Zigbee Floorplan`,"mode.view":`View`,"mode.edit":`Edit`,"tool.select":`Select`,"tool.wall":`Walls`,"tool.room":`Rooms`,"tool.calibrate":`Scale image`,"tool.measure":`Measure`,"tool.pan":`Pan`,"hint.select":`Click to select · drag to move · Delete removes · Shift+click adds to selection`,"hint.wall":`Click to add points · double-click, Enter or Esc to finish · hold Shift to disable snapping`,"hint.room":`Click each corner · click the first point (or Enter) to close the room`,"hint.calibrate":`Draw a line over a distance you know on the background image`,"hint.measure":`Click two points to measure`,"hint.pan":`Drag to move around · scroll or pinch to zoom`,"hint.place":`Click on the plan to place {name} · Esc to cancel`,"hint.switch_to_edit":`Switch to Edit (top right) to place or move devices and walls.`,"action.undo":`Undo`,"action.redo":`Redo`,"action.fit":`Fit to view`,"action.zoom_in":`Zoom in`,"action.zoom_out":`Zoom out`,"action.scan":`Scan network`,"action.scanning":`Scanning…`,"action.export":`Export plan (JSON)`,"action.import":`Import plan (JSON)`,"action.delete":`Delete`,"action.duplicate":`Duplicate`,"action.cancel":`Cancel`,"action.ok":`OK`,"action.add_floor":`Add floor`,"action.remove":`Remove`,"action.place":`Place`,"action.unplace":`Remove from plan`,"action.open_in_ha":`Open device`,"action.upload_image":`Upload image`,"action.replace_image":`Replace`,"action.calibrate_image":`Set scale`,"action.close":`Close`,"action.more":`More`,"action.menu":`Menu`,"action.locate":`Locate`,"action.reload":`Reload`,"save.saved":`Saved`,"save.saving":`Saving…`,"save.dirty":`Unsaved`,"save.error":`Save failed`,"save.conflict":`Reloaded`,"save.readonly":`View only`,"layers.title":`Layers`,"layers.heatmap":`Coverage`,"layers.links":`Links`,"layers.labels":`Labels`,"layers.background":`Image`,"layers.suggestions":`Suggestions`,"links.tree":`Routes`,"links.all":`All neighbors`,"floor.default_name":`Floor {n}`,"floor.ground":`Ground floor`,"floor.name":`Name`,"floor.level":`Level`,"floor.elevation":`Elevation (m)`,"floor.height":`Ceiling height (m)`,"floor.slab":`Floor slab`,"floor.background":`Background image`,"floor.opacity":`Opacity`,"floor.visible":`Show image`,"floor.no_background":`Trace over a photo or blueprint of your floor plan.`,"floor.scale_hint":`Use “Set scale” and draw over a known length so walls match real meters.`,"floor.delete_confirm":`Delete “{name}”? Walls, rooms and device positions on this floor will be removed.`,"floor.settings":`Floor`,"tab.inspector":`Details`,"tab.devices":`Devices`,"tab.coverage":`Coverage`,"tab.floor":`Floor`,"inspector.empty":`Select a wall, room or device on the plan to edit it.`,"inspector.walls":`{n} walls`,"inspector.wall":`Wall`,"inspector.room":`Room`,"inspector.material":`Material`,"inspector.thickness":`Thickness (m)`,"inspector.length":`Length`,"inspector.room_name":`Room name`,"inspector.area":`Area`,"inspector.height":`Height above floor (m)`,"inspector.tx":`Transmit power (dBm)`,"inspector.tx_default":`Default ({value} dBm)`,"inspector.attenuation":`{db} dB per wall`,"devices.search":`Search devices`,"devices.placed":`On this plan`,"devices.other_floor":`On other floors`,"devices.unplaced":`Not placed`,"devices.missing":`No longer in network`,"devices.none":`No Zigbee devices reported yet.`,"devices.drag_hint":`Drag a device onto the plan, or tap Place.`,"devices.offline":`Offline`,"devices.all_placed":`All devices are placed.`,"type.Coordinator":`Coordinator`,"type.Router":`Router`,"type.EndDevice":`End device`,"type.Unknown":`Unknown`,"coverage.calibration":`Calibration`,"coverage.calibrated":`Fitted to {n} real link measurements`,"coverage.not_calibrated":`Place devices and scan the network: at least 3 real link measurements are needed to calibrate.`,"coverage.auto_calibrate":`Calibrate with real link quality`,"coverage.exponent":`Path-loss exponent`,"coverage.offset":`Offset`,"coverage.rmse":`Fit error`,"coverage.legend":`Signal`,"coverage.suggestions":`Router suggestions`,"coverage.suggestion":`Add a router here`,"coverage.gain":`+{area} m² good coverage`,"coverage.fixes":`Improves {n} devices`,"coverage.no_suggestions":`Coverage looks good — no extra routers needed on this floor.`,"coverage.weak_devices":`Weak devices`,"coverage.weak_links":`Weak links`,"coverage.none_weak":`None 🎉`,"coverage.computing":`Computing coverage…`,"coverage.need_coordinator":`Place your coordinator or a router to see coverage.`,"coverage.estimated":`Estimated`,"band.excellent":`Excellent`,"band.good":`Good`,"band.fair":`Fair`,"band.weak":`Weak`,"band.none":`No signal`,"empty.title":`Map your Zigbee network`,"empty.body":`Draw your floors, mark wall materials and drop your devices to see real mesh links and estimated coverage.`,"empty.cta":`Create first floor`,"empty.readonly":`No floor plan yet. An administrator can create one.`,"banner.no_data":`No Zigbee2MQTT data on topic “{topic}”. Check the integration options.`,"banner.bridge_offline":`Zigbee2MQTT bridge is offline.`,"banner.readonly":`View only — an administrator can edit this plan.`,"banner.not_loaded":`Zigbee Floorplan integration is not loaded.`,"banner.update":`A new version of Zigbee Floorplan is installed.`,"banner.scan_hint":`Scan the network to draw real mesh links.`,"scan.never":`Never scanned`,"scan.last":`Scanned {time}`,"scan.failed":`Last scan failed`,"detail.model":`Model`,"detail.ieee":`IEEE`,"detail.power":`Power`,"detail.lqi":`Link quality`,"detail.estimated":`Estimated signal`,"detail.last_seen":`Last seen`,"detail.battery":`Battery`,"detail.neighbors":`Neighbors`,"detail.no_neighbors":`No neighbor data — scan the network.`,"detail.parent":`parent`,"detail.child":`child`,"detail.sibling":`neighbor`,"detail.not_placed":`Not on the plan`,"detail.floor":`Floor`,"calibrate.prompt":`Real length of the line you drew (meters)`,"import.confirm":`Replace the current plan with the imported file? You can undo this.`,"import.error":`This file is not a valid floor plan export.`,"notice.conflict":`The plan was changed elsewhere — loaded the latest version.`,"notice.save_error":`Could not save: {message}`,"notice.scan_error":`Network scan failed: {message}`,"notice.remote_update":`Plan updated from another device.`,"notice.upload_error":`Image upload failed: {message}`,"notice.scan_started":`Scanning the mesh — this can take a minute.`,"material.drywall":`Drywall`,"material.wood":`Wood / door`,"material.glass":`Glass`,"material.glass_lowe":`Low-E glass`,"material.brick":`Brick`,"material.block":`Concrete block`,"material.concrete":`Concrete`,"material.reinforced":`Reinforced concrete`,"material.metal":`Metal`,"material.slab_wood":`Wood floor`,"material.slab_concrete":`Concrete slab`,"time.just_now":`just now`,"time.minutes":`{n} min ago`,"time.hours":`{n} h ago`,"time.days":`{n} d ago`,"card.no_plan":`No floor plan yet. Open Zigbee Floorplan in the sidebar to create one.`,"card.floor":`Floor`,"card.height":`Height (px)`,"card.layers":`Layers`,"card.show_tabs":`Show floor tabs`,"card.links":`Links`,"card.title":`Title`,"card.building":`Building`,"building.default_name":`Building {n}`,"building.add":`Add building`,"building.section":`Building`,"building.name":`Building name`,"building.color":`Color`,"building.position":`Position on the site (m)`,"building.delete":`Delete building`,"building.delete_confirm":`Delete “{name}” with all its floors, walls and device positions?`,"building.floors":`{n} floors`,"building.floor_one":`1 floor`,"site.all":`Whole site`,"site.level":`Level {n}`,"site.hide":`Hide on the site`,"site.show":`Show on the site`,"site.open":`Open`,"site.no_level":`No floor at this level`,"site.hint":`Show or hide buildings on the site and drag them on the plan to place them relative to each other.`,"hint.site":`Drag a building to move it · click its name to open it`,"tab.buildings":`Buildings`},Fr={en:Pr,es:{"mode.view":`Ver`,"mode.edit":`Editar`,"tool.select":`Seleccionar`,"tool.wall":`Paredes`,"tool.room":`Habitaciones`,"tool.calibrate":`Escalar imagen`,"tool.measure":`Medir`,"tool.pan":`Mover`,"hint.select":`Clic para seleccionar · arrastra para mover · Supr elimina · Shift+clic agrega a la selección`,"hint.wall":`Clic para agregar puntos · doble clic, Enter o Esc para terminar · mantén Shift para desactivar el ajuste`,"hint.room":`Clic en cada esquina · clic en el primer punto (o Enter) para cerrar`,"hint.calibrate":`Dibuja una línea sobre una distancia conocida en la imagen de fondo`,"hint.measure":`Haz clic en dos puntos para medir`,"hint.pan":`Arrastra para moverte · rueda o pellizca para hacer zoom`,"hint.place":`Haz clic en el plano para ubicar {name} · Esc para cancelar`,"hint.switch_to_edit":`Cambia a Editar (arriba a la derecha) para colocar o mover dispositivos y paredes.`,"action.undo":`Deshacer`,"action.redo":`Rehacer`,"action.fit":`Ajustar a la vista`,"action.zoom_in":`Acercar`,"action.zoom_out":`Alejar`,"action.scan":`Escanear red`,"action.scanning":`Escaneando…`,"action.export":`Exportar plano (JSON)`,"action.import":`Importar plano (JSON)`,"action.delete":`Eliminar`,"action.duplicate":`Duplicar`,"action.cancel":`Cancelar`,"action.ok":`Aceptar`,"action.add_floor":`Agregar piso`,"action.remove":`Quitar`,"action.place":`Ubicar`,"action.unplace":`Quitar del plano`,"action.open_in_ha":`Abrir dispositivo`,"action.upload_image":`Subir imagen`,"action.replace_image":`Reemplazar`,"action.calibrate_image":`Fijar escala`,"action.close":`Cerrar`,"action.more":`Más`,"action.menu":`Menú`,"action.locate":`Localizar`,"action.reload":`Recargar`,"save.saved":`Guardado`,"save.saving":`Guardando…`,"save.dirty":`Sin guardar`,"save.error":`Error al guardar`,"save.conflict":`Recargado`,"save.readonly":`Solo lectura`,"layers.title":`Capas`,"layers.heatmap":`Cobertura`,"layers.links":`Enlaces`,"layers.labels":`Etiquetas`,"layers.background":`Imagen`,"layers.suggestions":`Sugerencias`,"links.tree":`Rutas`,"links.all":`Todos los vecinos`,"floor.default_name":`Piso {n}`,"floor.ground":`Planta baja`,"floor.name":`Nombre`,"floor.level":`Nivel`,"floor.elevation":`Elevación (m)`,"floor.height":`Altura del techo (m)`,"floor.slab":`Losa del piso`,"floor.background":`Imagen de fondo`,"floor.opacity":`Opacidad`,"floor.visible":`Mostrar imagen`,"floor.no_background":`Calca sobre una foto o plano de tu casa.`,"floor.scale_hint":`Usa “Fijar escala” y dibuja sobre una longitud conocida para que las paredes coincidan con metros reales.`,"floor.delete_confirm":`¿Eliminar “{name}”? Se borrarán paredes, habitaciones y posiciones de dispositivos de este piso.`,"floor.settings":`Piso`,"tab.inspector":`Detalles`,"tab.devices":`Dispositivos`,"tab.coverage":`Cobertura`,"tab.floor":`Piso`,"inspector.empty":`Selecciona una pared, habitación o dispositivo en el plano para editarlo.`,"inspector.walls":`{n} paredes`,"inspector.wall":`Pared`,"inspector.room":`Habitación`,"inspector.material":`Material`,"inspector.thickness":`Grosor (m)`,"inspector.length":`Longitud`,"inspector.room_name":`Nombre`,"inspector.area":`Área`,"inspector.height":`Altura sobre el piso (m)`,"inspector.tx":`Potencia de transmisión (dBm)`,"inspector.tx_default":`Predeterminada ({value} dBm)`,"inspector.attenuation":`{db} dB por pared`,"devices.search":`Buscar dispositivos`,"devices.placed":`En este plano`,"devices.other_floor":`En otros pisos`,"devices.unplaced":`Sin ubicar`,"devices.missing":`Ya no están en la red`,"devices.none":`Aún no hay dispositivos Zigbee reportados.`,"devices.drag_hint":`Arrastra un dispositivo al plano o toca Ubicar.`,"devices.offline":`Desconectado`,"devices.all_placed":`Todos los dispositivos están ubicados.`,"type.Coordinator":`Coordinador`,"type.Router":`Router`,"type.EndDevice":`Dispositivo final`,"type.Unknown":`Desconocido`,"coverage.calibration":`Calibración`,"coverage.calibrated":`Ajustado con {n} mediciones reales de enlaces`,"coverage.not_calibrated":`Ubica dispositivos y escanea la red: se necesitan al menos 3 mediciones reales para calibrar.`,"coverage.auto_calibrate":`Calibrar con la calidad real de los enlaces`,"coverage.exponent":`Exponente de pérdida`,"coverage.offset":`Ajuste`,"coverage.rmse":`Error de ajuste`,"coverage.legend":`Señal`,"coverage.suggestions":`Sugerencias de routers`,"coverage.suggestion":`Agrega un router aquí`,"coverage.gain":`+{area} m² con buena cobertura`,"coverage.fixes":`Mejora {n} dispositivos`,"coverage.no_suggestions":`La cobertura se ve bien: no hacen falta routers extra en este piso.`,"coverage.weak_devices":`Dispositivos débiles`,"coverage.weak_links":`Enlaces débiles`,"coverage.none_weak":`Ninguno 🎉`,"coverage.computing":`Calculando cobertura…`,"coverage.need_coordinator":`Ubica el coordinador o un router para ver la cobertura.`,"coverage.estimated":`Estimado`,"band.excellent":`Excelente`,"band.good":`Buena`,"band.fair":`Regular`,"band.weak":`Débil`,"band.none":`Sin señal`,"empty.title":`Visualiza tu red Zigbee`,"empty.body":`Dibuja tus pisos, define los materiales de las paredes y coloca tus dispositivos para ver los enlaces reales y la cobertura estimada.`,"empty.cta":`Crear el primer piso`,"empty.readonly":`Aún no hay plano. Un administrador puede crearlo.`,"banner.no_data":`No hay datos de Zigbee2MQTT en el topic “{topic}”. Revisa las opciones de la integración.`,"banner.bridge_offline":`El bridge de Zigbee2MQTT está desconectado.`,"banner.readonly":`Solo lectura: un administrador puede editar este plano.`,"banner.not_loaded":`La integración Zigbee Floorplan no está cargada.`,"banner.update":`Hay una nueva versión de Zigbee Floorplan instalada.`,"banner.scan_hint":`Escanea la red para dibujar los enlaces reales.`,"scan.never":`Nunca escaneada`,"scan.last":`Escaneada {time}`,"scan.failed":`Falló el último escaneo`,"detail.model":`Modelo`,"detail.power":`Alimentación`,"detail.lqi":`Calidad de enlace`,"detail.estimated":`Señal estimada`,"detail.last_seen":`Visto por última vez`,"detail.battery":`Batería`,"detail.neighbors":`Vecinos`,"detail.no_neighbors":`Sin datos de vecinos: escanea la red.`,"detail.parent":`padre`,"detail.child":`hijo`,"detail.sibling":`vecino`,"detail.not_placed":`No está en el plano`,"detail.floor":`Piso`,"calibrate.prompt":`Longitud real de la línea dibujada (metros)`,"import.confirm":`¿Reemplazar el plano actual con el archivo importado? Puedes deshacerlo.`,"import.error":`Este archivo no es una exportación válida de plano.`,"notice.conflict":`El plano cambió en otro lugar: se cargó la última versión.`,"notice.save_error":`No se pudo guardar: {message}`,"notice.scan_error":`Falló el escaneo de la red: {message}`,"notice.remote_update":`Plano actualizado desde otro dispositivo.`,"notice.upload_error":`Falló la subida de la imagen: {message}`,"notice.scan_started":`Escaneando la red: puede tardar un minuto.`,"material.drywall":`Tablaroca / drywall`,"material.wood":`Madera / puerta`,"material.glass":`Vidrio`,"material.glass_lowe":`Vidrio Low-E`,"material.brick":`Ladrillo`,"material.block":`Bloque de concreto`,"material.concrete":`Concreto`,"material.reinforced":`Concreto armado`,"material.metal":`Metal`,"material.slab_wood":`Piso de madera`,"material.slab_concrete":`Losa de concreto`,"time.just_now":`justo ahora`,"time.minutes":`hace {n} min`,"time.hours":`hace {n} h`,"time.days":`hace {n} d`,"card.no_plan":`Aún no hay plano. Abre Zigbee Floorplan en la barra lateral para crearlo.`,"card.floor":`Piso`,"card.height":`Altura (px)`,"card.layers":`Capas`,"card.show_tabs":`Mostrar pestañas de pisos`,"card.links":`Enlaces`,"card.title":`Título`,"card.building":`Edificio`,"building.default_name":`Edificio {n}`,"building.add":`Agregar edificio`,"building.section":`Edificio`,"building.name":`Nombre del edificio`,"building.color":`Color`,"building.position":`Posición en el sitio (m)`,"building.delete":`Eliminar edificio`,"building.delete_confirm":`¿Eliminar “{name}” con todos sus pisos, paredes y posiciones de dispositivos?`,"building.floors":`{n} pisos`,"building.floor_one":`1 piso`,"site.all":`Todo el sitio`,"site.level":`Nivel {n}`,"site.hide":`Ocultar en el sitio`,"site.show":`Mostrar en el sitio`,"site.open":`Abrir`,"site.no_level":`Sin piso en este nivel`,"site.hint":`Muestra u oculta edificios en el sitio y arrástralos en el plano para ubicarlos entre sí.`,"hint.site":`Arrastra un edificio para moverlo · clic en su nombre para abrirlo`,"tab.buildings":`Edificios`}};function Ir(e){let t=Fr[(e??`en`).toLowerCase().split(`-`)[0]]??Pr;return(e,n)=>{let r=t[e]??Pr[e]??e;if(n)for(let[e,t]of Object.entries(n))r=r.replaceAll(`{${e}}`,String(t));return r}}function Lr(e,t,n=Date.now()){if(!t)return null;let r=Date.parse(t);if(Number.isNaN(r))return null;let i=Math.round((n-r)/6e4);if(i<1)return e(`time.just_now`);if(i<60)return e(`time.minutes`,{n:i});let a=Math.round(i/60);return a<48?e(`time.hours`,{n:a}):e(`time.days`,{n:Math.round(a/24)})}var Rr=e=>!!e&&typeof e==`object`&&typeof e.code==`string`,zr=5e3,Br=class e{static{this.instances=/* @__PURE__ */ new WeakMap}static for(t){let n=this.instances.get(t.connection);if(!n){let r=t,i=new jr(()=>r);n=new e(i),n.hassSetter=e=>r=e,this.instances.set(t.connection,n)}return n.setHass(t),n}constructor(e,t=800){this.api=e,this.saveDelayMs=t,this.ready=!1,this.loadError=null,this.network=null,this.info=null,this.revision=0,this.saveState=`idle`,this.hassSetter=()=>{},this.history=new Nr(ft()),this.listeners=/* @__PURE__ */ new Set,this.noticeListeners=/* @__PURE__ */ new Set,this.unsubs=[],this.connecting=null,this.saving=null,this.persisted=null}setHass(e){this.hassSetter(e),this.defaultBuildingName=Ir(e.locale?.language??e.language)(`building.default_name`,{n:1})}get project(){return this.history.present}get canUndo(){return this.history.canUndo}get canRedo(){return this.history.canRedo}get canEdit(){return!!this.info?.is_admin&&this.ready}get dirty(){return this.persisted!==this.project}attach(e){return clearTimeout(this.detachTimer),this.listeners.add(e),this.connecting||=this.connect(),()=>{this.listeners.delete(e),this.listeners.size||(this.detachTimer=setTimeout(()=>this.disconnect(),zr))}}onNotice(e){return this.noticeListeners.add(e),()=>this.noticeListeners.delete(e)}emit(){for(let e of[...this.listeners])e()}notice(e){for(let t of[...this.noticeListeners])t(e)}async connect(){try{this.info=await this.api.info();let e=await this.api.getProject();this.adopt(e.revision,e.project),this.unsubs.push(await this.api.subscribeNetwork(e=>{this.network=e,this.emit()}),await this.api.subscribeProject((e,t)=>this.onRemoteProject(e,t))),this.ready=!0,this.loadError=null}catch(e){this.loadError=Rr(e)?e.message:String(e),this.connecting=null}this.emit()}async refreshInfo(){try{this.info=await this.api.info(),this.emit()}catch{}}disconnect(){let e=this.unsubs;this.unsubs=[],this.connecting=null,this.ready=!1;for(let t of e)t().catch(()=>void 0)}adopt(e,t){let n=qt(t,{defaultBuildingName:this.defaultBuildingName});this.revision=e,this.history.reset(n),this.persisted=n,this.saveState=`idle`}onRemoteProject(e,t){e<=this.revision||this.dirty||this.saving||(this.adopt(e,t),this.notice({kind:`remote_update`}),this.emit())}apply(e){if(!this.canEdit)return;let t=e(this.project);t!==this.project&&(this.history.push(t),this.markDirty())}undo(){this.canEdit&&this.history.canUndo&&(this.history.undo(),this.markDirty())}redo(){this.canEdit&&this.history.canRedo&&(this.history.redo(),this.markDirty())}replace(e){this.apply(()=>qt(e,{defaultBuildingName:this.defaultBuildingName}))}markDirty(){this.saveState=this.dirty?`dirty`:`saved`,clearTimeout(this.saveTimer),this.dirty&&(this.saveTimer=setTimeout(()=>void this.flush(),this.saveDelayMs)),this.emit()}async flush(){if(clearTimeout(this.saveTimer),this.saving)return await this.saving,this.dirty?this.flush():void 0;if(!this.dirty)return;let e=this.project;this.saveState=`saving`,this.emit(),this.saving=(async()=>{try{this.revision=await this.api.saveProject(e,this.revision),this.persisted=e,this.saveState=this.dirty?`dirty`:`saved`}catch(e){if(Rr(e)&&e.code===`revision_conflict`){this.saveState=`conflict`;let e=await this.api.getProject();this.adopt(e.revision,e.project),this.notice({kind:`conflict`})}else this.saveState=`error`,this.notice({kind:`save_error`,message:Rr(e)?e.message:String(e)})}finally{this.saving=null,this.emit()}})(),await this.saving,this.dirty&&this.saveState===`dirty`&&(this.saveTimer=setTimeout(()=>void this.flush(),this.saveDelayMs))}async scan(){try{await this.api.scan()}catch(e){this.notice({kind:`scan_error`,message:Rr(e)?e.message:String(e)})}}},Vr="const e={drywall:{id:`drywall`,db:3,wall:!0,color:`#b8bcc6`,pattern:`solid`},wood:{id:`wood`,db:4,wall:!0,color:`#b98a5a`,pattern:`solid`},glass:{id:`glass`,db:3,wall:!0,color:`#7cc4e4`,pattern:`glass`},glass_lowe:{id:`glass_lowe`,db:15,wall:!0,color:`#4f8fb3`,pattern:`glass`},brick:{id:`brick`,db:8,wall:!0,color:`#c0634a`,pattern:`hatch`},block:{id:`block`,db:11,wall:!0,color:`#9a8f84`,pattern:`hatch`},concrete:{id:`concrete`,db:15,wall:!0,color:`#7d838c`,pattern:`dense`},reinforced:{id:`reinforced`,db:22,wall:!0,color:`#555b66`,pattern:`dense`},metal:{id:`metal`,db:30,wall:!0,color:`#3d4450`,pattern:`dense`},slab_wood:{id:`slab_wood`,db:8,wall:!1,color:`#b98a5a`,pattern:`solid`},slab_concrete:{id:`slab_concrete`,db:20,wall:!1,color:`#7d838c`,pattern:`dense`}};Object.values(e).filter(e=>e.wall),Object.values(e).filter(e=>!e.wall);function t(t,n){return t.materials[n]??e[n]?.db??0}const n=1e-9,r=(e,t,n)=>(t.x-e.x)*(n.y-e.y)-(t.y-e.y)*(n.x-e.x),i=(e,t,r)=>Math.min(e.x,t.x)-n<=r.x&&r.x<=Math.max(e.x,t.x)+n&&Math.min(e.y,t.y)-n<=r.y&&r.y<=Math.max(e.y,t.y)+n;function a(e,t,a,o){let s=r(a,o,e),c=r(a,o,t),l=r(e,t,a),u=r(e,t,o);return!!((s>n&&c<-1e-9||s<-1e-9&&c>n)&&(l>n&&u<-1e-9||l<-1e-9&&u>n)||Math.abs(s)<=n&&i(a,o,e)||Math.abs(c)<=n&&i(a,o,t)||Math.abs(l)<=n&&i(e,t,a)||Math.abs(u)<=n&&i(e,t,o))}function o(e,t){let n=!1;for(let r=0,i=t.length-1;r<t.length;i=r++){let a=t[r],o=t[i];a.y>e.y!=o.y>e.y&&e.x<(o.x-a.x)*(e.y-a.y)/(o.y-a.y)+a.x&&(n=!n)}return n}function s(e){if(!e.length)return null;let t=1/0,n=1/0,r=-1/0,i=-1/0;for(let a of e)a.x<t&&(t=a.x),a.y<n&&(n=a.y),a.x>r&&(r=a.x),a.y>i&&(i=a.y);return{minX:t,minY:n,maxX:r,maxY:i}}function c(e,t){return e?t?{minX:Math.min(e.minX,t.minX),minY:Math.min(e.minY,t.minY),maxX:Math.max(e.maxX,t.maxX),maxY:Math.max(e.maxY,t.maxY)}:e:t}var l=class{constructor(e,t=1){this.walls=e,this.cell=t,this.cells=/* @__PURE__ */ new Map,this.query=0,this.stamp=new Uint32Array(e.length);let n=s(e.flatMap(e=>[e.a,e.b]));this.minX=n?n.minX:0,this.minY=n?n.minY:0,this.cols=n?Math.max(1,Math.floor((n.maxX-n.minX)/t)+1):0,this.rows=n?Math.max(1,Math.floor((n.maxY-n.minY)/t)+1):0,e.forEach((e,t)=>{let n=this.col(Math.min(e.a.x,e.b.x)),r=this.col(Math.max(e.a.x,e.b.x)),i=this.row(Math.min(e.a.y,e.b.y)),a=this.row(Math.max(e.a.y,e.b.y));for(let e=i;e<=a;e++)for(let i=n;i<=r;i++){let n=e*this.cols+i,r=this.cells.get(n);r||this.cells.set(n,r=[]),r.push(t)}})}col(e){return Math.min(this.cols-1,Math.max(0,Math.floor((e-this.minX)/this.cell)))}row(e){return Math.min(this.rows-1,Math.max(0,Math.floor((e-this.minY)/this.cell)))}crossed(e,t){if(!this.walls.length)return[];++this.query===4294967295&&(this.stamp.fill(0),this.query=1);let n=[],r=this.query,i=(i,o)=>{if(i<0||o<0||i>=this.cols||o>=this.rows)return;let s=this.cells.get(o*this.cols+i);if(s)for(let i of s){if(this.stamp[i]===r)continue;this.stamp[i]=r;let o=this.walls[i];a(e,t,o.a,o.b)&&n.push(o)}},o={x0:this.minX,y0:this.minY,x1:this.minX+this.cols*this.cell,y1:this.minY+this.rows*this.cell},s=t.x-e.x,c=t.y-e.y,l=0,u=1,d=(e,t)=>{if(Math.abs(e)<1e-12)return t>=0;let n=t/e;if(e<0){if(n>u)return!1;n>l&&(l=n)}else{if(n<l)return!1;n<u&&(u=n)}return!0},f=1e-9;if(!d(-s,e.x-o.x0+f)||!d(s,o.x1-e.x+f)||!d(-c,e.y-o.y0+f)||!d(c,o.y1-e.y+f))return n;let p=e.x+s*l,m=e.y+c*l,h=e.x+s*u,g=e.y+c*u,_=Math.floor((p-this.minX)/this.cell),v=Math.floor((m-this.minY)/this.cell),y=Math.floor((h-this.minX)/this.cell),b=Math.floor((g-this.minY)/this.cell),x=s>0?1:s<0?-1:0,S=c>0?1:c<0?-1:0,C=u-l||1,w=x?this.cell/Math.abs(s*C):1/0,T=S?this.cell/Math.abs(c*C):1/0,E=(p-this.minX)/this.cell-_,D=(m-this.minY)/this.cell-v,O=x>0?(1-E)*w:x<0?E*w:1/0,k=S>0?(1-D)*T:S<0?D*T:1/0,A=(e,t)=>{for(let n=-1;n<=1;n++)for(let r=-1;r<=1;r++)i(e+r,t+n)},j=this.cols+this.rows+4;for(let e=0;e<j&&(A(_,v),_!==y||v!==b);e++)if(O<k?(_+=x,O+=w):(v+=S,k+=T),O>1+w&&k>1+T){A(_,v);break}return n}};const u=e=>-100+e*60/255;function d(e,t){return t?.applied&&e.autoCalibrate?{exponent:t.exponent,refLoss:e.refLoss1m+t.offsetDb}:{exponent:e.pathLossExponent,refLoss:e.refLoss1m}}const f=(e,t)=>({x:e.x+t.x,y:e.y+t.y});function p(e,t){return!t.x&&!t.y?e:{...e,walls:e.walls.map(e=>({...e,a:f(e.a,t),b:f(e.b,t)})),rooms:e.rooms.map(e=>({...e,points:e.points.map(e=>f(e,t))}))}}var m=class{constructor(e,t){this.floors=/* @__PURE__ */ new Map,this.stacks=/* @__PURE__ */ new Map,this.nodes=/* @__PURE__ */ new Map,this.emitters=[],this.settings=e.settings;let n=new Map((e.buildings??[]).map(e=>[e.id,{x:e.x,y:e.y}]));for(let t of[...e.floors].sort((e,t)=>e.level-t.level)){let e=this.stacks.get(t.buildingId)??[];e.push(t),this.stacks.set(t.buildingId,e)}for(let[e,t]of this.stacks){let r=n.get(e)??{x:0,y:0};t.forEach((t,n)=>{let i=p(t,r);this.floors.set(t.id,{floor:i,order:n,grid:new l(i.walls,1),buildingId:e,offset:r})})}for(let[n,r]of Object.entries(e.placements)){let e=t.get(n),i=this.floors.get(r.floorId);if(!e||!i)continue;let a={ieee:n,type:e,floorId:r.floorId,pos:f(r,i.offset),height:r.height??1,tx:r.txPower??h(this.settings,e)};this.nodes.set(n,a),(e===`Coordinator`||e===`Router`)&&this.emitters.push(a)}}offsetOf(e){return this.floors.get(e)?.offset??{x:0,y:0}}absZ(e,t){return(this.floors.get(e)?.floor.elevation??0)+t}obstruction(e,n,r,i){let a=this.floors.get(e),o=this.floors.get(r);if(!a||!o)return 0;let s=0;for(let e of o.grid.crossed(n,i))s+=t(this.settings,e.material);if(a!==o){for(let e of a.grid.crossed(n,i))s+=t(this.settings,e.material);if(a.buildingId===o.buildingId){let e=this.stacks.get(a.buildingId),n=Math.min(a.order,o.order),r=Math.max(a.order,o.order);for(let i=n+1;i<=r;i++)s+=t(this.settings,e[i].slab)}}return s}distance(e,t,n,r,i,a){let o=this.absZ(r,a)-this.absZ(e,n);return Math.max(.5,Math.hypot(i.x-t.x,i.y-t.y,o))}rssi(e,t,n,r,i){let a=this.distance(e.floorId,e.pos,e.height,t,n,r);return e.tx-i.refLoss-10*i.exponent*Math.log10(a)-this.obstruction(e.floorId,e.pos,t,n)}rssiUpperBound(e,t,n,r,i){let a=this.distance(e.floorId,e.pos,e.height,t,n,r);return e.tx-i.refLoss-10*i.exponent*Math.log10(a)}bestRssi(e,t,n,r,i){let a=-1/0;for(let o of this.emitters){if(o.ieee===i||this.rssiUpperBound(o,e,t,n,r)<=a)continue;let s=this.rssi(o,e,t,n,r);s>a&&(a=s)}return a}};function h(e,t){return t===`Unknown`?e.defaultTx.EndDevice:e.defaultTx[t]}function g(e,t){let n=[],r=[],i=e.settings.refLoss1m,a=(t,i,a)=>{if(a===null||a<=0||a>=250)return;let o=e.nodes.get(t),s=e.nodes.get(i);if(!o||!s)return;let c=e.distance(o.floorId,o.pos,o.height,s.floorId,s.pos,s.height),l=e.obstruction(o.floorId,o.pos,s.floorId,s.pos);n.push(10*Math.log10(c)),r.push(o.tx-u(a)-l)};for(let e of t)a(e.a,e.b,e.lqi_ab),a(e.b,e.a,e.lqi_ba);let o=n.length,s={applied:!1,offsetDb:0,exponent:e.settings.pathLossExponent,rmse:null,samples:o};if(o<3)return s;let c=_(n),l=_(r),d=0,f=0;for(let e=0;e<o;e++)d+=(n[e]-c)**2,f+=(n[e]-c)*(r[e]-l);let p=d>.5?f/d:e.settings.pathLossExponent;p=v(p,1.6,4);let m=v(l-p*c-i,-20,20),h=0;for(let e=0;e<o;e++)h+=(r[e]-(i+m+p*n[e]))**2;return{applied:!0,offsetDb:y(m,1),exponent:y(p,2),rmse:y(Math.sqrt(h/o),1),samples:o}}const _=e=>e.reduce((e,t)=>e+t,0)/e.length,v=(e,t,n)=>Math.min(n,Math.max(t,e)),y=(e,t)=>Math.round(e*10**t)/10**t,b=[[-100,[220,38,38,170]],[-92,[234,88,12,150]],[-84,[234,179,8,125]],[-74,[132,204,22,85]],[-62,[34,197,94,50]],[-55,[16,185,129,34]]];function x(e){if(e<=b[0][0])return[...b[0][1]];let t=b[b.length-1];if(e>=t[0])return[...t[1]];for(let t=1;t<b.length;t++){let[n,r]=b[t];if(e<=n){let[i,a]=b[t-1],o=(e-i)/(n-i);return[0,1,2,3].map(e=>Math.round(a[e]+(r[e]-a[e])*o))}}return[...t[1]]}const S=[.1,.125,.15,.2,.25,.3,.4,.5,.75,1,1.5,2];function C(e,t,n){return{x:e.originX+(t+.5)*e.cell,y:e.originY+(n+.5)*e.cell}}function w(e,t,n){let r=e.floors.get(t);if(!r)return null;let{floor:i}=r,a=i.rooms.filter(e=>e.points.length>=3),l=[...e.nodes.values()].filter(e=>e.floorId===t).map(e=>e.pos),u=a.length?s(a.flatMap(e=>e.points)):s(i.walls.flatMap(e=>[e.a,e.b]));if(a.length||(u=c(u,s(l))),!u||!e.emitters.length)return null;let d=+!a.length,f=u.minX-d,p=u.minY-d,m=Math.max(1,u.maxX-u.minX+2*d),h=Math.max(1,u.maxY-u.minY+2*d),g=Math.max(.1,Math.sqrt(m*h/4e4)),_=S.find(e=>e>=g)??Math.ceil(g),v=Math.ceil(m/_),y=Math.ceil(h/_),b={floorId:t,originX:f,originY:p,cell:_,cols:v,rows:y,values:new Float32Array(v*y),mask:new Uint8Array(v*y)};for(let r=0;r<y;r++)for(let i=0;i<v;i++){let s=r*v+i,c=C(b,i,r),l=!a.length||a.some(e=>o(c,e.points));b.mask[s]=+!!l,b.values[s]=l?e.bestRssi(t,c,1,n):-1/0}return b}function T(e,t,n,r,i=3){let a=[];for(let e=0;e<n.mask.length;e++)n.mask[e]&&a.push(e);if(!a.length)return[];let o=n.cell*n.cell,s=Math.max(1,Math.ceil(Math.sqrt(a.length/2500))),c=Math.max(Math.max(1,Math.round(1/n.cell)),Math.ceil(Math.sqrt(a.length/400))),l=[],u=[];for(let e of a){let t=e%n.cols,r=Math.floor(e/n.cols);t%s===0&&r%s===0&&l.push({pt:C(n,t,r),value:n.values[e],weight:o*s*s}),t%c===Math.floor(c/2)&&r%c===Math.floor(c/2)&&u.push({pt:C(n,t,r),value:n.values[e],weight:0})}let d=[...e.nodes.values()].filter(e=>e.type===`EndDevice`||e.type===`Unknown`).map(t=>({node:t,value:e.bestRssi(t.floorId,t.pos,t.height,r)})),f=h(e.settings,`Router`),p=[],m=[];for(let n=0;n<i;n++){let i=null;for(let a of u){if(a.value<-80)continue;let o={ieee:`__suggest_${n}`,type:`Router`,floorId:t,pos:a.pt,height:1,tx:f},s=0;for(let n of l)n.value>=-85||e.rssiUpperBound(o,t,n.pt,1,r)<-85||e.rssi(o,t,n.pt,1,r)>=-85&&(s+=n.weight);let c=[];for(let t of d)t.value>=-85||e.rssi(o,t.node.floorId,t.node.pos,t.node.height,r)>=-85&&c.push(t.node.ieee);let u=s+c.length*10;(!i||u>i.score)&&(i={cand:a,score:u,area:s,fixed:c})}if(!i||i.score<2)break;let a={ieee:`__suggest_${n}`,type:`Router`,floorId:t,pos:i.cand.pt,height:1,tx:f};p.push(a),m.push({pos:i.cand.pt,floorId:t,gainArea:Math.round(i.area*10)/10,fixedDevices:i.fixed,rssiFromMesh:Math.round(i.cand.value)});let o=(t,n,i,o)=>Math.max(o,e.rssi(a,n,t,i,r));for(let e of l)e.value=o(e.pt,t,1,e.value);for(let e of u)e.value=o(e.pt,t,1,e.value);for(let e of d)e.value=o(e.node.pos,e.node.floorId,e.node.height,e.value)}return m}function E(e){let t=performance.now(),n=new Map(e.devices.map(e=>[e.ieee,e.type])),r=new m(e.project,n),i=g(r,e.links),a=d(e.project.settings,i),o={};for(let e of r.nodes.values()){let t=r.bestRssi(e.floorId,e.pos,e.height,a,e.ieee);Number.isFinite(t)&&(o[e.ieee]=Math.round(t))}let s=[],c=[];for(let t of e.floorIds){let n=w(r,t,a);if(!n)continue;let i=new Uint8ClampedArray(n.cols*n.rows*4);for(let e=0;e<n.values.length;e++)n.mask[e]&&i.set(x(n.values[e]),e*4);s.push({floorId:n.floorId,originX:n.originX,originY:n.originY,cell:n.cell,cols:n.cols,rows:n.rows,rgba:i,values:n.values}),e.suggest&&c.push(...T(r,t,n,a))}return{floorIds:e.floorIds,heats:s,calibration:i,suggestions:c,deviceRssi:o,elapsedMs:Math.round(performance.now()-t)}}self.onmessage=e=>{let{id:t,req:n}=e.data;try{let e=E(n),r=e.heats.flatMap(e=>[e.rgba.buffer,e.values.buffer]);self.postMessage({id:t,result:e},r)}catch(e){self.postMessage({id:t,error:String(e)})}};",Hr=typeof self<`u`&&self.Blob&&new Blob([`URL.revokeObjectURL(import.meta.url);`,Vr],{type:`text/javascript;charset=utf-8`});function Ur(e){let t;try{if(t=Hr&&(self.URL||self.webkitURL).createObjectURL(Hr),!t)throw``;let n=new Worker(t,{type:`module`,name:e?.name});return n.addEventListener(`error`,()=>{(self.URL||self.webkitURL).revokeObjectURL(t)}),n}catch{return new Worker(`data:text/javascript;charset=utf-8,`+encodeURIComponent(Vr),{type:`module`,name:e?.name})}}var Wr=class{constructor(e,t=e=>console.warn(`[zigbee-floorplan] RF`,e),n=150){this.onResult=e,this.onError=t,this.debounceMs=n,this.worker=null,this.seq=0,this.busy=!1,this.pending=null,this.lastKey=``}request(e){let t=JSON.stringify(e);t!==this.lastKey&&(this.lastKey=t,clearTimeout(this.timer),this.timer=setTimeout(()=>{this.pending=e,this.pump()},this.debounceMs))}invalidate(){this.lastKey=``}dispose(){clearTimeout(this.timer),this.worker?.terminate(),this.worker=null}ensureWorker(){return this.worker||(this.worker=new Ur,this.worker.onmessage=e=>{this.busy=!1,e.data.result?this.onResult(e.data.result):e.data.error&&this.onError(e.data.error),this.pump()},this.worker.onerror=e=>{this.busy=!1,this.onError(e.message),this.pump()}),this.worker}pump(){if(this.busy||!this.pending)return;let e=this.pending;this.pending=null,this.busy=!0,this.ensureWorker().postMessage({id:++this.seq,req:e})}},Gr=class extends A{static{this.properties={device:{attribute:!1},placement:{attribute:!1},network:{attribute:!1},floors:{attribute:!1},rssi:{attribute:!1},t:{attribute:!1},closable:{type:Boolean},editable:{type:Boolean}}}constructor(){super(),this.floors=[],this.network=null,this.closable=!1,this.editable=!1}fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}neighbors(){let e=this.device,t=new Map((this.network?.devices??[]).map(e=>[e.ieee,e]));return(this.network?.links??[]).filter(t=>t.a===e.ieee||t.b===e.ieee).map(n=>{let r=n.a===e.ieee?n.b:n.a,i=n.relationship===`tree`?n.parent===r?`detail.parent`:`detail.child`:`detail.sibling`;return{link:n,other:t.get(r),ieee:r,role:i}}).sort((e,t)=>(t.link.lqi??-1)-(e.link.lqi??-1))}render(){let e=this.device;if(!e)return D;let t=this.t,n=Jn(e,this.rssi),r=this.floors.find(e=>e.id===this.placement?.floorId),i=this.neighbors(),a=Lr(t,e.last_seen);return w`
      <div class="head">
        <div class="avatar" style="--c:${Gn[e.type]};--h:${qn[n]}">${q(Kn[e.type],24)}</div>
        <div class="title">
          <h3>${e.name}</h3>
          <div class="sub">${t(`type.${e.type}`)}${e.vendor?w` · ${e.vendor}`:D}</div>
        </div>
        ${this.closable?w`<button class="icon-btn" @click=${()=>this.fire(`zfp-close`)} aria-label=${t(`action.close`)}>
              ${q(on)}
            </button>`:D}
      </div>

      <div class="stats">
        <div class="stat">
          <span class="k">${t(`detail.lqi`)}</span>
          <span class="v" style="color:${Yn(e.lqi)}">${e.lqi??`—`}</span>
        </div>
        <div class="stat">
          <span class="k">${t(`detail.estimated`)}</span>
          <span class="v">${this.rssi===void 0?`—`:w`${this.rssi}<small> dBm</small>`}</span>
          ${this.rssi===void 0?D:w`<span class="band">${t(`band.${Xt(this.rssi)}`)}</span>`}
        </div>
        ${e.battery===null?D:w`<div class="stat">
              <span class="k">${t(`detail.battery`)}</span>
              <span class="v" style=${e.battery<=15?`color:var(--zfp-error)`:``}>${e.battery}<small>%</small></span>
            </div>`}
      </div>

      <dl>
        ${e.model?w`<dt>${t(`detail.model`)}</dt><dd>${e.model}</dd>`:D}
        <dt>${t(`detail.ieee`)}</dt><dd class="mono">${e.ieee}</dd>
        ${e.power_source?w`<dt>${t(`detail.power`)}</dt><dd>${e.power_source}</dd>`:D}
        ${a?w`<dt>${t(`detail.last_seen`)}</dt><dd>${a}</dd>`:D}
        <dt>${t(`detail.floor`)}</dt><dd>${r?r.name:t(`detail.not_placed`)}</dd>
      </dl>

      <div class="section-title">${t(`detail.neighbors`)}</div>
      ${i.length?w`<ul class="neighbors">
            ${i.map(e=>w`<li
                @mouseenter=${()=>this.fire(`zfp-highlight`,{ieee:e.ieee})}
                @mouseleave=${()=>this.fire(`zfp-highlight`,{ieee:null})}
                @click=${()=>this.fire(`zfp-open-device`,{ieee:e.ieee})}
              >
                <span class="dot" style="background:${Gn[e.other?.type??`Unknown`]}"></span>
                <span class="name">${e.other?.name??e.ieee}</span>
                <span class="role">${t(e.role)}</span>
                <span class="lqi" style="background:${Yn(e.link.lqi)}">${e.link.lqi??`?`}</span>
              </li>`)}
          </ul>`:w`<p class="muted small">${t(`detail.no_neighbors`)}</p>`}

      <div class="actions">
        ${this.placement?w`<button class="btn small" @click=${()=>this.fire(`zfp-locate`,{ieee:e.ieee})}>
              ${q(cn,16)} ${t(`action.locate`)}
            </button>`:this.editable?w`<button class="btn small primary" @click=${()=>this.fire(`zfp-place`,{ieee:e.ieee})}>
                ${t(`action.place`)}
              </button>`:D}
        ${e.ha_device_id?w`<button class="btn small" @click=${()=>this.fire(`zfp-open-ha`,{id:e.ha_device_id})}>
              ${q(kn,16)} ${t(`action.open_in_ha`)}
            </button>`:D}
        ${this.placement&&this.editable?w`<button class="btn small danger" @click=${()=>this.fire(`zfp-unplace`,{ieee:e.ieee})}>
              ${t(`action.unplace`)}
            </button>`:D}
      </div>
    `}static{this.styles=[J,$n,o`
      :host {
        display: grid;
        gap: 16px;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        color: var(--c);
        background: color-mix(in srgb, var(--c) 12%, var(--zfp-surface));
        box-shadow: 0 0 0 3px var(--h);
        flex: none;
      }
      .title {
        flex: 1;
        min-width: 0;
      }
      h3 {
        margin: 0;
        font-size: 17px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .sub {
        font-size: 13px;
        color: var(--zfp-text-2);
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
        gap: 8px;
      }
      .stat {
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--zfp-surface-2);
        display: grid;
        gap: 2px;
      }
      .stat .k {
        font-size: 11px;
        color: var(--zfp-text-2);
      }
      .stat .v {
        font-size: 20px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .stat small {
        font-size: 12px;
        font-weight: 500;
        color: var(--zfp-text-2);
      }
      .stat .band {
        font-size: 11px;
        color: var(--zfp-text-2);
      }
      dl {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 6px 16px;
        margin: 0;
        font-size: 13px;
      }
      dt {
        color: var(--zfp-text-2);
      }
      dd {
        margin: 0;
        text-align: right;
        overflow-wrap: anywhere;
      }
      .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px;
      }
      .neighbors {
        list-style: none;
        margin: -4px 0 0;
        padding: 0;
        display: grid;
        gap: 2px;
      }
      .neighbors li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 7px 8px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
      }
      .neighbors li:hover {
        background: var(--zfp-surface-2);
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex: none;
      }
      .name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .role {
        font-size: 11px;
        color: var(--zfp-text-3);
      }
      .lqi {
        min-width: 30px;
        text-align: center;
        font-size: 11px;
        font-weight: 700;
        color: #fff;
        border-radius: 9px;
        padding: 1px 6px;
      }
      .small {
        font-size: 13px;
        margin: 0;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .section-title {
        margin-bottom: 0;
      }
    `]}};customElements.get(`zfp-device-detail`)||customElements.define(`zfp-device-detail`,Gr);var Kr=class extends A{static{this.properties={_req:{state:!0}}}constructor(){super(),this._req=null}confirm(e){return this.open({...e}).then(e=>e!==null)}prompt(e){return this.open({title:e.title,confirmText:e.confirmText,cancelText:e.cancelText,input:{label:e.label,value:e.value??``,type:e.type??`text`,min:e.min,step:e.step}})}open(e){return this._req?.resolve(null),new Promise(t=>{this._req={...e,resolve:t},this.updateComplete.then(()=>{this.renderRoot.querySelector(`dialog`)?.showModal();let e=this.renderRoot.querySelector(`input`);e?.focus(),e?.select()})})}finish(e){let t=this._req;if(!t)return;let n=e?``:null;if(e&&t.input){let e=this.renderRoot.querySelector(`input`);if(!e.reportValidity())return;n=e.value}this.renderRoot.querySelector(`dialog`)?.close(),this._req=null,t.resolve(n)}render(){let e=this._req;return e?w`<dialog
      @cancel=${e=>{e.preventDefault(),this.finish(!1)}}
      @click=${e=>{e.target===e.currentTarget&&this.finish(!1)}}
    >
      <form
        method="dialog"
        @submit=${e=>{e.preventDefault(),this.finish(!0)}}
      >
        <h2>${e.title}</h2>
        ${e.message?w`<p>${e.message}</p>`:D}
        ${e.input?w`<label class="field"
              ><span>${e.input.label}</span>
              <input
                .type=${e.input.type}
                .value=${e.input.value}
                min=${e.input.min??D}
                step=${e.input.step??`any`}
                required
            /></label>`:D}
        <div class="actions">
          <button type="button" class="btn" @click=${()=>this.finish(!1)}>${e.cancelText}</button>
          <button type="submit" class="btn primary ${e.danger?`danger-fill`:``}">${e.confirmText}</button>
        </div>
      </form>
    </dialog>`:D}static{this.styles=[J,$n,o`
      dialog {
        border: none;
        border-radius: 20px;
        padding: 0;
        width: min(420px, calc(100vw - 32px));
        background: var(--zfp-surface);
        color: var(--zfp-text);
        box-shadow: var(--zfp-shadow-lg);
      }
      dialog[open] {
        animation: pop 0.18s var(--zfp-ease);
      }
      dialog::backdrop {
        background: rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(2px);
      }
      @keyframes pop {
        from {
          transform: scale(0.96);
          opacity: 0;
        }
      }
      form {
        padding: 24px;
        display: grid;
        gap: 16px;
      }
      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
      p {
        margin: 0;
        color: var(--zfp-text-2);
        line-height: 1.5;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 4px;
      }
      .danger-fill {
        background: var(--zfp-error);
      }
    `]}};customElements.get(`zfp-dialog`)||customElements.define(`zfp-dialog`,Kr);var qr=(()=>{try{return new URL(import.meta.url).searchParams.get(`v`)}catch{return null}})();function Jr(e){return!!e&&!!qr&&e!==qr}var Yr=class extends A{static{this.properties={_items:{state:!0}}}constructor(){super(),this.seq=0,this._items=[]}show(e,t=`info`,n=4500){let r=++this.seq;this._items=[...this._items.filter(t=>t.message!==e),{id:r,message:e,kind:t}].slice(-3),setTimeout(()=>this.dismiss(r),n)}dismiss(e){this._items=this._items.filter(t=>t.id!==e)}render(){return w`<div class="stack" role="status" aria-live="polite">
      ${M(this._items,e=>e.id,e=>w`<div class="toast ${e.kind}">
          ${q(e.kind===`error`?Qt:nn,18)}
          <span>${e.message}</span>
          <button class="icon-btn" @click=${()=>this.dismiss(e.id)} aria-label="close">${q(on,16)}</button>
        </div>`)}
    </div>`}static{this.styles=[J,$n,o`
      .stack {
        position: absolute;
        left: 50%;
        bottom: 24px;
        transform: translateX(-50%);
        display: grid;
        gap: 8px;
        z-index: 20;
        width: max-content;
        max-width: calc(100% - 32px);
      }
      .toast {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 6px 6px 14px;
        border-radius: 14px;
        background: color-mix(in srgb, var(--zfp-text) 92%, var(--zfp-surface));
        color: var(--zfp-surface);
        font-size: 14px;
        box-shadow: var(--zfp-shadow-lg);
        animation: rise 0.22s var(--zfp-ease);
      }
      .toast.error .icon {
        color: #fca5a5;
      }
      .toast .icon-btn {
        color: inherit;
        width: 28px;
        height: 28px;
      }
      @keyframes rise {
        from {
          transform: translateY(12px);
          opacity: 0;
        }
      }
    `]}};customElements.get(`zfp-toast`)||customElements.define(`zfp-toast`,Yr);var Xr=o`
  section {
    display: grid;
    gap: 12px;
  }
  section.tight {
    gap: 8px;
  }
  .section-title {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .count {
    font-weight: 600;
    color: var(--zfp-text-3);
    background: var(--zfp-surface-3);
    border-radius: 8px;
    padding: 0 6px;
    letter-spacing: 0;
  }
  .empty-pane {
    display: grid;
    justify-items: center;
    gap: 8px;
    padding: 32px 12px;
    text-align: center;
    color: var(--zfp-text-3);
  }
  .empty-pane p {
    margin: 0;
    color: var(--zfp-text-2);
    line-height: 1.5;
    font-size: 14px;
  }
  .hint {
    margin: 0;
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--zfp-text-2);
    display: flex;
    gap: 6px;
    align-items: flex-start;
  }
  .hint.ok {
    color: var(--zfp-success);
  }
  .kv {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: var(--zfp-text-2);
  }
  .kv b {
    color: var(--zfp-text);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .material-swatch {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--zfp-text-2);
    margin-top: -4px;
  }
  .material-swatch span {
    width: 28px;
    height: 8px;
    border-radius: 4px;
    background: var(--c);
  }
  .btn-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    cursor: pointer;
  }
  .search {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 12px;
    border-radius: 20px;
    background: var(--zfp-surface-2);
    color: var(--zfp-text-2);
  }
  .search input {
    border: none;
    background: none;
    height: 100%;
    padding: 0;
    outline: none;
  }
  .dev-list,
  .sugg-list,
  .link-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 2px;
  }
  .dev-row,
  .sugg-list li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.12s;
  }
  .dev-row:hover,
  .sugg-list li:hover {
    background: var(--zfp-surface-2);
  }
  .dev-row.selected {
    background: var(--zfp-accent-soft);
  }
  .dev-row[draggable="true"] {
    cursor: grab;
  }
  .dev-icon {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--c);
    background: color-mix(in srgb, var(--c) 12%, var(--zfp-surface));
    box-shadow: inset 0 0 0 2px var(--h);
    flex: none;
  }
  .dev-text {
    flex: 1;
    min-width: 0;
    display: grid;
  }
  .dev-name {
    font-size: 14px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dev-sub {
    font-size: 12px;
    color: var(--zfp-text-2);
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .lqi-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .num {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--zfp-accent);
    color: var(--zfp-on-accent);
    font-size: 13px;
    font-weight: 700;
    flex: none;
  }
  .legend {
    display: grid;
    gap: 6px;
    font-size: 13px;
  }
  .legend div {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .legend .muted {
    margin-left: auto;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  .sw {
    width: 22px;
    height: 12px;
    border-radius: 4px;
    opacity: 0.85;
  }
  .link-list li {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    padding: 6px 8px;
    border-radius: 8px;
  }
  .link-list li:hover {
    background: var(--zfp-surface-2);
  }
  .link-list span:not(.lqi):not(.muted) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  .swatches {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .swatch {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
    box-shadow: inset 0 0 0 2px var(--zfp-surface);
  }
  .swatch.on {
    border-color: var(--zfp-text);
  }
  .building-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 10px;
  }
  .building-card {
    display: grid;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid var(--zfp-divider);
    border-left: 4px solid var(--b);
    transition: opacity 0.15s;
  }
  .building-card.hidden {
    opacity: 0.55;
  }
  .b-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .b-swatch {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--b);
    flex: none;
  }
  .lqi {
    min-width: 28px;
    text-align: center;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    border-radius: 9px;
    padding: 1px 6px;
    margin-left: auto;
  }
`,Zr=(e,t=2)=>(Math.round(e*10**t)/10**t).toString(),Qr=(e,t)=>e(`material.${t}`);function Q(e,t,n,r={}){return w`<label class="field"
    ><span>${e}</span>
    <input
      type="number"
      .value=${Number.isFinite(t)?String(t):``}
      placeholder=${r.placeholder??D}
      min=${r.min??D}
      max=${r.max??D}
      step=${r.step??`any`}
      ?disabled=${r.disabled}
      @change=${e=>{let t=parseFloat(e.target.value);Number.isFinite(t)&&n(r.min===void 0?t:Math.max(r.min,t))}}
  /></label>`}function $r(e,t,n,r,i,a=!1){return w`<select
    ?disabled=${a}
    @change=${e=>i(e.target.value)}
  >
    ${n===``?w`<option value="" selected disabled>—</option>`:D}
    ${r.map(r=>w`<option value=${r.id} ?selected=${r.id===n}>
        ${Qr(e,r.id)} · ${st(t,r.id)} dB
      </option>`)}
  </select>`}function ei(e){let{t,floor:n,selection:r,project:i}=e;if(!n||!r.length)return w`<div class="empty-pane">${q(wn,32)}<p>${t(`inspector.empty`)}</p></div>`;let a=r.filter(e=>e.startsWith(Y)).map(e=>e.slice(Y.length));if(a.length===1&&r.length===1)return ti(e,a[0]);let o=n.walls.filter(e=>r.includes(e.id)),s=n.rooms.filter(e=>r.includes(e.id)),c=[];if(o.length){let n=new Set(o.map(e=>e.material)),r=new Set(o.map(e=>e.thickness)),a=n.size===1?o[0].material:``,s=o.reduce((e,t)=>e+P(t.a,t.b),0);c.push(w`<section>
      <div class="section-title">${o.length===1?t(`inspector.wall`):t(`inspector.walls`,{n:o.length})}</div>
      <label class="field"
        ><span>${t(`inspector.material`)}</span>
        ${$r(t,i.settings,a,at,t=>e.editWalls(o.map(e=>e.id),{material:t}),!e.canEdit)}
      </label>
      ${a?w`<div class="material-swatch" style="--c:${F[a].color}">
            <span></span>${t(`inspector.attenuation`,{db:st(i.settings,a)})}
          </div>`:D}
      <div class="row">
        ${Q(t(`inspector.thickness`),r.size===1?o[0].thickness:NaN,t=>e.editWalls(o.map(e=>e.id),{thickness:t}),{min:.02,step:.01,disabled:!e.canEdit,placeholder:`—`})}
        <label class="field"><span>${t(`inspector.length`)}</span><input type="text" readonly .value=${`${Zr(s)} m`} /></label>
      </div>
    </section>`)}for(let n of s)c.push(w`<section>
      <div class="section-title">${t(`inspector.room`)}</div>
      <label class="field"
        ><span>${t(`inspector.room_name`)}</span>
        <input
          type="text"
          .value=${n.name}
          ?disabled=${!e.canEdit}
          @change=${t=>e.editRoom(n.id,{name:t.target.value})}
      /></label>
      <div class="kv"><span>${t(`inspector.area`)}</span><b>${Zr(tt(n.points),1)} m²</b></div>
    </section>`);return a.length&&c.push(w`<section><div class="section-title">${t(`tab.devices`)}</div>
      ${a.map(t=>$(e,t,e.network?.devices.find(e=>e.ieee===t)))}</section>`),w`${c}`}function ti(e,t){let{t:n,project:r,network:i,rf:a}=e,o=i?.devices.find(e=>e.ieee===t),s=r.placements[t],c=o?.type??`Unknown`;return w`
    ${o?w`<zfp-device-detail
          .device=${o}
          .placement=${s}
          .network=${i}
          .floors=${r.floors}
          .rssi=${a?.deviceRssi[t]}
          .t=${n}
          .editable=${e.canEdit}
        ></zfp-device-detail>`:w`<p class="muted">${t} — ${n(`devices.missing`)}</p>`}
    ${s&&e.canEdit?w`<section class="tight">
          <div class="row">
            ${Q(n(`inspector.height`),s.height,n=>e.editPlacement(t,{height:n}),{min:0,step:.1})}
            ${Q(n(`inspector.tx`),s.txPower??NaN,n=>e.editPlacement(t,{txPower:n}),{step:1,placeholder:`${lt(r.settings,c)}`})}
          </div>
        </section>`:D}
  `}function $(e,t,n,r){let{t:i}=e,a=n?.type??`Unknown`,o=Jn(n,e.rf?.deviceRssi[t]),s=e.canEdit&&!!n;return w`<li
    class="dev-row ${e.selection.includes(`dev:`+t)?`selected`:``}"
    draggable=${s?`true`:`false`}
    @dragstart=${e=>{e.dataTransfer?.setData(wr,t),e.dataTransfer&&(e.dataTransfer.effectAllowed=`move`)}}
    @mouseenter=${()=>e.highlight(t)}
    @mouseleave=${()=>e.highlight(null)}
    @click=${()=>e.openDevice(t)}
  >
    <span class="dev-icon" style="--c:${Gn[a]};--h:${qn[o]}">${q(Kn[a],18)}</span>
    <span class="dev-text">
      <span class="dev-name">${n?.name??t}</span>
      <span class="dev-sub">
        ${n?.available===!1?w`<span class="chip bad">${i(`devices.offline`)}</span>`:n?.lqi!==null&&n?.lqi!==void 0?w`<span class="lqi-dot" style="background:${Yn(n.lqi)}"></span>LQI ${n.lqi}`:i(`type.${a}`)}
        ${n?.battery!==null&&n?.battery!==void 0?w` · ${n.battery}%`:D}
      </span>
    </span>
    ${r??D}
  </li>`}function ni(e){let{t,project:n,network:r,floor:i}=e,a=r?.devices??[],o=e.search.trim().toLowerCase(),s=e=>!o||e.name.toLowerCase().includes(o)||e.ieee.includes(o)||(e.model??``).toLowerCase().includes(o),c=new Set(a.map(e=>e.ieee)),l=new Set(e.displayedFloorIds),u=a.filter(e=>s(e)&&l.has(n.placements[e.ieee]?.floorId)),d=a.filter(e=>s(e)&&n.placements[e.ieee]&&!l.has(n.placements[e.ieee].floorId)),f=a.filter(e=>s(e)&&!n.placements[e.ieee]),p=Object.keys(n.placements).filter(e=>!c.has(e)&&(!o||e.includes(o)));if(!a.length)return w`<div class="empty-pane">${q(Cn,32)}<p>${t(`devices.none`)}</p></div>`;let m=(e,t,n=D)=>t.length?w`<section><div class="section-title">${e} <span class="count">${t.length}</span></div>${n}
          <ul class="dev-list">${t}</ul></section>`:D,h=e=>{let t=n.floors.find(t=>t.id===e);if(!t)return``;let r=n.buildings.length>1?n.buildings.find(e=>e.id===t.buildingId):void 0;return r?`${r.name} · ${t.name}`:t.name};return w`
    <div class="search">
      ${q(Cn,18)}
      <input type="search" placeholder=${t(`devices.search`)} .value=${e.search}
        @input=${t=>e.setSearch(t.target.value)} />
    </div>
    ${m(t(`devices.unplaced`),f.map(n=>$(e,n.ieee,n,e.canEdit&&(i||e.site)?w`<button class="btn small" @click=${t=>{t.stopPropagation(),e.startPlacing(n.ieee)}}>${t(`action.place`)}</button>`:void 0)),e.canEdit?w`<p class="hint">${t(`devices.drag_hint`)}</p>`:e.canSwitchToEdit?w`<p class="hint">${t(`hint.switch_to_edit`)}</p>`:D)}
    ${m(t(`devices.placed`),u.map(t=>$(e,t.ieee,t)))}
    ${m(t(`devices.other_floor`),d.map(t=>$(e,t.ieee,t,w`<span class="chip">${h(n.placements[t.ieee].floorId)}</span>`)))}
    ${m(t(`devices.missing`),p.map(n=>$(e,n,void 0,e.canEdit?w`<button class="icon-btn" title=${t(`action.remove`)} @click=${t=>{t.stopPropagation(),e.unplace(n)}}>${q(un,18)}</button>`:void 0)))}
    ${!f.length&&a.length&&!o?w`<p class="hint ok">${t(`devices.all_placed`)}</p>`:D}
  `}function ri(e){let{t,rf:n,project:r,network:i}=e,a=n?.calibration,o=new Map((i?.devices??[]).map(e=>[e.ieee,e])),s=Object.entries(n?.deviceRssi??{}).filter(([e,t])=>Zn(t)&&o.has(e)).sort((e,t)=>e[1]-t[1]),c=(i?.links??[]).filter(e=>e.lqi!==null&&e.lqi<60&&r.placements[e.a]&&r.placements[e.b]).sort((e,t)=>(e.lqi??0)-(t.lqi??0)).slice(0,8),l=(n?.suggestions??[]).filter(t=>e.displayedFloorIds.includes(t.floorId)),u=Object.keys(r.placements).some(e=>{let t=o.get(e)?.type;return t===`Coordinator`||t===`Router`});return w`
    <section>
      <div class="section-title">${t(`coverage.legend`)}</div>
      <div class="legend">
        ${Yt.map(e=>w`<div><span class="sw" style="background:${e.color}"></span>${t(`band.${e.id}`)}
            <span class="muted">${Number.isFinite(e.min)?`≥ ${e.min}`:`< -95`} dBm</span></div>`)}
      </div>
      ${u?D:w`<p class="hint">${t(`coverage.need_coordinator`)}</p>`}
    </section>

    <section>
      <div class="section-title">${t(`coverage.suggestions`)}</div>
      ${l.length?w`<ul class="sugg-list">
            ${l.map((n,r)=>w`<li @click=${()=>e.locateSuggestion(r)}>
                <span class="num">${r+1}</span>
                <span class="dev-text">
                  <span class="dev-name">${t(`coverage.suggestion`)}</span>
                  <span class="dev-sub">${t(`coverage.gain`,{area:Math.round(n.gainArea)})}${n.fixedDevices.length?w` · ${t(`coverage.fixes`,{n:n.fixedDevices.length})}`:D}</span>
                </span>
              </li>`)}
          </ul>`:w`<p class="hint ${u?`ok`:``}">${q(Sn,16)} ${u?t(`coverage.no_suggestions`):`—`}</p>`}
    </section>

    <section>
      <div class="section-title">${t(`coverage.weak_devices`)}</div>
      ${s.length?w`<ul class="dev-list">${s.map(([t,n])=>$(e,t,o.get(t),w`<span class="chip warn">${n} dBm</span>`))}</ul>`:w`<p class="hint ok">${t(`coverage.none_weak`)}</p>`}
    </section>

    <section>
      <div class="section-title">${t(`coverage.weak_links`)}</div>
      ${c.length?w`<ul class="link-list">${c.map(t=>w`<li @mouseenter=${()=>e.highlight(t.a)} @mouseleave=${()=>e.highlight(null)}>
              <span>${o.get(t.a)?.name??t.a}</span><span class="muted">↔</span><span>${o.get(t.b)?.name??t.b}</span>
              <span class="lqi" style="background:${Yn(t.lqi)}">${t.lqi}</span>
            </li>`)}</ul>`:w`<p class="hint ok">${t(`coverage.none_weak`)}</p>`}
    </section>

    <section>
      <div class="section-title">${t(`coverage.calibration`)}</div>
      <label class="toggle">
        <input type="checkbox" .checked=${r.settings.autoCalibrate} ?disabled=${!e.canEdit}
          @change=${t=>e.editSettings({autoCalibrate:t.target.checked})} />
        ${t(`coverage.auto_calibrate`)}
      </label>
      ${a?.applied?w`<p class="hint ok">${t(`coverage.calibrated`,{n:a.samples})}</p>
            <div class="kv"><span>${t(`coverage.exponent`)}</span><b>${a.exponent}</b></div>
            <div class="kv"><span>${t(`coverage.offset`)}</span><b>${a.offsetDb>0?`+`:``}${a.offsetDb} dB</b></div>
            <div class="kv"><span>${t(`coverage.rmse`)}</span><b>± ${a.rmse} dB</b></div>`:w`<p class="hint">${t(`coverage.not_calibrated`)}</p>`}
    </section>
  `}function ii(e){let{t,floor:n,project:r}=e;if(!n)return w``;let i=n.background,a=!e.canEdit;return w`
    ${e.building?oi(e,e.building):D}
    <section>
      <div class="section-title">${t(`floor.settings`)}</div>
      <label class="field"><span>${t(`floor.name`)}</span>
        <input type="text" .value=${n.name} ?disabled=${a}
          @change=${t=>e.editFloor({name:t.target.value||n.name})} /></label>
      <div class="row">
        ${Q(t(`floor.level`),n.level,t=>e.editFloor({level:Math.round(t)}),{step:1,disabled:a})}
        ${Q(t(`floor.elevation`),n.elevation,t=>e.editFloor({elevation:t}),{step:.1,disabled:a})}
      </div>
      <div class="row">
        ${Q(t(`floor.height`),n.height,t=>e.editFloor({height:t}),{min:1,step:.1,disabled:a})}
        <label class="field"><span>${t(`floor.slab`)}</span>
          ${$r(t,r.settings,n.slab,ot,t=>e.editFloor({slab:t}),a)}</label>
      </div>
    </section>

    <section>
      <div class="section-title">${t(`floor.background`)}</div>
      ${i?w`
            <label class="toggle"><input type="checkbox" .checked=${i.visible} ?disabled=${a}
              @change=${t=>e.editFloor({background:{...i,visible:t.target.checked}})} />
              ${t(`floor.visible`)}</label>
            <label class="field"><span>${t(`floor.opacity`)} · ${Math.round(i.opacity*100)}%</span>
              <input type="range" min="0.05" max="1" step="0.05" .value=${String(i.opacity)} ?disabled=${a}
                @change=${t=>e.editFloor({background:{...i,opacity:parseFloat(t.target.value)}})} /></label>
            <p class="hint">${t(`floor.scale_hint`)}</p>
            ${e.canEdit?w`<div class="btn-row">
                  <button class="btn small ${e.activeTool===`calibrate`?`primary`:``}" @click=${()=>e.setTool(`calibrate`)}>
                    ${q(Fn,16)} ${t(`action.calibrate_image`)}</button>
                  <button class="btn small ${e.activeTool===`image`?`primary`:``}"
                    @click=${()=>e.setTool(e.activeTool===`image`?`select`:`image`)}>
                    ${q(bn,16)} ${t(`layers.background`)} ↔</button>
                  <button class="btn small" @click=${e.uploadImage}>${t(`action.replace_image`)}</button>
                  <button class="btn small danger" @click=${e.removeImage}>${t(`action.remove`)}</button>
                </div>`:D}`:w`<p class="hint">${t(`floor.no_background`)}</p>
            ${e.canEdit?w`<button class="btn" @click=${e.uploadImage}>${q(sn,18)} ${t(`action.upload_image`)}</button>`:D}`}
    </section>

    ${e.canEdit?w`<section class="btn-row">
          <button class="btn small" @click=${e.duplicateFloor}>${t(`action.duplicate`)}</button>
          <button class="btn small danger" @click=${e.deleteFloor}>${q(un,16)} ${t(`action.delete`)}</button>
        </section>`:D}
  `}function ai(e,t){return w`<div class="swatches" role="radiogroup" aria-label=${e.t(`building.color`)}>
    ${z.map(n=>w`<button role="radio" aria-checked=${n===t.color} class="swatch ${n===t.color?`on`:``}"
        style="background:${n}" ?disabled=${!e.canEdit}
        @click=${()=>e.editBuilding(t.id,{color:n})}></button>`)}
  </div>`}function oi(e,t){let{t:n}=e,r=!e.canEdit;return w`<section>
    <div class="section-title">${n(`building.section`)}</div>
    <label class="field"><span>${n(`building.name`)}</span>
      <input type="text" .value=${t.name} ?disabled=${r}
        @change=${n=>e.editBuilding(t.id,{name:n.target.value||t.name})} /></label>
    <div class="field"><span>${n(`building.color`)}</span>${ai(e,t)}</div>
    ${e.canEdit&&e.project.buildings.length>1?w`<button class="btn small danger" @click=${()=>e.deleteBuilding(t.id)}>
          ${q(un,16)} ${n(`building.delete`)}</button>`:D}
  </section>`}function si(e){let{t,project:n}=e;return w`
    <p class="hint">${t(`site.hint`)}</p>
    <ul class="building-list">
      ${n.buildings.map(r=>{let i=H(n,r.id);return w`<li class="building-card ${r.visible?``:`hidden`}" style="--b:${r.color}">
          <div class="b-head">
            <span class="b-swatch"></span>
            <span class="dev-text">
              <span class="dev-name">${r.name}</span>
              <span class="dev-sub">${i.length===1?t(`building.floor_one`):t(`building.floors`,{n:i.length})}</span>
            </span>
            <label class="toggle" title=${r.visible?t(`site.hide`):t(`site.show`)}>
              <input type="checkbox" .checked=${r.visible} ?disabled=${!e.canEdit&&!e.canSwitchToEdit}
                @change=${t=>e.editBuilding(r.id,{visible:t.target.checked})} />
            </label>
            <button class="btn small" @click=${()=>e.openBuilding(r.id)}>${t(`site.open`)}</button>
          </div>
          ${e.canEdit?w`<div class="row">
                  ${Q(`X (m)`,r.x,t=>e.editBuilding(r.id,{x:t}),{step:.5})}
                  ${Q(`Y (m)`,r.y,t=>e.editBuilding(r.id,{y:t}),{step:.5})}
                </div>
                ${ai(e,r)}`:D}
        </li>`})}
    </ul>
    ${e.canEdit?w`<button class="btn" @click=${e.addBuilding}>${q(K,18)} ${t(`building.add`)}</button>`:D}
  `}var ci=[.05,.1,.25,.5],li=`zigbee-floorplan:prefs`;function ui(){try{return JSON.parse(localStorage.getItem(li)??`{}`)}catch{return{}}}function di(e){try{localStorage.setItem(li,JSON.stringify(e))}catch{}}var fi=class extends A{static{this.properties={hass:{attribute:!1},narrow:{type:Boolean},_floorId:{state:!0},_mode:{state:!0},_tool:{state:!0},_layers:{state:!0},_linkMode:{state:!0},_selection:{state:!0},_placing:{state:!0},_tab:{state:!0},_drawer:{state:!0},_rf:{state:!0},_imageUrls:{state:!0},_site:{state:!0},_buildingId:{state:!0},_level:{state:!0},_buildingMenu:{state:!0},_wallMaterial:{state:!0},_wallThickness:{state:!0},_gridSize:{state:!0},_highlight:{state:!0},_search:{state:!0},_menu:{state:!0},_layersOpen:{state:!0},_tick:{state:!0}}}constructor(){super(),this.imagesRequested=/* @__PURE__ */ new Set,this.siteViewObj=null,this.onVisibility=()=>{document.visibilityState===`hidden`?this.ctrl?.flush():this.ctrl?.refreshInfo()},this.onConnectionStatus=e=>{e.detail===`connected`&&this.ctrl?.refreshInfo()},this.edit=e=>{this.ctrl?.apply(e)},this.onKeyDown=e=>{if(!this.isConnected||!this.offsetParent)return;let t=e.composedPath();if(t.some(e=>e instanceof HTMLElement&&/^(INPUT|SELECT|TEXTAREA)$/.test(e.tagName))||t.some(e=>e instanceof HTMLElement&&e.tagName===`DIALOG`))return;let n=e.ctrlKey||e.metaKey,r=e.key.toLowerCase(),i=this.canEdit;if(n&&r===`z`&&i){e.preventDefault(),e.shiftKey?this.ctrl?.redo():this.ctrl?.undo();return}if(n&&r===`y`&&i){e.preventDefault(),this.ctrl?.redo();return}if(this.canvas?.handleKey(e)){e.preventDefault();return}if(n||e.altKey)return;let a={v:`select`,w:`wall`,r:`room`,m:`measure`,h:`pan`,c:`calibrate`};if(i&&a[r]){if(r===`c`&&!V(this.project,this._floorId)?.background)return;this.setTool(a[r])}else r===`f`?this.canvas?.fit():r===`+`||r===`=`?this.canvas?.zoomBy(1.25):r===`-`?this.canvas?.zoomBy(.8):r===`escape`&&this._tool!==`select`&&i&&this.setTool(`select`)};let e=ui();this.narrow=!1,this._floorId=e.view?.floorId??null,this._buildingId=e.view?.buildingId??null,this._site=e.view?.site??!1,this._level=e.view?.level??0,this._buildingMenu=!1,this._mode=e.mode??`view`,this._tool=`select`,this._layers={...Cr,...e.layers},this._linkMode=e.linkMode??`tree`,this._selection=[],this._placing=null,this._tab=`devices`,this._drawer=!0,this._rf=null,this._imageUrls={},this._wallMaterial=e.wallMaterial??`brick`,this._wallThickness=e.wallThickness??.15,this._gridSize=e.gridSize??.25,this._highlight=null,this._search=``,this._menu=!1,this._layersOpen=!1,this._tick=0}get t(){return Ir(this.hass?.locale?.language??this.hass?.language)}get project(){return this.ctrl.project}get canEdit(){return!!this.ctrl?.canEdit&&this._mode===`edit`}connectedCallback(){super.connectedCallback(),window.addEventListener(`keydown`,this.onKeyDown),document.addEventListener(`visibilitychange`,this.onVisibility),window.addEventListener(`connection-status`,this.onConnectionStatus),this.hass&&this.attachController()}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener(`keydown`,this.onKeyDown),document.removeEventListener(`visibilitychange`,this.onVisibility),window.removeEventListener(`connection-status`,this.onConnectionStatus),this.ctrl?.flush(),this.detach?.(),this.unNotice?.(),this.detach=void 0,this.rfClient?.dispose(),this.rfClient=void 0}attachController(){this.detach||(this.ctrl=Br.for(this.hass),this.detach=this.ctrl.attach(()=>this.onControllerChange()),this.unNotice=this.ctrl.onNotice(e=>this.onNotice(e)),this.rfClient=new Wr(e=>this._rf=e),this.onControllerChange())}firstUpdated(){!this.narrow&&this.getBoundingClientRect().width<1100&&(this._drawer=!1)}willUpdate(e){e.has(`hass`)&&this.hass&&(this.detach?this.ctrl?.setHass(this.hass):this.attachController()),e.has(`narrow`)&&this.narrow&&!e.get(`narrow`)&&(this._drawer=!1)}onControllerChange(){let e=this.ctrl,t=e.project;if(e.ready){t.buildings.find(e=>e.id===this._buildingId)||(this._buildingId=V(t,this._floorId)?.buildingId??t.buildings[0]?.id??null);let e=H(t,this._buildingId);if(e.find(e=>e.id===this._floorId)||(this._floorId=e[0]?.id??null),this._site){let e=bt(t);t.buildings.length?e.length&&!e.includes(this._level)&&(this._level=e[0]):this._site=!1}}e.info&&!e.info.is_admin&&this._mode===`edit`&&(this._mode=`view`);let n=/* @__PURE__ */ new Set([...V(e.project,this._floorId)?.walls.map(e=>e.id)??[],...V(e.project,this._floorId)?.rooms.map(e=>e.id)??[],...Object.keys(e.project.placements).map(e=>Y+e)]);this._selection.some(e=>!n.has(e))&&(this._selection=this._selection.filter(e=>n.has(e))),this.requestRf(),this.resolveImages(),this._tick++}displayedFloorIds(){return this.ctrl?.ready?this._site?yt(this.project,this._level).map(e=>e.id):this._floorId?[this._floorId]:[]:[]}get siteView(){return this._site?(this.siteViewObj?.level!==this._level&&(this.siteViewObj={level:this._level}),this.siteViewObj):this.siteViewObj=null}requestRf(){let e=this.ctrl,t=this.displayedFloorIds();if(!e?.ready||!t.length||!this.rfClient)return;let n=e.network;this.rfClient.request({project:e.project,devices:(n?.devices??[]).map(e=>({ieee:e.ieee,type:e.type})),links:n?.links??[],floorIds:t,suggest:!0})}async resolveImages(){for(let e of this.displayedFloorIds()){let t=V(this.project,e)?.background?.imageId;if(t&&!this.imagesRequested.has(t)){this.imagesRequested.add(t);try{let e=await this.ctrl.api.imageUrl(t);this._imageUrls={...this._imageUrls,[t]:e}}catch{this.imagesRequested.delete(t)}}}}onNotice(e){let t=this.t,n=this.toast;n&&(e.kind===`conflict`?n.show(t(`notice.conflict`)):e.kind===`remote_update`?n.show(t(`notice.remote_update`)):e.kind===`save_error`?n.show(t(`notice.save_error`,{message:e.message}),`error`):e.kind===`scan_error`&&n.show(t(`notice.scan_error`,{message:e.message}),`error`))}renderUpdateBar(){return Jr(this.ctrl?.info?.frontend_hash)?w`<div class="update-bar" role="status">
      ${q(Rn,18)}<span>${this.t(`banner.update`)}</span>
      <button class="btn small primary" @click=${()=>location.reload()}>${this.t(`action.reload`)}</button>
    </div>`:D}get toast(){return this.renderRoot.querySelector(`zfp-toast`)}get dialog(){return this.renderRoot.querySelector(`zfp-dialog`)}get canvas(){return this.renderRoot.querySelector(`zfp-canvas`)}persistPrefs(){di({layers:this._layers,linkMode:this._linkMode,wallMaterial:this._wallMaterial,wallThickness:this._wallThickness,gridSize:this._gridSize,mode:this._mode,view:{site:this._site,buildingId:this._buildingId,floorId:this._floorId,level:this._level}})}setFloor(e){let t=V(this.project,e);t&&(e!==this._floorId||this._site)&&(this._floorId=e,this._buildingId=t.buildingId,this._site=!1,this._selection=[],this._placing=null,(this._tool===`calibrate`||this._tool===`image`)&&(this._tool=`select`),this._tab===`buildings`&&(this._tab=`floor`),this.afterViewChange())}setBuilding(e){this._buildingMenu=!1;let t=H(this.project,e).find(e=>e.level===V(this.project,this._floorId)?.level)??H(this.project,e)[0];this._buildingId=e,t?this.setFloor(t.id):(this._site=!1,this._floorId=null,this.afterViewChange())}setSite(e){this._buildingMenu=!1;let t=bt(this.project),n=e??V(this.project,this._floorId)?.level??this._level;this._level=t.includes(n)?n:t[0]??0,this._site=!0,this._selection=[],this._placing=null,this._tool=`select`,this._tab===`floor`&&(this._tab=`buildings`),this.afterViewChange()}afterViewChange(){this.persistPrefs(),this.requestRf(),this.resolveImages()}async addBuilding(){this._buildingMenu=!1;let e=this.t,t=this.project.buildings.length+1,n=``;this.edit(r=>{let i=xt(r,e(`building.default_name`,{n:t})),a=wt(i.project,e(`floor.ground`),i.buildingId);return n=a.floorId,a.project}),n&&this.startDrawing(n)}startDrawing(e){this.setFloor(e),this._mode=`edit`,this._tool=`wall`,this._tab=`floor`,this._drawer=!this.narrow,this.persistPrefs()}async deleteBuilding(e){let t=gt(this.project,e);if(!t)return;let n=this.t;await this.dialog.confirm({title:n(`action.delete`),message:n(`building.delete_confirm`,{name:t.name}),confirmText:n(`action.delete`),cancelText:n(`action.cancel`),danger:!0})&&this.edit(t=>Ct(t,e))}setMode(e){this._mode=e,this.persistPrefs(),this._placing=null,this._tool=`select`,e!==`view`||this._tab!==`floor`&&this._tab!==`inspector`||this.selectedDevice()||(this._tab=`devices`)}setTool(e){this._tool=e,this._placing=null}selectedDevice(){let e=this._selection.find(e=>e.startsWith(Y));return e?e.slice(Y.length):null}async addFloor(){let e=this.t;if(!this.project.buildings.length){await this.addBuilding();return}let t=this._buildingId??this.project.buildings[0].id,n=H(this.project,t).length,r=n===0?e(`floor.ground`):e(`floor.default_name`,{n}),i=``;this.edit(e=>{let n=wt(e,r,t);return i=n.floorId,n.project}),i&&this.startDrawing(i)}async deleteFloor(){let e=V(this.project,this._floorId);if(!e)return;let t=this.t;await this.dialog.confirm({title:t(`action.delete`),message:t(`floor.delete_confirm`,{name:e.name}),confirmText:t(`action.delete`),cancelText:t(`action.cancel`),danger:!0})&&this.edit(t=>Et(t,e.id))}duplicateFloor(){if(!this._floorId)return;let e=``;this.edit(t=>{let n=Dt(t,this._floorId);return e=n.floorId,n.project}),e&&this.setFloor(e)}async scan(){await this.ctrl?.scan(),this.ctrl?.network?.scan.status===`scanning`&&this.toast?.show(this.t(`notice.scan_started`))}uploadImage(){let e=document.createElement(`input`);e.type=`file`,e.accept=`image/png,image/jpeg,image/webp`,e.onchange=async()=>{let t=e.files?.[0],n=V(this.project,this._floorId);if(t&&n)try{let e=await Mr(t),r=await this.ctrl.api.uploadImage(e.blob,e.name),i=n.background,a=i?i.width*i.scale/e.width:15/e.width;this.edit(t=>Ot(t,n.id,{imageId:r,width:e.width,height:e.height,x:i?.x??0,y:i?.y??0,scale:a,rotation:0,opacity:i?.opacity??.55,visible:!0})),this._layers={...this._layers,background:!0},this.setTool(`calibrate`),await this.updateComplete,this.canvas?.fit()}catch(e){this.toast?.show(this.t(`notice.upload_error`,{message:String(e.message??e)}),`error`)}},e.click()}async onCalibrate(e){let t=V(this.project,this._floorId),n=t?.background;if(!t||!n)return;let r=this.t,{a:i,b:a}=e.detail,o=P(i,a),s=await this.dialog.prompt({title:r(`action.calibrate_image`),label:r(`calibrate.prompt`),value:o.toFixed(2),type:`number`,min:.01,confirmText:r(`action.ok`),cancelText:r(`action.cancel`)}),c=s?parseFloat(s):NaN;if(!(c>0))return;let l=c/o;this.edit(e=>Ot(e,t.id,{...n,scale:n.scale*l,x:i.x-(i.x-n.x)*l,y:i.y-(i.y-n.y)*l})),this.setTool(`select`),await this.updateComplete,this.canvas?.fit()}exportPlan(){let e=new Blob([JSON.stringify({type:`zigbee-floorplan`,...this.project},null,2)],{type:`application/json`}),t=document.createElement(`a`);t.href=URL.createObjectURL(e),t.download=`zigbee-floorplan.json`,t.click(),setTimeout(()=>URL.revokeObjectURL(t.href),1e3),this._menu=!1}importPlan(){this._menu=!1;let e=document.createElement(`input`);e.type=`file`,e.accept=`application/json,.json`,e.onchange=async()=>{let t=e.files?.[0];if(!t)return;let n=this.t;try{let e=JSON.parse(await t.text());if(!e||!Array.isArray(e.floors))throw Error(`invalid`);await this.dialog.confirm({title:n(`action.import`),message:n(`import.confirm`),confirmText:n(`action.ok`),cancelText:n(`action.cancel`)})&&this.ctrl?.replace(e)}catch{this.toast?.show(n(`import.error`),`error`)}},e.click()}isDisplayed(e){let t=this.project.placements[e];return!!t&&this.displayedFloorIds().includes(t.floorId)}openDevice(e){let t=this.project.placements[e];t&&!this.isDisplayed(e)&&this.setFloor(t.floorId),this._selection=[Y+e],this._tab=`inspector`,this._drawer=!0}locate(e){let t=this.project.placements[e];t&&(this.isDisplayed(e)||this.setFloor(t.floorId),this._highlight=e,this.updateComplete.then(()=>this.canvas?.centerOnDevice(e)),setTimeout(()=>{this._highlight===e&&(this._highlight=null)},2400))}openInHa(e){history.pushState(null,``,`/config/devices/device/${e}`),window.dispatchEvent(new CustomEvent(`location-changed`,{detail:{replace:!1}}))}render(){let e=this.ctrl,t=this.t;if(!e||!e.ready&&!e.loadError)return w`<div class="app">${this.renderHeader()}<div class="loading"><div class="spinner"></div></div></div>`;if(e.loadError)return w`<div class="app">${this.renderHeader()}
        <div class="center-msg">${q($t,40)}<p>${t(`banner.not_loaded`)}</p><p class="muted">${e.loadError}</p></div></div>`;let n=V(this.project,this._floorId),r=this._site?this.project.buildings.length>0:!!n,i=this.canEdit&&!!n&&!this._site,a=this._drawer&&r;return w`
      <div class="app ${this.narrow?`narrow`:``}">
        ${this.renderHeader()}
        ${this.renderUpdateBar()}
        <div class="body ${a?`with-drawer`:``} ${i?`editing`:``}">
          ${i?this.renderRail():D}
          <main class="stage">
            ${r?this.renderCanvas():this.renderEmpty()}
            ${r?this.renderOverlays():D}
          </main>
          ${a?this.renderDrawer():D}
        </div>
        <zfp-toast></zfp-toast>
        <zfp-dialog></zfp-dialog>
      </div>
    `}renderHeader(){let e=this.t,t=this.ctrl,n=!!t?.ready,r=n?H(this.project,this._buildingId):[],i=n&&this.project.floors.length>0,a=t?.network?.scan,o=a?.status===`scanning`,s=!!t?.info?.is_admin;return w`<header class="topbar">
      ${this.narrow?w`<button class="icon-btn on-header" aria-label=${e(`action.menu`)}
            @click=${()=>this.dispatchEvent(new Event(`hass-toggle-menu`,{bubbles:!0,composed:!0}))}>
            ${q(En)}</button>`:D}
      <div class="brand">${q(_n,22)}<span>${e(`app.title`)}</span></div>
      ${n&&this.project.buildings.length?this.renderBuildingSwitcher():D}
      <nav class="floors" role="tablist">
        ${this._site?bt(this.project).map(t=>w`<button role="tab" class="floor-tab ${t===this._level?`active`:``}"
                aria-selected=${t===this._level} @click=${()=>this.setSite(t)}>
                ${q(Ln,16)}<span>${e(`site.level`,{n:t})}</span></button>`):r.map(e=>w`<button role="tab" class="floor-tab ${e.id===this._floorId&&!this._site?`active`:``}"
            aria-selected=${e.id===this._floorId}
            @click=${()=>this.setFloor(e.id)}
            @dblclick=${()=>{this.canEdit&&(this._tab=`floor`,this._drawer=!0)}}>
            ${q(Ln,16)}<span>${e.name}</span></button>`)}
        ${!this._site&&n&&(this.canEdit||s&&!i)?w`<button class="floor-tab add" @click=${()=>this.addFloor()} title=${e(`action.add_floor`)}>
              ${q(K,16)}${r.length?D:w`<span>${e(`action.add_floor`)}</span>`}</button>`:D}
      </nav>
      <div class="spacer"></div>
      ${t?.ready?this.renderSaveState():D}
      ${t?.ready&&s?w`<button class="btn header-btn ${o?`busy`:``}" ?disabled=${o} @click=${()=>this.scan()}
            title=${a?.last_scan?e(`scan.last`,{time:Lr(e,a.last_scan)??``}):e(`scan.never`)}>
            <span class=${o?`spin`:``}>${q(o?Rn:jn,18)}</span>
            <span class="label">${e(o?`action.scanning`:`action.scan`)}</span></button>`:D}
      ${t?.ready&&s&&i?w`<div class="segmented on-header" role="radiogroup">
            <button class=${this._mode===`view`?`active`:``} @click=${()=>this.setMode(`view`)}>
              ${q(hn,16)}<span class="label">${e(`mode.view`)}</span></button>
            <button class=${this._mode===`edit`?`active`:``} @click=${()=>this.setMode(`edit`)}>
              ${q(An,16)}<span class="label">${e(`mode.edit`)}</span></button>
          </div>`:D}
      ${t?.ready?w`<div class="menu-wrap">
            <button class="icon-btn on-header" aria-label=${e(`action.more`)} @click=${()=>this._menu=!this._menu}>
              ${q(fn)}</button>
            ${this._menu?w`<div class="scrim" @click=${()=>this._menu=!1}></div>
                  <div class="menu" role="menu">
                    <button role="menuitem" @click=${()=>this.exportPlan()}>${q(pn,18)} ${e(`action.export`)}</button>
                    ${s?w`<button role="menuitem" @click=${()=>this.importPlan()}>${q(Vn,18)} ${e(`action.import`)}</button>`:D}
                  </div>`:D}
          </div>`:D}
    </header>`}renderBuildingSwitcher(){let e=this.t,t=this.project,n=gt(t,this._buildingId),r=t.buildings.length>1,i=this._site?e(`site.all`):n?.name??``;return w`<div class="menu-wrap building-switch">
      <button class="building-btn on-header" @click=${()=>this._buildingMenu=!this._buildingMenu}
        aria-haspopup="menu" aria-expanded=${this._buildingMenu}>
        ${this._site?q(Tn,18):w`<span class="b-dot" style="background:${n?.color??`currentColor`}"></span>`}
        <span class="label">${i}</span>${q(rn,16)}
      </button>
      ${this._buildingMenu?w`<div class="scrim" @click=${()=>this._buildingMenu=!1}></div>
            <div class="menu building-menu" role="menu">
              ${r?w`<button role="menuitem" class=${this._site?`current`:``} @click=${()=>this.setSite()}>
                    ${q(Tn,18)}<span class="grow">${e(`site.all`)}</span>
                    ${this._site?q(tn,16):D}</button>
                    <div class="menu-sep"></div>`:D}
              ${t.buildings.map(n=>w`<div class="menu-row ${!this._site&&n.id===this._buildingId?`current`:``}">
                  <button role="menuitem" class="grow-btn" @click=${()=>this.setBuilding(n.id)}>
                    <span class="b-dot" style="background:${n.color}"></span>
                    <span class="grow">${n.name}</span>
                    <span class="muted small">${H(t,n.id).length}</span>
                  </button>
                  ${r?w`<button class="icon-btn" ?disabled=${!this.ctrl?.canEdit}
                        title=${n.visible?e(`site.hide`):e(`site.show`)}
                        @click=${()=>this.edit(e=>St(e,n.id,{visible:!n.visible}))}>
                        ${q(n.visible?hn:mn,18)}</button>`:D}
                </div>`)}
              ${this.ctrl?.canEdit?w`<div class="menu-sep"></div>
                    <button role="menuitem" @click=${()=>this.addBuilding()}>
                      ${q(K,18)}<span class="grow">${e(`building.add`)}</span></button>`:D}
            </div>`:D}
    </div>`}renderSaveState(){let e=this.ctrl,t=this.t;if(!e.info?.is_admin)return w`<span class="chip on-header">${q(hn,14)} ${t(`save.readonly`)}</span>`;if(this._mode!==`edit`)return D;let[n,r]={idle:[`save.saved`,`ok`],saved:[`save.saved`,`ok`],dirty:[`save.dirty`,``],saving:[`save.saving`,``],error:[`save.error`,`bad`],conflict:[`save.conflict`,`warn`]}[e.saveState];return w`<span class="save-state ${r}">${t(n)}</span>`}renderRail(){let e=this.t,t=V(this.project,this._floorId),n=(t,n,r,i,a=!1)=>w`<button class="icon-btn ${this._tool===t&&!this._placing?`active`:``}" ?disabled=${a}
        title="${e(r)} (${i})" aria-label=${e(r)} @click=${()=>this.setTool(t)}>${q(n)}</button>`;return w`<aside class="rail">
      ${n(`select`,ln,`tool.select`,`V`)}
      ${n(`wall`,Un,`tool.wall`,`W`)}
      ${n(`room`,Hn,`tool.room`,`R`)}
      ${n(`measure`,Pn,`tool.measure`,`M`)}
      ${n(`calibrate`,Fn,`tool.calibrate`,`C`,!t?.background)}
      ${n(`pan`,vn,`tool.pan`,`H`)}
      <span class="rail-sep"></span>
      <button class="icon-btn" ?disabled=${!this.ctrl?.canUndo} title="${e(`action.undo`)} (Ctrl+Z)" @click=${()=>this.ctrl?.undo()}>${q(Bn)}</button>
      <button class="icon-btn" ?disabled=${!this.ctrl?.canRedo} title="${e(`action.redo`)} (Ctrl+Shift+Z)" @click=${()=>this.ctrl?.redo()}>${q(Mn)}</button>
    </aside>`}renderCanvas(){return w`<zfp-canvas
      .project=${this.project}
      .floorId=${this._floorId}
      .network=${this.ctrl.network}
      .rf=${this._rf}
      .editable=${this.canEdit}
      .tool=${this._tool}
      .layers=${this._layers}
      .linkMode=${this._linkMode}
      .selection=${this._selection}
      .placing=${this._placing}
      .imageUrls=${this._imageUrls}
      .site=${this.siteView}
      .t=${this.t}
      .wallMaterial=${this._wallMaterial}
      .wallThickness=${this._wallThickness}
      .gridSize=${this._gridSize}
      .highlight=${this._highlight}
      .editHint=${!!this.ctrl?.canEdit&&this._mode===`view`}
      @zfp-edit-hint=${()=>this.toast?.show(this.t(`hint.switch_to_edit`))}
      @zfp-commit=${e=>this.edit(e.detail.fn)}
      @zfp-select=${e=>{this._selection=e.detail.ids,e.detail.ids.length&&this.canEdit&&(this._tab=`inspector`)}}
      @zfp-device-click=${e=>this.openDevice(e.detail.ieee)}
      @zfp-placed=${()=>this._placing=null}
      @zfp-calibrate=${this.onCalibrate}
      @zfp-open-building=${e=>this.setBuilding(e.detail.id)}
    ></zfp-canvas>`}renderOverlays(){let e=this.t,t=this.ctrl,n=t.network,r=[];n===null||!n.devices.length&&n.bridge_online===null?r.push(w`<div class="banner warn">${q($t,18)} ${e(`banner.no_data`,{topic:t.info?.base_topic??`zigbee2mqtt`})}</div>`):n.bridge_online===!1?r.push(w`<div class="banner bad">${q($t,18)} ${e(`banner.bridge_offline`)}</div>`):!n.links.length&&n.scan.status!==`scanning`&&t.info?.is_admin&&n.devices.length&&r.push(w`<div class="banner">${q(jn,18)} ${e(`banner.scan_hint`)}
        <button class="btn small primary" @click=${()=>this.scan()}>${e(`action.scan`)}</button></div>`);let i=this._placing?e(`hint.place`,{name:n?.devices.find(e=>e.ieee===this._placing)?.name??``}):this.canEdit?this._site?e(`hint.site`):e(`hint.${this._tool===`image`?`pan`:this._tool}`):null;return w`
      <div class="top-left">
        <button class="fab ${this._layersOpen?`active`:``}" @click=${()=>this._layersOpen=!this._layersOpen}>
          ${q(xn,18)}<span>${e(`layers.title`)}</span></button>
        ${this._layersOpen?this.renderLayers():D}
        ${this.canEdit&&!this._site&&(this._tool===`wall`||this._tool===`room`||this._tool===`select`)?this.renderToolOptions():D}
      </div>
      <div class="banners">${r}</div>
      <div class="zoom">
        <button class="icon-btn" title=${e(`action.zoom_in`)} @click=${()=>this.canvas?.zoomBy(1.3)}>${q(K)}</button>
        <button class="icon-btn" title=${e(`action.zoom_out`)} @click=${()=>this.canvas?.zoomBy(1/1.3)}>${q(Dn)}</button>
        <button class="icon-btn" title="${e(`action.fit`)} (F)" @click=${()=>this.canvas?.fit()}>${q(gn)}</button>
      </div>
      ${this._drawer?D:w`<button class="fab drawer-toggle" @click=${()=>this._drawer=!0}>
            ${q(dn,18)}<span>${e(`tab.devices`)}</span></button>`}
      ${i&&!this.narrow?w`<div class="hint-pill">${i}</div>`:D}
    `}renderLayers(){let e=this.t,t=(t,n)=>w`<label class="layer-row"><span>${e(n)}</span>
        <input type="checkbox" .checked=${this._layers[t]} @change=${e=>{this._layers={...this._layers,[t]:e.target.checked},this.persistPrefs()}} /></label>`;return w`<div class="popover">
      ${t(`heatmap`,`layers.heatmap`)}
      ${t(`links`,`layers.links`)}
      ${t(`labels`,`layers.labels`)}
      ${t(`suggestions`,`layers.suggestions`)}
      ${t(`background`,`layers.background`)}
      <div class="segmented full">
        <button class=${this._linkMode===`tree`?`active`:``} @click=${()=>{this._linkMode=`tree`,this.persistPrefs()}}>${e(`links.tree`)}</button>
        <button class=${this._linkMode===`all`?`active`:``} @click=${()=>{this._linkMode=`all`,this.persistPrefs()}}>${e(`links.all`)}</button>
      </div>
    </div>`}renderToolOptions(){let e=this.t,t=this.project.settings;return w`<div class="tool-options">
      ${this._tool===`wall`?w`<select title=${e(`inspector.material`)} @change=${e=>{this._wallMaterial=e.target.value,this.persistPrefs()}}>
              ${at.map(n=>w`<option value=${n.id} ?selected=${n.id===this._wallMaterial}>
                ${e(`material.${n.id}`)} · ${st(t,n.id)} dB</option>`)}
            </select>
            <select title=${e(`inspector.thickness`)} @change=${e=>{this._wallThickness=parseFloat(e.target.value),this.persistPrefs()}}>
              ${[.08,.1,.15,.2,.25,.3,.4].map(e=>w`<option value=${e} ?selected=${e===this._wallThickness}>${e*100} cm</option>`)}
            </select>`:D}
      <select title="Grid" @change=${e=>{this._gridSize=parseFloat(e.target.value),this.persistPrefs()}}>
        ${ci.map(e=>w`<option value=${e} ?selected=${e===this._gridSize}># ${e*100} cm</option>`)}
      </select>
    </div>`}renderEmpty(){let e=this.t,t=!!this.ctrl?.info?.is_admin;return w`<div class="empty">
      <div class="empty-card">
        <div class="empty-art">${q(_n,56)}</div>
        <h2>${e(`empty.title`)}</h2>
        <p>${e(t?`empty.body`:`empty.readonly`)}</p>
        ${t?w`<button class="btn primary big" @click=${()=>this.addFloor()}>${q(K,18)}
              ${this.project.buildings.length?e(`action.add_floor`):e(`empty.cta`)}</button>`:D}
      </div>
    </div>`}paneContext(){let e=V(this.project,this._floorId),t=this._floorId;return{t:this.t,project:this.project,floor:e,network:this.ctrl.network,rf:this._rf,selection:this._selection,canEdit:this.canEdit,canSwitchToEdit:!!this.ctrl?.canEdit&&this._mode===`view`,site:this._site,displayedFloorIds:this.displayedFloorIds(),building:gt(this.project,e?.buildingId??this._buildingId),editBuilding:(e,t)=>this.edit(n=>St(n,e,t)),deleteBuilding:e=>void this.deleteBuilding(e),openBuilding:e=>this.setBuilding(e),addBuilding:()=>void this.addBuilding(),search:this._search,activeTool:this._tool,edit:this.edit,editWalls:(e,n)=>this.edit(r=>At(r,t,e,n)),editRoom:(e,n)=>this.edit(r=>Mt(r,t,e,n)),editPlacement:(e,t)=>this.edit(n=>Lt(n,e,t)),editFloor:e=>this.edit(n=>Tt(n,t,e)),editSettings:e=>this.edit(t=>zt(t,e)),setSearch:e=>this._search=e,openDevice:e=>this.openDevice(e),startPlacing:e=>{this._placing=e,this.narrow&&(this._drawer=!1)},unplace:e=>this.edit(t=>Rt(t,e)),highlight:e=>this._highlight=e,locateSuggestion:e=>{let t=this.displayedFloorIds(),n=(this._rf?.suggestions??[]).filter(e=>t.includes(e.floorId))[e];n&&this.canvas?.centerOnSite(n.pos)},uploadImage:()=>this.uploadImage(),removeImage:()=>this.edit(e=>Ot(e,t,void 0)),setTool:e=>this.setTool(e),deleteFloor:()=>void this.deleteFloor(),duplicateFloor:()=>this.duplicateFloor()}}renderDrawer(){let e=this.t,t=this.paneContext(),n=[[`inspector`,`tab.inspector`,zn],[`devices`,`tab.devices`,dn],[`coverage`,`tab.coverage`,In]];this._site?n.push([`buildings`,`tab.buildings`,On]):this.canEdit&&n.push([`floor`,`tab.floor`,Ln]);let r=n.some(([e])=>e===this._tab)?this._tab:`devices`;return w`<aside class="drawer"
      @zfp-locate=${e=>this.locate(e.detail.ieee)}
      @zfp-place=${e=>this._placing=e.detail.ieee}
      @zfp-unplace=${e=>{this.edit(t=>Rt(t,e.detail.ieee)),this._selection=[]}}
      @zfp-open-ha=${e=>this.openInHa(e.detail.id)}
      @zfp-open-device=${e=>this.openDevice(e.detail.ieee)}
      @zfp-highlight=${e=>this._highlight=e.detail.ieee}>
      <div class="drawer-tabs" role="tablist">
        ${n.map(([t,n,i])=>w`<button role="tab" class=${r===t?`active`:``} aria-selected=${r===t}
          @click=${()=>this._tab=t}>${q(i,18)}<span>${e(n)}</span></button>`)}
        <button class="icon-btn close" aria-label=${e(`action.close`)} @click=${()=>this._drawer=!1}>${q(an)}</button>
      </div>
      <div class="drawer-body">
        ${r===`inspector`?ei(t):D}
        ${r===`devices`?ni(t):D}
        ${r===`coverage`?ri(t):D}
        ${r===`floor`?ii(t):D}
        ${r===`buildings`?si(t):D}
      </div>
    </aside>`}static{this.styles=[J,$n,Xr,o`
      :host {
        display: block;
        /* HA's panel container only wraps content, so size to the viewport */
        height: 100vh;
        height: 100dvh;
        background: var(--zfp-bg);
      }
      .app {
        display: grid;
        grid-template-rows: auto 1fr;
        height: 100%;
        position: relative;
        overflow: hidden;
        container: zfp-app / inline-size;
      }
      /* medium widths: the drawer floats over the plan instead of squeezing it */
      @container zfp-app (max-width: 1100px) {
        .app:not(.narrow) .body.with-drawer {
          grid-template-columns: 1fr;
        }
        .app:not(.narrow) .body.editing.with-drawer {
          grid-template-columns: 60px 1fr;
        }
        .app:not(.narrow) .drawer {
          position: absolute;
          top: 8px;
          right: 8px;
          bottom: 8px;
          width: min(340px, calc(100% - 84px));
          border: 1px solid var(--zfp-divider);
          border-radius: 16px;
          box-shadow: var(--zfp-shadow-lg);
          z-index: 8;
          overflow: hidden;
        }
      }
      .topbar {
        display: flex;
        align-items: center;
        gap: 10px;
        height: var(--header-height, 56px);
        padding: 0 12px 0 16px;
        background: var(--app-header-background-color, var(--zfp-surface));
        color: var(--app-header-text-color, var(--zfp-text));
        border-bottom: var(--app-header-border-bottom, 1px solid var(--zfp-divider));
        box-sizing: border-box;
        min-width: 0;
      }
      .narrow .topbar {
        padding-left: 4px;
        flex-wrap: wrap;
        height: auto;
        min-height: var(--header-height, 56px);
        row-gap: 0;
      }
      .narrow .brand {
        min-height: 56px;
      }
      .narrow .floors {
        order: 10;
        flex-basis: 100%;
        margin: 0 0 8px;
        min-height: 0;
        padding: 0 8px;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 20px;
        font-weight: 400;
        white-space: nowrap;
      }
      .narrow .brand span,
      .narrow .label {
        display: none;
      }
      .on-header {
        color: inherit;
      }
      .icon-btn.on-header:hover {
        background: color-mix(in srgb, currentColor 12%, transparent);
        color: inherit;
      }
      .floors {
        display: flex;
        gap: 4px;
        overflow-x: auto;
        scrollbar-width: none;
        margin-left: 12px;
        min-width: 0;
      }
      .floor-tab {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 34px;
        padding: 0 14px;
        border-radius: 17px;
        border: none;
        background: transparent;
        color: inherit;
        opacity: 0.75;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        transition: background 0.15s, opacity 0.15s;
      }
      .floor-tab:hover {
        opacity: 1;
        background: color-mix(in srgb, currentColor 10%, transparent);
      }
      .floor-tab.active {
        opacity: 1;
        background: color-mix(in srgb, currentColor 16%, transparent);
      }
      .floor-tab.add {
        padding: 0 10px;
      }
      .spacer {
        flex: 1;
      }
      .header-btn {
        background: color-mix(in srgb, currentColor 10%, transparent);
        border-color: transparent;
        color: inherit;
      }
      .header-btn:hover {
        background: color-mix(in srgb, currentColor 18%, transparent);
      }
      .segmented.on-header {
        background: color-mix(in srgb, currentColor 12%, transparent);
      }
      .segmented.on-header button {
        color: inherit;
        opacity: 0.8;
      }
      .segmented.on-header button.active {
        opacity: 1;
        background: var(--zfp-surface);
        color: var(--zfp-text);
      }
      .spin {
        display: inline-flex;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .save-state {
        font-size: 12px;
        font-weight: 500;
        opacity: 0.8;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .save-state::before {
        content: "";
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.6;
      }
      .save-state.ok::before {
        background: var(--zfp-success);
        opacity: 1;
      }
      .save-state.bad::before {
        background: var(--zfp-error);
        opacity: 1;
      }
      .save-state.warn::before {
        background: var(--zfp-warning);
        opacity: 1;
      }
      .menu-wrap {
        position: relative;
      }
      .scrim {
        position: fixed;
        inset: 0;
        z-index: 30;
      }
      .menu {
        position: absolute;
        right: 0;
        top: 44px;
        z-index: 31;
        min-width: 220px;
        padding: 6px;
        border-radius: 14px;
        background: var(--zfp-surface);
        color: var(--zfp-text);
        box-shadow: var(--zfp-shadow-lg);
        display: grid;
        animation: drop 0.15s var(--zfp-ease);
      }
      .menu button {
        display: flex;
        align-items: center;
        gap: 10px;
        height: 40px;
        padding: 0 12px;
        border: none;
        background: none;
        border-radius: 8px;
        cursor: pointer;
        text-align: left;
        font-size: 14px;
      }
      .menu button:hover {
        background: var(--zfp-surface-2);
      }
      .building-switch {
        margin-left: 8px;
      }
      .building-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 36px;
        padding: 0 10px 0 12px;
        border-radius: 18px;
        border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        max-width: 240px;
      }
      .building-btn .label {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .building-btn:hover {
        background: color-mix(in srgb, currentColor 10%, transparent);
      }
      .b-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex: none;
      }
      .building-menu {
        left: 0;
        right: auto;
        min-width: 260px;
      }
      .menu .grow {
        flex: 1;
      }
      .menu .current {
        color: var(--zfp-accent);
      }
      .menu-row {
        display: flex;
        align-items: center;
        border-radius: 8px;
      }
      .menu-row.current {
        background: var(--zfp-accent-soft);
      }
      .menu-row .grow-btn {
        flex: 1;
        min-width: 0;
      }
      .menu-sep {
        height: 1px;
        background: var(--zfp-divider);
        margin: 4px 6px;
      }
      .small {
        font-size: 12px;
      }
      @keyframes drop {
        from {
          opacity: 0;
          transform: translateY(-6px);
        }
      }
      .body {
        display: grid;
        grid-template-columns: 1fr;
        min-height: 0;
        position: relative;
      }
      .body.editing {
        grid-template-columns: 60px 1fr;
      }
      .body.with-drawer {
        grid-template-columns: 1fr 360px;
      }
      .body.editing.with-drawer {
        grid-template-columns: 60px 1fr 360px;
      }
      .narrow .body,
      .narrow .body.editing,
      .narrow .body.with-drawer,
      .narrow .body.editing.with-drawer {
        grid-template-columns: 1fr;
      }
      .rail {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 10px 0;
        background: var(--zfp-surface);
        border-right: 1px solid var(--zfp-divider);
        z-index: 2;
      }
      .rail .icon-btn {
        width: 42px;
        height: 42px;
        border-radius: 12px;
      }
      .rail-sep {
        width: 28px;
        height: 1px;
        background: var(--zfp-divider);
        margin: 6px 0;
      }
      .narrow .rail {
        position: absolute;
        left: 50%;
        bottom: 16px;
        transform: translateX(-50%);
        flex-direction: row;
        padding: 6px;
        border-radius: 18px;
        border: none;
        box-shadow: var(--zfp-shadow-lg);
        z-index: 6;
        max-width: calc(100% - 24px);
        overflow-x: auto;
      }
      .narrow .rail-sep {
        width: 1px;
        height: 28px;
        margin: 0 4px;
      }
      .stage {
        position: relative;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
      }
      zfp-canvas {
        position: absolute;
        inset: 0;
      }
      .top-left {
        position: absolute;
        top: 12px;
        left: 12px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
        z-index: 4;
        flex-wrap: wrap;
        max-width: calc(100% - 24px);
      }
      .fab {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 36px;
        padding: 0 12px;
        border-radius: 18px;
        border: 1px solid var(--zfp-divider);
        background: var(--zfp-surface);
        box-shadow: var(--zfp-shadow);
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        color: var(--zfp-text);
      }
      .fab.active {
        border-color: var(--zfp-accent);
        color: var(--zfp-accent);
      }
      .popover {
        position: absolute;
        top: 44px;
        left: 0;
        width: 230px;
        padding: 8px;
        border-radius: 14px;
        background: var(--zfp-surface);
        box-shadow: var(--zfp-shadow-lg);
        display: grid;
        gap: 2px;
        animation: drop 0.15s var(--zfp-ease);
      }
      .layer-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 36px;
        padding: 0 8px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
      }
      .layer-row:hover {
        background: var(--zfp-surface-2);
      }
      .segmented.full {
        display: flex;
        margin-top: 6px;
      }
      .segmented.full button {
        flex: 1;
        justify-content: center;
      }
      .tool-options {
        display: flex;
        gap: 6px;
        max-width: 100%;
        overflow-x: auto;
        scrollbar-width: none;
        box-sizing: border-box;
        padding: 4px;
        border-radius: 20px;
        background: var(--zfp-surface);
        box-shadow: var(--zfp-shadow);
        border: 1px solid var(--zfp-divider);
      }
      .tool-options select {
        height: 28px;
        border-radius: 14px;
        border: none;
        background: var(--zfp-surface-2);
        width: auto;
        font-size: 13px;
        padding: 0 8px;
      }
      .banners {
        position: absolute;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        display: grid;
        gap: 8px;
        z-index: 3;
        width: max-content;
        max-width: calc(100% - 280px);
      }
      .narrow .banners {
        top: 58px;
        max-width: calc(100% - 24px);
      }
      .banner {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 8px 6px 14px;
        min-height: 36px;
        box-sizing: border-box;
        border-radius: 18px;
        background: var(--zfp-surface);
        box-shadow: var(--zfp-shadow);
        font-size: 13px;
        animation: drop 0.2s var(--zfp-ease);
      }
      .banner.warn {
        color: var(--zfp-warning);
      }
      .banner.bad {
        color: var(--zfp-error);
      }
      .zoom {
        position: absolute;
        right: 12px;
        bottom: 16px;
        display: grid;
        border-radius: 14px;
        background: var(--zfp-surface);
        box-shadow: var(--zfp-shadow);
        z-index: 3;
        padding: 2px;
      }
      .narrow .zoom {
        bottom: 84px;
      }
      .drawer-toggle {
        position: absolute;
        right: 12px;
        top: 12px;
        z-index: 3;
      }
      .hint-pill {
        position: absolute;
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
        padding: 8px 16px;
        border-radius: 18px;
        background: color-mix(in srgb, var(--zfp-surface) 92%, transparent);
        backdrop-filter: blur(6px);
        box-shadow: var(--zfp-shadow);
        font-size: 12.5px;
        color: var(--zfp-text-2);
        white-space: nowrap;
        max-width: calc(100% - 200px);
        overflow: hidden;
        text-overflow: ellipsis;
        z-index: 2;
        pointer-events: none;
      }
      .drawer {
        display: grid;
        grid-template-rows: auto 1fr;
        min-height: 0;
        background: var(--zfp-surface);
        border-left: 1px solid var(--zfp-divider);
        z-index: 2;
        animation: slide 0.22s var(--zfp-ease);
      }
      @keyframes slide {
        from {
          transform: translateX(24px);
          opacity: 0;
        }
      }
      .narrow .drawer {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        max-height: 70%;
        border-left: none;
        border-radius: 20px 20px 0 0;
        box-shadow: var(--zfp-shadow-lg);
        z-index: 8;
        animation: sheet 0.25s var(--zfp-ease);
      }
      @keyframes sheet {
        from {
          transform: translateY(40px);
          opacity: 0;
        }
      }
      .drawer-tabs {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 8px 8px 0;
        border-bottom: 1px solid var(--zfp-divider);
      }
      .drawer-tabs button[role="tab"] {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 6px 4px 8px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        color: var(--zfp-text-2);
        border-bottom: 2px solid transparent;
        transition: color 0.15s, border-color 0.15s;
      }
      .drawer-tabs button[role="tab"].active {
        color: var(--zfp-accent);
        border-bottom-color: var(--zfp-accent);
      }
      .drawer-tabs .close {
        flex: none;
        align-self: center;
      }
      .narrow .drawer-tabs .close {
        transform: rotate(90deg);
      }
      .drawer-body {
        overflow-y: auto;
        padding: 16px;
        display: grid;
        gap: 22px;
        align-content: start;
      }
      .empty {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        padding: 24px;
        background: radial-gradient(circle at 50% 30%, var(--zfp-accent-soft), transparent 60%);
      }
      .empty-card {
        max-width: 440px;
        text-align: center;
        display: grid;
        justify-items: center;
        gap: 12px;
        animation: drop 0.3s var(--zfp-ease);
      }
      .empty-art {
        width: 104px;
        height: 104px;
        border-radius: 32px;
        display: grid;
        place-items: center;
        color: var(--zfp-accent);
        background: var(--zfp-surface);
        box-shadow: var(--zfp-shadow-lg);
        margin-bottom: 8px;
      }
      .empty h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
      }
      .empty p {
        margin: 0 0 8px;
        color: var(--zfp-text-2);
        line-height: 1.55;
      }
      .btn.big {
        height: 44px;
        padding: 0 22px;
        border-radius: 22px;
        font-size: 15px;
      }
      .update-bar {
        position: absolute;
        top: calc(var(--header-height, 56px) + 12px);
        left: 50%;
        transform: translateX(-50%);
        z-index: 25;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 6px 6px 14px;
        border-radius: 20px;
        background: var(--zfp-accent);
        color: var(--zfp-on-accent);
        box-shadow: var(--zfp-shadow-lg);
        font-size: 14px;
        white-space: nowrap;
        animation: drop 0.2s var(--zfp-ease);
      }
      .update-bar .btn.primary {
        background: var(--zfp-on-accent);
        color: var(--zfp-accent);
      }
      .loading,
      .center-msg {
        display: grid;
        place-items: center;
        align-content: center;
        gap: 8px;
        color: var(--zfp-text-2);
      }
      .spinner {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid var(--zfp-accent-soft);
        border-top-color: var(--zfp-accent);
        animation: spin 0.8s linear infinite;
      }
    `]}};customElements.get(`zigbee-floorplan-panel`)||customElements.define(`zigbee-floorplan-panel`,fi);var pi=[`heatmap`,`links`,`labels`,`background`,`suggestions`],mi=[`heatmap`,`links`,`labels`,`background`],hi=class extends A{static{this.properties={hass:{attribute:!1},_config:{state:!0},_floorId:{state:!0},_rf:{state:!0},_detail:{state:!0},_imageUrls:{state:!0},_level:{state:!0},_highlight:{state:!0},_tick:{state:!0}}}constructor(){super(),this.imagesRequested=/* @__PURE__ */ new Set,this.siteViewObj=null,this._floorId=null,this._rf=null,this._detail=null,this._imageUrls={},this._level=0,this._highlight=null,this._tick=0}static getConfigElement(){return document.createElement(`zigbee-floorplan-card-editor`)}static getStubConfig(){return{height:420,layers:mi,show_floor_tabs:!0,links:`tree`}}setConfig(e){if(!e||typeof e!=`object`)throw Error(`Invalid configuration`);if(e.height!==void 0&&(typeof e.height!=`number`||e.height<150))throw Error(`height must be a number ≥ 150`);if(e.layers&&(!Array.isArray(e.layers)||e.layers.some(e=>!pi.includes(e))))throw Error(`layers must be a list of: ${pi.join(`, `)}`);if(e.links&&e.links!==`tree`&&e.links!==`all`)throw Error(`links must be tree or all`);this._config=e,e.floor&&(this._floorId=e.floor),typeof e.level==`number`&&(this._level=e.level)}getCardSize(){return Math.ceil((this._config?.height??420)/50)+1}getGridOptions(){return{columns:12,rows:Math.ceil(((this._config?.height??420)+60)/64),min_columns:6,min_rows:4}}get t(){return Ir(this.hass?.locale?.language??this.hass?.language)}connectedCallback(){super.connectedCallback(),this.hass&&this.attach()}disconnectedCallback(){super.disconnectedCallback(),this.detach?.(),this.detach=void 0,this.rfClient?.dispose(),this.rfClient=void 0}attach(){this.detach||(this.ctrl=Br.for(this.hass),this.rfClient=new Wr(e=>this._rf=e),this.detach=this.ctrl.attach(()=>this.onChange()),this.onChange())}willUpdate(e){e.has(`hass`)&&this.hass&&(this.detach?this.ctrl?.setHass(this.hass):this.attach()),e.has(`_config`)&&this.ctrl&&this.onChange()}onChange(){let e=this.ctrl;if(!e?.ready){this._tick++;return}let t=this.cardFloors();if(!this.isSite&&!t.find(e=>e.id===this._floorId)&&(this._floorId=t.find(e=>e.id===this._config?.floor)?.id??t[0]?.id??null),this.isSite){let t=bt(e.project);t.length&&!t.includes(this._level)&&(this._level=t[0])}let n=this.layers(),r=this.displayedFloorIds();r.length&&this.rfClient&&(n.heatmap||n.suggestions)&&this.rfClient.request({project:e.project,devices:(e.network?.devices??[]).map(e=>({ieee:e.ieee,type:e.type})),links:e.network?.links??[],floorIds:r,suggest:n.suggestions}),this.resolveImages(),this._tick++}get isSite(){return this._config?.building===`site`}cardFloors(){let e=this.ctrl.project,t=this._config?.building;return H(e,t&&t!==`site`&&e.buildings.some(e=>e.id===t)?t:V(e,this._config?.floor)?.buildingId??V(e,this._floorId)?.buildingId??e.buildings[0]?.id)}displayedFloorIds(){return this.ctrl?.ready?this.isSite?yt(this.ctrl.project,this._level).map(e=>e.id):this._floorId?[this._floorId]:[]:[]}get siteView(){return this.isSite?(this.siteViewObj?.level!==this._level&&(this.siteViewObj={level:this._level}),this.siteViewObj):this.siteViewObj=null}async resolveImages(){if(this.layers().background)for(let e of this.displayedFloorIds()){let t=V(this.ctrl.project,e)?.background?.imageId;if(t&&!this.imagesRequested.has(t)){this.imagesRequested.add(t);try{let e=await this.ctrl.api.imageUrl(t);this._imageUrls={...this._imageUrls,[t]:e}}catch{this.imagesRequested.delete(t)}}}}layers(){let e=this._config?.layers??mi;return Object.fromEntries(pi.map(t=>[t,e.includes(t)]))}render(){if(!this._config)return D;let e=this.t,t=this.ctrl,n=this._config.height??420,r=t?.ready?this.cardFloors():[],i=t?.ready&&this.isSite?bt(t.project):[],a=t?.ready?V(t.project,this._floorId):void 0,o=this.isSite?!!t?.ready&&t.project.buildings.some(e=>e.visible):!!a,s=(this._config.show_floor_tabs??!0)&&(this.isSite?i.length>1:r.length>1),c=this._detail?t?.network?.devices.find(e=>e.ieee===this._detail):void 0,l=this.layers();return w`<ha-card>
      ${this._config.title||s?w`<div class="head">
            ${this._config.title?w`<div class="title">${this._config.title}</div>`:D}
            ${s?w`<div class="tabs">${this.isSite?i.map(t=>w`<button class=${t===this._level?`active`:``} @click=${()=>{this._level=t,this._detail=null,this.onChange()}}>${e(`site.level`,{n:t})}</button>`):r.map(e=>w`<button class=${e.id===this._floorId?`active`:``} @click=${()=>{this._floorId=e.id,this._detail=null,this.onChange()}}>${e.name}</button>`)}</div>`:D}
          </div>`:D}
      <div class="stage" style="height:${n}px">
        ${t?.ready?o?w`<zfp-canvas
                  .project=${t.project}
                  .floorId=${this._floorId}
                  .network=${t.network}
                  .rf=${this._rf}
                  .editable=${!1}
                  .layers=${l}
                  .linkMode=${this._config.links??`tree`}
                  .selection=${this._detail?[Y+this._detail]:[]}
                  .imageUrls=${this._imageUrls}
                  .site=${this.siteView}
                  .highlight=${this._highlight}
                  .t=${e}
                  @zfp-device-click=${e=>this._detail=e.detail.ieee}
                ></zfp-canvas>
                <button class="icon-btn fit" title=${e(`action.fit`)}
                  @click=${()=>this.renderRoot.querySelector(`zfp-canvas`)?.fit()}>
                  ${q(gn,18)}</button>
                ${l.heatmap?w`<div class="legend">${Yt.slice(0,4).map(t=>w`<span><i style="background:${t.color}"></i>${e(`band.${t.id}`)}</span>`)}</div>`:D}
                ${c?w`<div class="sheet"
                      @zfp-close=${()=>this._detail=null}
                      @zfp-open-device=${e=>this._detail=e.detail.ieee}
                      @zfp-highlight=${e=>this._highlight=e.detail.ieee}
                      @zfp-locate=${e=>{let n=t.project.placements[e.detail.ieee];n&&this.renderRoot.querySelector(`zfp-canvas`)?.centerOn(n)}}
                      @zfp-open-ha=${e=>{history.pushState(null,``,`/config/devices/device/${e.detail.id}`),window.dispatchEvent(new CustomEvent(`location-changed`,{detail:{replace:!1}}))}}>
                      <zfp-device-detail closable
                        .device=${c}
                        .placement=${t.project.placements[c.ieee]}
                        .network=${t.network}
                        .floors=${t.project.floors}
                        .rssi=${this._rf?.deviceRssi[c.ieee]}
                        .t=${e}
                      ></zfp-device-detail>
                    </div>`:D}`:w`<div class="msg">${q(_n,36)}<span>${e(`card.no_plan`)}</span></div>`:w`<div class="msg">${t?.loadError??w`<div class="spinner"></div>`}</div>`}
      </div>
    </ha-card>`}static{this.styles=[J,$n,o`
      :host {
        display: block;
      }
      ha-card {
        overflow: hidden;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px 8px;
        flex-wrap: wrap;
      }
      .title {
        font-size: 16px;
        font-weight: 500;
        flex: 1;
      }
      .tabs {
        display: flex;
        gap: 4px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .tabs button {
        height: 30px;
        padding: 0 12px;
        border-radius: 15px;
        border: none;
        background: var(--zfp-surface-2);
        color: var(--zfp-text-2);
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
      }
      .tabs button.active {
        background: var(--zfp-accent-soft);
        color: var(--zfp-accent);
      }
      .stage {
        position: relative;
        flex: 1 1 auto;
        min-height: 150px;
      }
      zfp-canvas {
        position: absolute;
        inset: 0;
      }
      .fit {
        position: absolute;
        top: 8px;
        right: 8px;
        background: var(--zfp-surface);
        box-shadow: var(--zfp-shadow);
      }
      .legend {
        position: absolute;
        right: 10px;
        bottom: 10px;
        display: flex;
        gap: 10px;
        padding: 4px 10px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--zfp-surface) 88%, transparent);
        backdrop-filter: blur(4px);
        font-size: 11px;
        color: var(--zfp-text-2);
        pointer-events: none;
      }
      .legend span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .legend i {
        width: 10px;
        height: 10px;
        border-radius: 3px;
      }
      .msg {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        align-content: center;
        gap: 10px;
        text-align: center;
        padding: 24px;
        color: var(--zfp-text-2);
        font-size: 14px;
      }
      .sheet {
        position: absolute;
        top: 8px;
        right: 8px;
        bottom: 8px;
        width: min(320px, calc(100% - 16px));
        overflow-y: auto;
        padding: 16px;
        box-sizing: border-box;
        border-radius: 16px;
        background: var(--zfp-surface);
        box-shadow: var(--zfp-shadow-lg);
        animation: slide 0.2s var(--zfp-ease);
        z-index: 2;
      }
      @keyframes slide {
        from {
          transform: translateX(16px);
          opacity: 0;
        }
      }
      .spinner {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid var(--zfp-accent-soft);
        border-top-color: var(--zfp-accent);
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `]}};customElements.get(`zigbee-floorplan-card`)||customElements.define(`zigbee-floorplan-card`,hi);var gi=class extends A{static{this.properties={hass:{attribute:!1},_config:{state:!0},_tick:{state:!0}}}constructor(){super(),this._tick=0}setConfig(e){this._config=e}willUpdate(){this.hass&&!this.detach&&(this.ctrl=Br.for(this.hass),this.detach=this.ctrl.attach(()=>this._tick++))}disconnectedCallback(){super.disconnectedCallback(),this.detach?.(),this.detach=void 0}render(){if(!this.hass||!this._config)return D;let e=Ir(this.hass.locale?.language??this.hass.language),t=this.ctrl?.ready?this.ctrl.project:null,n=t?.floors??[],r=(t?.buildings.length??0)>1,i=e=>r?`${t.buildings.find(t=>t.id===e.buildingId)?.name??``} · ${e.name}`:e.name,a=[`heatmap`,`links`,`labels`,`background`,`suggestions`].map(t=>({value:t,label:e(`layers.${t}`)})),o=[{name:`title`,selector:{text:{}}},{name:`building`,selector:{select:{mode:`dropdown`,options:[{value:``,label:`—`},...r?[{value:`site`,label:e(`site.all`)}]:[],...(t?.buildings??[]).map(e=>({value:e.id,label:e.name}))]}}},{name:`floor`,selector:{select:{mode:`dropdown`,options:[{value:``,label:`—`},...n.map(e=>({value:e.id,label:i(e)}))]}}},{name:`height`,selector:{number:{min:200,max:1400,step:10,mode:`box`,unit_of_measurement:`px`}}},{name:`layers`,selector:{select:{multiple:!0,mode:`list`,options:a}}},{name:`links`,selector:{select:{mode:`dropdown`,options:[{value:`tree`,label:e(`links.tree`)},{value:`all`,label:e(`links.all`)}]}}},{name:`show_floor_tabs`,selector:{boolean:{}}}],s={title:`card.title`,building:`card.building`,floor:`card.floor`,height:`card.height`,layers:`card.layers`,links:`card.links`,show_floor_tabs:`card.show_tabs`},c={height:420,layers:mi,links:`tree`,show_floor_tabs:!0,...this._config,floor:this._config.floor??``,building:this._config.building??``};return w`<ha-form
      .hass=${this.hass}
      .data=${c}
      .schema=${o}
      .computeLabel=${t=>e(s[t.name])}
      @value-changed=${e=>{let t={...e.detail.value};t.floor||delete t.floor,t.title||delete t.title,t.building||delete t.building,this._config={...t,type:this._config.type},this.dispatchEvent(new CustomEvent(`config-changed`,{detail:{config:this._config},bubbles:!0,composed:!0}))}}
    ></ha-form>`}};customElements.get(`zigbee-floorplan-card-editor`)||customElements.define(`zigbee-floorplan-card-editor`,gi),window.customCards=window.customCards??[],window.customCards.some(e=>e.type===`zigbee-floorplan-card`)||window.customCards.push({type:`zigbee-floorplan-card`,name:`Zigbee Floorplan`,description:`Zigbee2MQTT mesh, devices and estimated coverage on your floor plan.`,preview:!0}),console.info(`%c ZIGBEE-FLOORPLAN %c 0.1.0 `,`color:#fff;background:#7c3aed;font-weight:700;border-radius:4px 0 0 4px;padding:2px 4px`,`color:#7c3aed;background:#ede9fe;border-radius:0 4px 4px 0;padding:2px 4px`);