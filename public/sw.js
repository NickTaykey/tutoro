if(!self.define){let e,s={};const n=(n,a)=>(n=new URL(n+".js",a).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(a,c)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let i={};const r=e=>n(e,t),o={module:{uri:t},exports:i,require:r};s[t]=Promise.all(a.map((e=>o[e]||r(e)))).then((e=>(c(...e),i)))}}define(["./workbox-6a1bf588"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/9SqmZCpOfhqhRwtEzoqPy/_buildManifest.js",revision:"704df9a011a93c7fec236fdc4652045b"},{url:"/_next/static/9SqmZCpOfhqhRwtEzoqPy/_middlewareManifest.js",revision:"fb2823d66b3e778e04a3f681d0d2fb19"},{url:"/_next/static/9SqmZCpOfhqhRwtEzoqPy/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/193.5e4e4e381296c5f7.js",revision:"5e4e4e381296c5f7"},{url:"/_next/static/chunks/1e74bd89-7a0c328116792a2c.js",revision:"7a0c328116792a2c"},{url:"/_next/static/chunks/252f366e-b26435c27fbb6f23.js",revision:"b26435c27fbb6f23"},{url:"/_next/static/chunks/2c796e83.6c2c02564b6eab33.js",revision:"6c2c02564b6eab33"},{url:"/_next/static/chunks/403-27169da89f414454.js",revision:"27169da89f414454"},{url:"/_next/static/chunks/576-c64e6210f6e1b87e.js",revision:"c64e6210f6e1b87e"},{url:"/_next/static/chunks/653-0c04bb8ed47d687b.js",revision:"0c04bb8ed47d687b"},{url:"/_next/static/chunks/664-41844e7ff48658f9.js",revision:"41844e7ff48658f9"},{url:"/_next/static/chunks/675-b1c0bfa226b363b1.js",revision:"b1c0bfa226b363b1"},{url:"/_next/static/chunks/699-7dc182310d19c601.js",revision:"7dc182310d19c601"},{url:"/_next/static/chunks/764-0fdcb4c2837ffb20.js",revision:"0fdcb4c2837ffb20"},{url:"/_next/static/chunks/78e521c3-14c7c31c6f9ea806.js",revision:"14c7c31c6f9ea806"},{url:"/_next/static/chunks/93-07c635f1ec23a051.js",revision:"07c635f1ec23a051"},{url:"/_next/static/chunks/framework-4556c45dd113b893.js",revision:"4556c45dd113b893"},{url:"/_next/static/chunks/main-8ba0688acd913e7a.js",revision:"8ba0688acd913e7a"},{url:"/_next/static/chunks/pages/_app-7ceab99e09da3f92.js",revision:"7ceab99e09da3f92"},{url:"/_next/static/chunks/pages/_error-0a004b8b8498208d.js",revision:"0a004b8b8498208d"},{url:"/_next/static/chunks/pages/index-97347c641f7943bb.js",revision:"97347c641f7943bb"},{url:"/_next/static/chunks/pages/tutors-8b6026415fcb125e.js",revision:"8b6026415fcb125e"},{url:"/_next/static/chunks/pages/tutors/%5BtutorId%5D-2a266b139d8e9381.js",revision:"2a266b139d8e9381"},{url:"/_next/static/chunks/pages/tutors/%5BtutorId%5D/posts/new-818cd65a54b6901d.js",revision:"818cd65a54b6901d"},{url:"/_next/static/chunks/pages/tutors/%5BtutorId%5D/sessions/new-2d942399d1829fdb.js",revision:"2d942399d1829fdb"},{url:"/_next/static/chunks/pages/users/become-tutor-c183e2a1bc82d07c.js",revision:"c183e2a1bc82d07c"},{url:"/_next/static/chunks/pages/users/tutor-profile-24fc91773df3a57a.js",revision:"24fc91773df3a57a"},{url:"/_next/static/chunks/pages/users/user-profile-7c4ad853dff623ba.js",revision:"7c4ad853dff623ba"},{url:"/_next/static/chunks/polyfills-5cd94c89d3acac5f.js",revision:"99442aec5788bccac9b2f0ead2afdd6b"},{url:"/_next/static/chunks/webpack-9ad9990fe53401c3.js",revision:"9ad9990fe53401c3"},{url:"/_next/static/css/7815d0f708d59fcc.css",revision:"7815d0f708d59fcc"},{url:"/_next/static/css/b5e81bd91e7918d5.css",revision:"b5e81bd91e7918d5"},{url:"/_next/static/media/404-illustration.4a96a14f.png",revision:"379a7aa6fb54117e2e0df4908d3720cf"},{url:"/favicon/android-chrome-192x192.png",revision:"46774946781edeab26d7d4e58e3d6e2f"},{url:"/favicon/android-chrome-256x256.png",revision:"075a7ee2be9771fa02283954928a9943"},{url:"/favicon/apple-touch-icon.png",revision:"08c282f60766bc44ade0574355297b32"},{url:"/favicon/favicon-16x16.png",revision:"a3b26679969ed5578530a152b3f9af20"},{url:"/favicon/favicon-32x32.png",revision:"44fa0436022bd25ec2e1e66280545849"},{url:"/favicon/favicon.ico",revision:"be648e327e203aff315ee44dcb16c1bf"},{url:"/favicon/mstile-150x150.png",revision:"8ac096247aea7c85d95c519103141825"},{url:"/favicon/safari-pinned-tab.svg",revision:"24882eaa221a985f9745a5b34d0c9af3"},{url:"/icon-192x192.png",revision:"afe553f75107f5f767332a8523587af2"},{url:"/images/404-illustration.png",revision:"379a7aa6fb54117e2e0df4908d3720cf"},{url:"/manifest.json",revision:"b90c66119b76237c5219a75df858a6f0"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:n,state:a})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
