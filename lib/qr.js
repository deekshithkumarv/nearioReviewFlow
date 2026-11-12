// Minimal QR code encoder (byte mode, error correction level L, versions 1-6: up to 134 bytes, plenty for a feedback URL).
// Moved from the original prototype. make(text) returns a square boolean matrix (true = dark), or null if too long.
// Verified against a QR decoder in test/qr.test.js.
const QR = (function () {
  var EXP=[],LOG=[];(function(){var x=1;for(var i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=285}for(i=255;i<512;i++)EXP[i]=EXP[i-255]})();
  function mul(a,b){return a&&b?EXP[LOG[a]+LOG[b]]:0}
  function rs(data,n){var g=[1];for(var i=0;i<n;i++){var ng=new Array(g.length+1).fill(0);for(var j=0;j<g.length;j++){ng[j]^=g[j];ng[j+1]^=mul(g[j],EXP[i])}g=ng}
    var r=data.concat(new Array(n).fill(0));for(i=0;i<data.length;i++){var c=r[i];if(c)for(j=0;j<g.length;j++)r[i+j]^=mul(g[j],c)}return r.slice(data.length)}
  /* version: [total codewords, data codewords (L), ec per block, blocks] */
  var V={1:[26,19,7,1],2:[44,34,10,1],3:[70,55,15,1],4:[100,80,20,1],5:[134,108,26,1],6:[172,136,18,2],7:[196,156,20,2],8:[242,194,24,2],9:[292,232,30,2],10:[346,274,18,4]};
  var AL={2:[6,18],3:[6,22],4:[6,26],5:[6,30],6:[6,34],7:[6,22,38],8:[6,24,42],9:[6,26,46],10:[6,28,50]};
  function make(text){
    var bytes=Array.from(new TextEncoder().encode(text)),ver=0;
    for(var v=1;v<=6;v++)  /* v7+ needs version-info blocks, which this encoder does not draw */{var cap=V[v][1]-(v<10?2:3);if(bytes.length<=cap){ver=v;break}}
    if(!ver)return null;
    var info=V[ver],bits=[];function put(val,len){for(var i=len-1;i>=0;i--)bits.push((val>>i)&1)}
    put(4,4);put(bytes.length,ver<10?8:16);bytes.forEach(function(b){put(b,8)});
    var cap8=info[1]*8;put(0,Math.min(4,cap8-bits.length));while(bits.length%8)bits.push(0);
    var cw=[];for(var i=0;i<bits.length;i+=8){var b=0;for(var j=0;j<8;j++)b=b<<1|bits[i+j];cw.push(b)}
    for(var p=0;cw.length<info[1];p++)cw.push(p%2?17:236);
    var nb=info[3],per=info[1]/nb|0,blocks=[],ecs=[],pos=0,extra=info[1]-per*nb;
    for(i=0;i<nb;i++){var len=per+(i>=nb-extra?1:0),blk=cw.slice(pos,pos+len);pos+=len;blocks.push(blk);ecs.push(rs(blk,info[2]))}
    var out=[],ml=Math.max.apply(null,blocks.map(function(b){return b.length}));
    for(i=0;i<ml;i++)blocks.forEach(function(b){if(i<b.length)out.push(b[i])});
    for(i=0;i<info[2];i++)ecs.forEach(function(e){out.push(e[i])});
    var n=17+4*ver,M=[],F=[];for(i=0;i<n;i++){M.push(new Array(n).fill(null));F.push(new Array(n).fill(false))}
    function set(r,c,v){M[r][c]=v;F[r][c]=true}
    function finder(r,c){for(var y=-1;y<=7;y++)for(var x=-1;x<=7;x++){var rr=r+y,cc=c+x;if(rr<0||cc<0||rr>=n||cc>=n)continue;set(rr,cc,(y>=0&&y<=6&&(x===0||x===6)||x>=0&&x<=6&&(y===0||y===6)||y>=2&&y<=4&&x>=2&&x<=4))}}
    finder(0,0);finder(0,n-7);finder(n-7,0);
    for(i=8;i<n-8;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
    if(AL[ver]){var a=AL[ver];a.forEach(function(r){a.forEach(function(c){if(F[r][c])return;for(var y=-2;y<=2;y++)for(var x=-2;x<=2;x++)set(r+y,c+x,Math.max(Math.abs(x),Math.abs(y))!==1)})})}
    set(n-8,8,true);
    for(i=0;i<9;i++){if(!F[8][i])set(8,i,false);if(!F[i][8])set(i,8,false)}
    for(i=0;i<8;i++){if(!F[8][n-1-i])set(8,n-1-i,false);if(!F[n-1-i][8])set(n-1-i,8,false)}
    var data=[];out.forEach(function(b){for(var k=7;k>=0;k--)data.push((b>>k)&1)});
    var best=null,bs=1e9;
    for(var mask=0;mask<8;mask++){
      var T=M.map(function(r){return r.slice()}),di=0,up=true;
      for(var col=n-1;col>0;col-=2){if(col===6)col--;for(var k=0;k<n;k++){var r=up?n-1-k:k;for(var cc=0;cc<2;cc++){var c=col-cc;if(F[r][c])continue;var bit=di<data.length?data[di++]:0;var m=[(r+c)%2===0,r%2===0,c%3===0,(r+c)%3===0,(((r/2|0)+(c/3|0))%2)===0,((r*c)%2+(r*c)%3)===0,(((r*c)%2+(r*c)%3)%2)===0,(((r+c)%2+(r*c)%3)%2)===0][mask];T[r][c]=m?!bit:!!bit;}}up=!up}
      /* format info, ECC L = 01 */
      var fd=(1<<3|mask),rem=fd<<10;for(k=14;k>=10;k--)if((rem>>k)&1)rem^=0x537<<(k-10);var fmt=((fd<<10)|rem)^0x5412;
      for(k=0;k<15;k++){var bt=((fmt>>k)&1)===1;
        if(k<6)T[k][8]=bt;else if(k<8)T[k+1][8]=bt;else T[n-15+k][8]=bt;
        if(k<8)T[8][n-1-k]=bt;else if(k<9)T[8][15-k]=bt;else T[8][14-k]=bt}
      T[n-8][8]=true;
      var sc=0;for(r=0;r<n;r++){var run=1;for(c=1;c<n;c++){if(T[r][c]===T[r][c-1]){run++;if(run===5)sc+=3;else if(run>5)sc++}else run=1}}
      for(c=0;c<n;c++){run=1;for(r=1;r<n;r++){if(T[r][c]===T[r-1][c]){run++;if(run===5)sc+=3;else if(run>5)sc++}else run=1}}
      if(sc<bs){bs=sc;best=T}
    }
    return best;
  }
  return {make:make};
})();

export function qrMatrix(text) {
  return QR.make(String(text));
}
