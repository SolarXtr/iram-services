var p={},$=(A,j,D)=>(p.__chunk_7185=()=>{},p.__chunk_3417=(y,I,O)=>{"use strict";let c,a,s,w,d;var E=Object.create,i=Object.defineProperty,q=Object.getOwnPropertyDescriptor,f=Object.getOwnPropertyNames,P=Object.getPrototypeOf,C=Object.prototype.hasOwnProperty,g=(e,t,o,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of f(t))C.call(e,r)||r===o||i(e,r,{get:()=>t[r],enumerable:!(n=q(t,r))||n.enumerable});return e},R=(c={"../../node_modules/dedent-tabs/dist/dedent-tabs.js"(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t){for(var o=typeof t=="string"?[t]:t.raw,n="",r=0;r<o.length;r++)if(n+=o[r].replace(/\\\n[ \t]*/g,"").replace(/\\`/g,"`").replace(/\\\$/g,"$").replace(/\\\{/g,"{"),r<(1>=arguments.length?0:arguments.length-1)){var M=n.substring(n.lastIndexOf(`
`)+1).match(/^(\s*)\S?/);n+=((1>r+1||arguments.length<=r+1?void 0:arguments[r+1])+"").replace(/\n/g,`
`+M[1])}var _=n.split(`
`),u=null;if(_.forEach(function(l){var v=l.match(/^(\s+)\S+/);if(v){var x=v[1].length;u=u?(0,Math.min)(u,x):x}}),u!==null){var N=u;n=_.map(function(l){return l[0]===" "||l[0]==="	"?l.slice(N):l}).join(`
`)}return n.trim().replace(/\\n/g,`
`)}}},function(){return a||(0,c[f(c)[0]])((a={exports:{}}).exports,a),a.exports}),h={};((e,t)=>{for(var o in t)i(e,o,{get:t[o],enumerable:!0})})(h,{getOptionalRequestContext:()=>b,getRequestContext:()=>k}),y.exports=g(i({},"__esModule",{value:!0}),h),O(7185);var m=(d=(s=R())!=null?E(P(s)):{},g(!w&&s&&s.__esModule?d:i(d,"default",{value:s,enumerable:!0}),s)),S=Symbol.for("__cloudflare-request-context__");function b(){let e=j[S];if((process?.release?.name==="node"?"nodejs":"edge")=="nodejs")throw Error(m.default`
			\`getRequestContext\` and \`getOptionalRequestContext\` can only be run
			inside the edge runtime, so please make sure to have included
			\`export const runtime = 'edge'\` in all the routes using such functions
			(regardless of whether they are used directly or indirectly through imports).
		`);return e}function k(){let e=b();if(!e)throw process?.env?.NEXT_PHASE==="phase-production-build"?Error(m.default`
				\n\`getRequestContext\` is being called at the top level of a route file, this is not supported
				for more details see https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/troubleshooting/#top-level-getrequestcontext \n
			`):Error("Failed to retrieve the Cloudflare request context.");return e}},p);export{$ as __getNamedExports};
