import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'

// ─── Canvas resolution (native pixels — no CSS upscale) ───────────────────
let RW = 160
let RH = 160
let _col = null
let _dep = null
let _colA = null
let _depA = null
let _colB = null
let _depB = null
let _err = null

function ensureBuffers(w, h) {
	if (w === RW && h === RH && _col) return
	RW = w
	RH = h
	const n = w * h
	_col = new Float32Array(n)
	_dep = new Float32Array(n)
	_colA = new Float32Array(n)
	_depA = new Float32Array(n)
	_colB = new Float32Array(n)
	_depB = new Float32Array(n)
	_err = new Float32Array(n)
}

// ─── Bayer matrix ─────────────────────────────────────────────────────────
const BAYER8 = [
  0,32,8,40,2,34,10,42, 48,16,56,24,50,18,58,26,
  12,44,4,36,14,46,6,38, 60,28,52,20,62,30,54,22,
  3,35,11,43,1,33,9,41, 51,19,59,27,49,17,57,25,
  15,47,7,39,13,45,5,37, 63,31,55,23,61,29,53,21
]

ensureBuffers(160, 160)

function getBuf(col, dep) {
  dep.fill(-999); col.fill(0)
  return { col, dep }
}

// ─── Rotation matrix — built once per frame, used by all projectM calls ───
// Layout: [cX, sX, cY, sY, zoom]
const _mat = new Float32Array(5)

function buildMatrix(rotX, rotY, zoom) {
  _mat[0] = Math.cos(rotX); _mat[1] = Math.sin(rotX)
  _mat[2] = Math.cos(rotY); _mat[3] = Math.sin(rotY)
  _mat[4] = zoom ?? 1
}

// Core projection — no trig, reads cached matrix
function P(x, y, z) {
  const cX=_mat[0],sX=_mat[1],cY=_mat[2],sY=_mat[3],zoom=_mat[4]
  const y1=y*cX-z*sX, z1=y*sX+z*cX
  const x2=x*cY+z1*sY, z2=-x*sY+z1*cY
  const dist=(320)/(320+z2+120)
  return [RW/2+x2*dist*2*zoom, RH/2+y1*dist*2*zoom, z2]
}

// ─── Lighting ─────────────────────────────────────────────────────────────
const LIGHT_VIEW = (()=>{
  const lx=-0.4, ly=-0.6, lz=0.7, len=Math.sqrt(lx*lx+ly*ly+lz*lz)
  return [lx/len, ly/len, lz/len]
})()

function getLightOS(rotX, rotY) {
  const [lvx,lvy,lvz]=LIGHT_VIEW
  const cY=Math.cos(-rotY),sY=Math.sin(-rotY)
  const lx1=lvx*cY+lvz*sY, ly1=lvy, lz1=-lvx*sY+lvz*cY
  const cX=Math.cos(-rotX),sX=Math.sin(-rotX)
  return [lx1, ly1*cX-lz1*sX, ly1*sX+lz1*cX]
}

function shade(nx,ny,nz,lx,ly,lz) {
  return 0.12 + 0.88 * Math.max(0, nx*lx+ny*ly+nz*lz)
}

// ─── Plot ─────────────────────────────────────────────────────────────────
function plot(buf, px, py, pz, light) {
  const x=Math.round(px), y=Math.round(py)
  if (x>=0&&x<RW&&y>=0&&y<RH) {
    const i=y*RW+x
    if (pz>buf.dep[i]) { buf.dep[i]=pz; buf.col[i]=Math.max(0,Math.min(1,light)) }
  }
}

// ─── Primitives ───────────────────────────────────────────────────────────
function sphere(buf, r, cx, cy, cz, L) {
  const S=44
  for (let i=0;i<=S;i++) {
    const lat=(i/S)*Math.PI-Math.PI/2, clat=Math.cos(lat)
    for (let j=0;j<=S*2;j++) {
      const lon=(j/(S*2))*Math.PI*2
      const nx=clat*Math.cos(lon),ny=clat*Math.sin(lon),nz=Math.sin(lat)
      const [px,py,pz]=P(cx+r*nx,cy+r*ny,cz+r*nz)
      plot(buf,px,py,pz,shade(nx,ny,nz,...L))
    }
  }
}

function box(buf, x0,y0,z0, x1,y1,z1, L) {
  const S=30
  for (const n of [[0,0,1],[0,0,-1],[0,1,0],[0,-1,0],[1,0,0],[-1,0,0]]) {
    const light=shade(n[0],n[1],n[2],...L)
    for (let i=0;i<=S;i++) for (let j=0;j<=S;j++) {
      const u=i/S,v=j/S
      let wx,wy,wz
      if (n[2]) { wx=x0+(x1-x0)*u;wy=y0+(y1-y0)*v;wz=n[2]>0?z1:z0 }
      else if (n[1]) { wx=x0+(x1-x0)*u;wy=n[1]>0?y1:y0;wz=z0+(z1-z0)*v }
      else { wx=n[0]>0?x1:x0;wy=y0+(y1-y0)*u;wz=z0+(z1-z0)*v }
      const [px,py,pz]=P(wx,wy,wz)
      plot(buf,px,py,pz,light)
    }
  }
}

function cylinder(buf, cx,cy,cz, r,h, L, S=36) {
  for (let s=0;s<=S;s++) {
    const a=s/S*Math.PI*2, nx=Math.cos(a), nz=Math.sin(a)
    const light=shade(nx,0,nz,...L)
    for (let t=0;t<=22;t++) {
      const [px,py,pz]=P(cx+r*nx,cy-h/2+h*(t/22),cz+r*nz)
      plot(buf,px,py,pz,light)
    }
  }
  for (let cap=0;cap<2;cap++) {
    const wy=cy+(cap?h/2:-h/2), ny=cap?1:-1
    const light=shade(0,ny,0,...L)
    for (let ri=0;ri<=14;ri++) for (let s=0;s<=S;s++) {
      const a=s/S*Math.PI*2, rr=ri/14*r
      const [px,py,pz]=P(cx+rr*Math.cos(a),wy,cz+rr*Math.sin(a))
      plot(buf,px,py,pz,light)
    }
  }
}

function torus(buf, cx,cy,cz, R,r, L, S=56) {
  for (let i=0;i<=S;i++) {
    const u=i/S*Math.PI*2
    for (let j=0;j<=S;j++) {
      const v=j/S*Math.PI*2
      const wx=cx+(R+r*Math.cos(v))*Math.cos(u),wy=cy+r*Math.sin(v),wz=cz+(R+r*Math.cos(v))*Math.sin(u)
      const [px,py,pz]=P(wx,wy,wz)
      const nx=(wx-cx-R*Math.cos(u))/r,ny=(wy-cy)/r,nz=(wz-cz-R*Math.sin(u))/r
      plot(buf,px,py,pz,shade(nx,ny,nz,...L))
    }
  }
}

// Generic tube along a parametric curve — tangent-based Frenet frame
function tube(buf, curve, r, steps, vSteps=18, L) {
  const UP=[0,1,0]
  for (let i=0;i<=steps;i++) {
    const t=i/steps
    const [kx,ky,kz]=curve(t)
    const [kx2,ky2,kz2]=curve((i+0.5)/steps)
    const tx=kx2-kx,ty=ky2-ky,tz=kz2-kz, tl=Math.sqrt(tx*tx+ty*ty+tz*tz)||1
    const txn=tx/tl,tyn=ty/tl,tzn=tz/tl
    // normal: cross(tangent, UP)
    const bfx=tyn*UP[2]-tzn*UP[1], bfy=tzn*UP[0]-txn*UP[2], bfz=txn*UP[1]-tyn*UP[0]
    const bfl=Math.sqrt(bfx*bfx+bfy*bfy+bfz*bfz)||1
    const nxn=bfx/bfl,nyn=bfy/bfl,nzn=bfz/bfl
    // binormal
    const bx=tyn*nzn-tzn*nyn, by=tzn*nxn-txn*nzn, bz=txn*nyn-tyn*nxn
    for (let j=0;j<=vSteps;j++) {
      const v=j/vSteps*Math.PI*2
      const snx=Math.cos(v)*nxn+Math.sin(v)*bx
      const sny=Math.cos(v)*nyn+Math.sin(v)*by
      const snz=Math.cos(v)*nzn+Math.sin(v)*bz
      const [px,py,pz]=P(kx+r*snx,ky+r*sny,kz+r*snz)
      plot(buf,px,py,pz,shade(snx,sny,snz,...L))
    }
  }
}

// Solid polyhedron from face list
function polyhedron(buf, verts, faces, L) {
  const S=14
  for (const fi of faces) {
    const pts=fi.map(i=>verts[i])
    // Face centroid
    const ccx=pts.reduce((s,p)=>s+p[0],0)/pts.length
    const ccy=pts.reduce((s,p)=>s+p[1],0)/pts.length
    const ccz=pts.reduce((s,p)=>s+p[2],0)/pts.length
    // Face normal from first two edges
    const a=pts[0],b=pts[1],c=pts[2]
    const ex=(b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1])
    const ey=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])
    const ez=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
    const el=Math.sqrt(ex*ex+ey*ey+ez*ez)||1
    const light=shade(ex/el,ey/el,ez/el,...L)
    for (let i=0;i<pts.length;i++) {
      const pa=pts[i],pb=pts[(i+1)%pts.length],pc=[ccx,ccy,ccz]
      for (let p=0;p<=S;p++) for (let q=0;q<=S-p;q++) {
        const u=p/S,v=q/S,w=1-u-v
        const [px,py,pz]=P(pa[0]*u+pb[0]*v+pc[0]*w,pa[1]*u+pb[1]*v+pc[1]*w,pa[2]*u+pb[2]*v+pc[2]*w)
        plot(buf,px,py,pz,light)
      }
    }
  }
}

// ─── Shape descriptors ────────────────────────────────────────────────────
// Each shape: { name, draw(buf, t, L), autoSpinY? }
// L = [lx,ly,lz] light in object space
// t = integer frame counter
// autoSpinY: override base spin speed (default 0.018)

const SHAPES = [

  { name: 'sphere', autoSpinY: 0.014,
    draw(buf,t,L) {
      const r=20+3*Math.sin(t*0.04)
      sphere(buf,r,0,0,0,L)
    }},

  { name: 'cube', autoSpinY: 0.018,
    draw(buf,t,L) {
      const tilt=0.18*Math.sin(t*0.03)
      // local tilt baked into matrix — inject a tiny extra rotX
      const prevCX=_mat[0],prevSX=_mat[1]
      const ct=Math.cos(tilt),st2=Math.sin(tilt)
      _mat[0]=prevCX*ct-prevSX*st2; _mat[1]=prevCX*st2+prevSX*ct
      box(buf,-18,-18,-18,18,18,18,L)
      _mat[0]=prevCX; _mat[1]=prevSX
    }},

  { name: 'torus', autoSpinY: 0.015,
    draw(buf,t,L) {
      const extra=Math.sin(t*0.025)*0.7
      const prevCX=_mat[0],prevSX=_mat[1]
      const ct=Math.cos(extra),st2=Math.sin(extra)
      _mat[0]=prevCX*ct-prevSX*st2; _mat[1]=prevCX*st2+prevSX*ct
      torus(buf,0,0,0,16,7,L)
      _mat[0]=prevCX; _mat[1]=prevSX
    }},

  { name: 'pyramid', autoSpinY: 0.016,
    draw(buf,t,L) {
      const bob=4*Math.sin(t*0.05), s=18,h=36,h2=h/2, cy=bob
      const apex=[0,-h2+bob,0]
      const base=[[-s,cy+h2,-s],[s,cy+h2,-s],[s,cy+h2,s],[-s,cy+h2,s]]
      const normals=[[0,s,-h/2],[h/2,s,0],[0,s,h/2],[-h/2,s,0]]
      const S=34
      for (let f=0;f<4;f++) {
        const b0=base[f],b1=base[(f+1)%4],n=normals[f]
        const len=Math.sqrt(n[0]**2+n[1]**2+n[2]**2)
        const light=shade(n[0]/len,n[1]/len,n[2]/len,...L)
        for (let i=0;i<=S;i++) {
          const tt=i/S
          for (let j=0;j<=Math.round(S*(1-tt));j++) {
            const u=j/(S*(1-tt)+0.001)
            const [px,py,pz]=P(apex[0]*tt+(b0[0]+(b1[0]-b0[0])*u)*(1-tt),apex[1]*tt+(b0[1]+(b1[1]-b0[1])*u)*(1-tt),apex[2]*tt+(b0[2]+(b1[2]-b0[2])*u)*(1-tt))
            plot(buf,px,py,pz,light)
          }
        }
      }
      const blight=shade(0,-1,0,...L)
      const S2=26
      for (let i=0;i<=S2;i++) for (let j=0;j<=S2;j++) {
        const [px,py,pz]=P(-s+(2*s)*(i/S2),cy+h2,-s+(2*s)*(j/S2))
        plot(buf,px,py,pz,blight)
      }
    }},

  { name: 'möbius', autoSpinY: 0.014,
    draw(buf,t,L) {
      const w=6+2.5*Math.sin(t*0.035), R=16, US=130, VS=24
      for (let i=0;i<=US;i++) {
        const u=i/US*Math.PI*2
        for (let j=0;j<=VS;j++) {
          const v=(j/VS)*2-1
          const wx=(R+v*w*Math.cos(u/2))*Math.cos(u),wy=v*w*Math.sin(u/2),wz=(R+v*w*Math.cos(u/2))*Math.sin(u)
          const [px,py,pz]=P(wx,wy,wz)
          const nx=Math.cos(u/2)*Math.cos(u),ny=Math.sin(u/2),nz=Math.cos(u/2)*Math.sin(u)
          plot(buf,px,py,pz,0.1+0.9*Math.abs(nx*L[0]+ny*L[1]+nz*L[2]))
        }
      }
    }},

  { name: 'gem', autoSpinY: 0.010,
    draw(buf,t,L) {
      const r=20,girdle=r*0.1,culet=r,top=-r*0.8,F=16,S=22
      for (let f=0;f<F;f++) {
        const a0=f/F*Math.PI*2,a1=(f+1)/F*Math.PI*2
        const sparkle=Math.abs(Math.sin(t*0.07+f*0.8))
        const aMid=(a0+a1)/2
        const fnx=Math.cos(aMid)*0.6,fny=-0.8,fnz=Math.sin(aMid)*0.6
        const fnl=Math.sqrt(fnx*fnx+fny*fny+fnz*fnz)
        const light=Math.max(0.15,shade(fnx/fnl,fny/fnl,fnz/fnl,...L)*0.5+0.5*sparkle)
        for (let i=0;i<=S;i++) for (let j=0;j<=S;j++) {
          const tt=i/S,u=j/S,ra=a0+(a1-a0)*u
          const gX=r*Math.cos(ra),gZ=r*Math.sin(ra)
          const [px,py,pz]=P(gX*tt,top*(1-tt)+girdle*tt,gZ*tt)
          plot(buf,px,py,pz,light)
        }
        const pnx=Math.cos(aMid)*0.6,pny=0.8,pnz=Math.sin(aMid)*0.6
        const pnl=Math.sqrt(pnx*pnx+pny*pny+pnz*pnz)
        const sp2=Math.abs(Math.sin(t*0.05+f*1.3+2))
        const plight=Math.max(0.1,shade(pnx/pnl,pny/pnl,pnz/pnl,...L)*0.5+0.5*sp2)
        for (let i=0;i<=S;i++) for (let j=0;j<=S;j++) {
          const tt=i/S,u=j/S,ra=a0+(a1-a0)*u
          const gX=r*Math.cos(ra),gZ=r*Math.sin(ra)
          const [px,py,pz]=P(gX*(1-tt),girdle*(1-tt)+culet*tt,gZ*(1-tt))
          plot(buf,px,py,pz,plight*(1-tt*0.5))
        }
      }
    }},

  { name: 'DNA', autoSpinY: 0.012,
    draw(buf,t,L) {
      const turns=3,hR=11,S=turns*44,totalH=44
      const scroll=(t*0.018)%(Math.PI*2)
      for (let i=0;i<=S;i++) {
        const tt=i/S,angle=tt*turns*Math.PI*2+scroll,wy=-totalH/2+totalH*tt
        const wxa=hR*Math.cos(angle),wza=hR*Math.sin(angle)
        const wxb=hR*Math.cos(angle+Math.PI),wzb=hR*Math.sin(angle+Math.PI)
        const [pxa,pya,pza]=P(wxa,wy,wza); plot(buf,pxa,pya,pza,shade(Math.cos(angle),0,Math.sin(angle),...L))
        const [pxb,pyb,pzb]=P(wxb,wy,wzb); plot(buf,pxb,pyb,pzb,shade(Math.cos(angle+Math.PI),0,Math.sin(angle+Math.PI),...L))
        if (i%7===0) for (let r=0;r<=14;r++) {
          const sr=r/14, rx2=wxa+(wxb-wxa)*sr, rz2=wza+(wzb-wza)*sr
          const [prx,pry,prz]=P(rx2,wy,rz2)
          plot(buf,prx,pry,prz,shade(rx2/hR,0,rz2/hR,...L)*0.8+0.1)
        }
      }
    }},

  { name: 'icosahedron', autoSpinY: 0.016,
    draw(buf,t,L) {
      const blend=(Math.sin(t*0.022)+1)*0.5, phi=(1+Math.sqrt(5))/2, r=22
      const raw=[[-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],[0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],[phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]]
      const verts=raw.map(v=>{const l=Math.sqrt(v[0]**2+v[1]**2+v[2]**2);return[v[0]/l*r,v[1]/l*r,v[2]/l*r]})
      const faces=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]]
      const S=16
      for (const [ai,bi,ci] of faces) {
        const a=verts[ai],b=verts[bi],c=verts[ci]
        const ex=(b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1])
        const ey=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])
        const ez=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
        const el=Math.sqrt(ex*ex+ey*ey+ez*ez)||1
        const faceLight=shade(ex/el,ey/el,ez/el,...L)
        for (let i=0;i<=S;i++) for (let j=0;j<=S-i;j++) {
          const u=i/S,v=j/S,w=1-u-v
          let wx=a[0]*w+b[0]*u+c[0]*v,wy=a[1]*w+b[1]*u+c[1]*v,wz=a[2]*w+b[2]*u+c[2]*v
          const len=Math.sqrt(wx*wx+wy*wy+wz*wz)||1
          wx=wx*(1-blend)+wx/len*r*blend; wy=wy*(1-blend)+wy/len*r*blend; wz=wz*(1-blend)+wz/len*r*blend
          const bLight=blend>0?shade(wx/r,wy/r,wz/r,...L):faceLight
          const [px,py,pz]=P(wx,wy,wz)
          plot(buf,px,py,pz,faceLight*(1-blend)+bLight*blend)
        }
      }
    }},

  { name: 'linked rings', autoSpinY: 0.013,
    draw(buf,t,L) {
      const tilt=Math.sin(t*0.025)*0.4, R=13,r=5,S=84,VS=28
      for (let ring=0;ring<2;ring++) {
        for (let i=0;i<=S;i++) {
          const u=i/S*Math.PI*2
          for (let j=0;j<=VS;j++) {
            const v=j/VS*Math.PI*2
            let wx,wy,wz,nx,ny,nz
            const tl=ring===0?tilt:-tilt
            const bx=(R+r*Math.cos(v))*Math.cos(u)
            const by=ring===0?(R+r*Math.cos(v))*Math.sin(u):r*Math.sin(v)
            const bz=ring===0?r*Math.sin(v):(R+r*Math.cos(v))*Math.sin(u)
            wx=bx; wy=by*Math.cos(tl)-bz*Math.sin(tl); wz=by*Math.sin(tl)+bz*Math.cos(tl)
            const onx=(bx-R*Math.cos(u))/r
            const ony=ring===0?(by-R*Math.sin(u))/r:by/r
            const onz=ring===0?bz/r:(bz-R*Math.sin(u))/r
            nx=onx; ny=ony*Math.cos(tl)-onz*Math.sin(tl); nz=ony*Math.sin(tl)+onz*Math.cos(tl)
            const [px,py,pz]=P(wx,wy,wz)
            plot(buf,px,py,pz,shade(nx,ny,nz,...L))
          }
        }
      }
    }},

  { name: 'spring', autoSpinY: 0.015,
    draw(buf,t,L) {
      const hs=0.6+0.5*((Math.sin(t*0.04)+1)*0.5), H=38*hs, turns=5, hR=14, tR=4
      tube(buf, tt=>{
        const angle=tt*turns*Math.PI*2
        return [hR*Math.cos(angle),-H/2+H*tt,hR*Math.sin(angle)]
      }, tR, turns*32, 18, L)
    }},

  { name: 'trefoil', autoSpinY: 0.014,
    draw(buf,t,L) {
      const r=3+1.5*Math.abs(Math.sin(t*0.038)), R=15
      tube(buf, tt=>{
        const a=tt*Math.PI*2
        return [(R+R*0.4*Math.cos(1.5*a))*Math.cos(a), (R+R*0.4*Math.cos(1.5*a))*Math.sin(a)+4, R*0.4*Math.sin(1.5*a)]
      }, r, 220, 20, L)
    }},

  { name: 'octahedron', autoSpinY: 0.022,
    draw(buf,t,L) {
      const er=t*0.02, r=22
      const rv=[[r,0,0],[-r,0,0],[0,r,0],[0,-r,0],[0,0,r],[0,0,-r]]
      const verts=rv.map(([x,y,z])=>[x*Math.cos(er)-y*Math.sin(er),x*Math.sin(er)+y*Math.cos(er),z])
      polyhedron(buf, verts, [[0,4,2],[0,2,5],[0,5,3],[0,3,4],[1,2,4],[1,5,2],[1,3,5],[1,4,3]], L)
    }},

  { name: 'hyperboloid', autoSpinY: 0.016,
    draw(buf,t,L) {
      const ws=0.6+0.5*((Math.sin(t*0.03)+1)*0.5), a=14*ws,cVal=18,H=38,S=52,VS=28
      for (let i=0;i<=VS;i++) {
        const tt=(i/VS)*2-1, wy=tt*H/2, rad=a*Math.sqrt(1+tt*tt*(H/2)**2/(cVal*cVal))
        for (let j=0;j<=S;j++) {
          const angle=j/S*Math.PI*2
          const [px,py,pz]=P(rad*Math.cos(angle),wy,rad*Math.sin(angle))
          plot(buf,px,py,pz,shade(Math.cos(angle),0,Math.sin(angle),...L))
        }
      }
    }},

  { name: 'twisted prism', autoSpinY: 0.014,
    draw(buf,t,L) {
      const twist=Math.PI*0.6+t*0.008, sides=6, r=18, H=38, layers=40
      for (let l=0;l<=layers;l++) {
        const tt=l/layers, wy=-H/2+H*tt, rot=tt*twist
        for (let s=0;s<sides;s++) {
          const a0=s/sides*Math.PI*2+rot, a1=(s+1)/sides*Math.PI*2+rot
          const aMid=(a0+a1)/2, light=shade(Math.cos(aMid),0,Math.sin(aMid),...L)
          const x0=r*Math.cos(a0),z0=r*Math.sin(a0),x1=r*Math.cos(a1),z1=r*Math.sin(a1)
          if (l<layers) {
            const rot2=(tt+1/layers)*twist, wyn=-H/2+H*(tt+1/layers)
            const nx0=r*Math.cos(s/sides*Math.PI*2+rot2), nz0=r*Math.sin(s/sides*Math.PI*2+rot2)
            const nx1=r*Math.cos((s+1)/sides*Math.PI*2+rot2), nz1=r*Math.sin((s+1)/sides*Math.PI*2+rot2)
            const S2=12
            for (let i=0;i<=S2;i++) for (let j=0;j<=S2;j++) {
              const u=i/S2,v=j/S2
              const wx=(1-u)*((1-v)*x0+v*x1)+u*((1-v)*nx0+v*nx1)
              const wz=(1-u)*((1-v)*z0+v*z1)+u*((1-v)*nz0+v*nz1)
              const [px,py,pz]=P(wx,wy+(wyn-wy)*u,wz)
              plot(buf,px,py,pz,light)
            }
          }
          for (let st=0;st<=16;st++) {
            const [px,py,pz]=P((1-st/16)*x0+(st/16)*x1,wy,(1-st/16)*z0+(st/16)*z1)
            plot(buf,px,py,pz,light)
          }
        }
      }
    }},

  { name: 'stellated octa', autoSpinY: 0.016,
    draw(buf,t,L) {
      const sc=1.4+0.4*Math.sin(t*0.04), r=13
      const verts=[[r,0,0],[-r,0,0],[0,r,0],[0,-r,0],[0,0,r],[0,0,-r]]
      const tips=[[r*sc*1.3,0,0],[-r*sc*1.3,0,0],[0,r*sc*1.3,0],[0,-r*sc*1.3,0],[0,0,r*sc*1.3],[0,0,-r*sc*1.3]]
      const pyramids=[[0,[4,2,5,3]],[1,[2,4,3,5]],[2,[0,4,1,5]],[3,[4,0,5,1]],[4,[2,0,3,1]],[5,[0,2,1,3]]]
      const S=11
      for (const [ti,bi] of pyramids) {
        const tip=tips[ti], baseV=bi.map(i=>verts[i])
        for (let f=0;f<4;f++) {
          const a=baseV[f],b=baseV[(f+1)%4]
          const ex=(b[1]-a[1])*(tip[2]-a[2])-(b[2]-a[2])*(tip[1]-a[1])
          const ey=(b[2]-a[2])*(tip[0]-a[0])-(b[0]-a[0])*(tip[2]-a[2])
          const ez=(b[0]-a[0])*(tip[1]-a[1])-(b[1]-a[1])*(tip[0]-a[0])
          const el=Math.sqrt(ex*ex+ey*ey+ez*ez)||1
          const light=shade(ex/el,ey/el,ez/el,...L)
          for (let i=0;i<=S;i++) for (let j=0;j<=S-i;j++) {
            const u=i/S,v=j/S,w=1-u-v
            const [px,py,pz]=P(a[0]*u+b[0]*v+tip[0]*w,a[1]*u+b[1]*v+tip[1]*w,a[2]*u+b[2]*v+tip[2]*w)
            plot(buf,px,py,pz,light)
          }
        }
      }
    }},

  { name: 'torus knot', autoSpinY: 0.012,
    draw(buf,t,L) {
      const r2=2.5+1.2*Math.abs(Math.sin(t*0.033)), p=2,q=3,R=14,r1=5
      tube(buf, tt=>{
        const a=tt*Math.PI*2
        return [(R+r1*Math.cos(q*a))*Math.cos(p*a),(R+r1*Math.cos(q*a))*Math.sin(p*a),r1*Math.sin(q*a)]
      }, r2, 240, 20, L)
    }},

  { name: 'spiral tower', autoSpinY: 0.018,
    draw(buf,t,L) {
      const floors=14,flR=16,h=3,totalH=floors*h, tr=t*0.015
      for (let fl=0;fl<floors;fl++) {
        const tt=fl/(floors-1), rot=tt*Math.PI*2.5+tr, wy=-totalH/2+fl*h
        const curR=flR*(0.4+0.6*(1-tt))
        cylinder(buf,0,wy+h*0.3,0,curR,h*0.55,L,28)
        const S=28
        for (let s=0;s<=S;s++) {
          const a=s/S*Math.PI*2+rot, light=shade(Math.cos(a),0.3,Math.sin(a),...L)
          for (let ri=0;ri<=8;ri++) {
            const rr=ri/8*curR
            const [px,py,pz]=P(rr*Math.cos(a),wy+h*0.57,rr*Math.sin(a))
            plot(buf,px,py,pz,light)
          }
        }
      }
    }},

  { name: 'saturn', autoSpinY: 0.013,
    draw(buf,t,L) {
      sphere(buf,13,0,0,0,L)
      const tilt=Math.sin(t*0.018)*0.3
      for (let ring=0;ring<3;ring++) {
        const R=20+ring*5,r=2,S=72,VS=10
        for (let i=0;i<=S;i++) {
          const u=i/S*Math.PI*2
          for (let j=0;j<=VS;j++) {
            const v=j/VS*Math.PI*2
            const bx=(R+r*Math.cos(v))*Math.cos(u),by=r*Math.sin(v)*0.25,bz=(R+r*Math.cos(v))*Math.sin(u)
            const wx=bx,wy=by*Math.cos(tilt)-bz*Math.sin(tilt),wz=by*Math.sin(tilt)+bz*Math.cos(tilt)
            const onx=(bx-R*Math.cos(u))/r,ony=by/(r*0.25),onz=(bz-R*Math.sin(u))/r
            const nl=Math.sqrt(onx*onx+ony*ony+onz*onz)||1
            const [px,py,pz]=P(wx,wy,wz)
            plot(buf,px,py,pz,shade(onx/nl,ony*Math.cos(tilt)/nl,onz/nl,...L))
          }
        }
      }
    }},

  { name: 'dodecahedron', autoSpinY: 0.014,
    draw(buf,t,L) {
      const explode=1+0.18*Math.abs(Math.sin(t*0.025))
      const phi=(1+Math.sqrt(5))/2, r=22
      const raw=[[1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1],[-1,1,1],[-1,1,-1],[-1,-1,1],[-1,-1,-1],[0,phi,1/phi],[0,phi,-1/phi],[0,-phi,1/phi],[0,-phi,-1/phi],[1/phi,0,phi],[-1/phi,0,phi],[1/phi,0,-phi],[-1/phi,0,-phi],[phi,1/phi,0],[phi,-1/phi,0],[-phi,1/phi,0],[-phi,-1/phi,0]]
      const verts=raw.map(v=>{const l=Math.sqrt(v[0]**2+v[1]**2+v[2]**2);return[v[0]/l*r,v[1]/l*r,v[2]/l*r]})
      const faces=[[0,16,2,12,13],[4,13,12,1,9],[0,9,8,5,15],[1,15,3,17,14],[2,17,3,11,10],[6,10,11,7,19],[4,18,19,7,13],[5,18,4,9,8],[6,19,18,5,10],[0,16,17,3,15],[1,14,6,13,12],[2,10,6,7,11]]
      const S=9
      for (const face of faces) {
        const pts=face.map(i=>verts[i])
        const ccx=pts.reduce((s,p)=>s+p[0],0)/pts.length
        const ccy=pts.reduce((s,p)=>s+p[1],0)/pts.length
        const ccz=pts.reduce((s,p)=>s+p[2],0)/pts.length
        const cl=Math.sqrt(ccx*ccx+ccy*ccy+ccz*ccz)||1
        const light=shade(ccx/cl,ccy/cl,ccz/cl,...L)
        const ox=ccx/cl*(explode-1)*4,oy=ccy/cl*(explode-1)*4,oz=ccz/cl*(explode-1)*4
        for (let i=0;i<pts.length;i++) {
          const a=pts[i],b=pts[(i+1)%pts.length],c=[ccx,ccy,ccz]
          for (let p=0;p<=S;p++) for (let q=0;q<=S-p;q++) {
            const u=p/S,v=q/S,w=1-u-v
            const [px,py,pz]=P(a[0]*u+b[0]*v+c[0]*w+ox,a[1]*u+b[1]*v+c[1]*w+oy,a[2]*u+b[2]*v+c[2]*w+oz)
            plot(buf,px,py,pz,light)
          }
        }
      }
    }},

  { name: 'capsule', autoSpinY: 0.016,
    draw(buf,t,L) {
      const bounce=Math.abs(Math.sin(t*0.045))*5
      const squash=1-0.15*Math.abs(Math.sin(t*0.045))
      const stretch=1+0.1*Math.cos(t*0.045)
      cylinder(buf,0,bounce,0,12,24*stretch,L)
      sphere(buf,12*squash,0,-12*stretch+bounce,0,L)
      sphere(buf,12*squash,0,12*stretch+bounce,0,L)
    }},

  { name: 'ring stack', autoSpinY: 0.015,
    draw(buf,t,L) {
      const offsets=[t*0.04,t*0.025,t*0.06], ys=[-14,0,14]
      for (let ri=0;ri<3;ri++) {
        const S=56,R=12,r=4
        for (let i=0;i<=S;i++) {
          const u=i/S*Math.PI*2+offsets[ri]
          for (let j=0;j<=S;j++) {
            const v=j/S*Math.PI*2
            const wx=(R+r*Math.cos(v))*Math.cos(u),wy=ys[ri]+r*Math.sin(v),wz=(R+r*Math.cos(v))*Math.sin(u)
            const [px,py,pz]=P(wx,wy,wz)
            const nx=(wx-R*Math.cos(u))/r,ny=(wy-ys[ri])/r,nz=(wz-R*Math.sin(u))/r
            plot(buf,px,py,pz,shade(nx,ny,nz,...L))
          }
        }
      }
    }},

  { name: 'tower', autoSpinY: 0.014,
    draw(buf,t,L) {
      box(buf,-14,-20,-14,14,20,14,L)
      box(buf,-8,-28,-8,8,-20,8,L)
      const oa=t*0.06, oR=10
      sphere(buf,6,0,-30,0,L)
      sphere(buf,3,oR*Math.cos(oa),-32,oR*Math.sin(oa),L)
    }},

  // ─── New topological shapes ────────────────────────────────────────────

  // Clifford torus: project the 4D flat torus onto 3D via stereographic projection
  { name: 'clifford torus', autoSpinY: 0.012,
    draw(buf,t,L) {
      const phase=t*0.012
      const S1=80, S2=48, r=1/Math.sqrt(2)
      for (let i=0;i<=S1;i++) {
        const a=i/S1*Math.PI*2
        for (let j=0;j<=S2;j++) {
          const b=j/S2*Math.PI*2+phase
          // 4D point on Clifford torus: (cos a, sin a, cos b, sin b) / sqrt2
          const w4=r*Math.cos(a), x4=r*Math.sin(a), y4=r*Math.cos(b), z4=r*Math.sin(b)
          // Stereographic projection from 4D to 3D: divide by (1 - w4)
          const denom=1-w4*0.95+0.05 // avoid singularity
          const scale=18
          const wx=x4/denom*scale, wy=y4/denom*scale, wz=z4/denom*scale
          // Surface normal approximation: outward in the projected space
          const nl=Math.sqrt(wx*wx+wy*wy+wz*wz)||1
          const [px,py,pz]=P(wx,wy,wz)
          plot(buf,px,py,pz,shade(wx/nl,wy/nl,wz/nl,...L))
        }
      }
    }},

  // Boy's surface: non-orientable closed surface (immersion of RP²)
  { name: "boy's surface", autoSpinY: 0.010,
    draw(buf,t,L) {
      const spin=t*0.008, S=50
      for (let i=0;i<=S;i++) {
        const u=i/S*Math.PI   // 0..π
        for (let j=0;j<=S*2;j++) {
          const v=j/(S*2)*Math.PI*2+spin  // 0..2π
          const su=Math.sin(u), cu=Math.cos(u)
          const sv=Math.sin(v), cv=Math.cos(v)
          // Bryant-Kusner parametrization (compact form)
          const denom=2-Math.sqrt(2)*Math.sin(3*v)*Math.sin(2*u)
          const sc=14/denom
          const wx=sc*(cv*Math.sin(2*v)*(cu*cu-1)+cu*Math.sin(v))
          const wy=sc*(sv*Math.sin(2*v)*(cu*cu-1)-cu*Math.cos(v))
          const wz=sc*(3*cu*cu-1)
          const [px,py,pz]=P(wx,wy,wz)
          // approximate normal from u,v gradients — use position as proxy
          const nl=Math.sqrt(wx*wx+wy*wy+wz*wz)||1
          plot(buf,px,py,pz,0.15+0.85*Math.abs(wx*L[0]+wy*L[1]+wz*L[2])/nl)
        }
      }
    }},

  // Lissajous knot: 3D parametric curve with a:b:c frequency ratios
  { name: 'lissajous', autoSpinY: 0.014,
    draw(buf,t,L) {
      const r=2.5+Math.abs(Math.sin(t*0.025)), phase=t*0.006
      tube(buf, tt=>{
        const a=tt*Math.PI*2
        // a:b:c = 3:4:5 with phase offsets
        const scale=18
        return [
          scale*Math.cos(3*a+phase),
          scale*Math.cos(4*a+phase*0.7),
          scale*Math.cos(5*a+phase*1.3)
        ]
      }, r, 260, 18, L)
    }},

  // Gyroid cross-section: isosurface of cos(x)sin(y)+cos(y)sin(z)+cos(z)sin(x)=0
  // Rendered as a dense point cloud on the surface
  { name: 'gyroid', autoSpinY: 0.011,
    draw(buf,t,L) {
      const phase=t*0.01
      const steps=28, scale=8, R=22
      for (let i=0;i<=steps;i++) {
        const x=(i/steps*2-1)*Math.PI
        for (let j=0;j<=steps;j++) {
          const y=(j/steps*2-1)*Math.PI
          for (let k=0;k<=steps;k++) {
            const z=(k/steps*2-1)*Math.PI
            // Only plot near the gyroid isosurface
            const g=Math.cos(x+phase)*Math.sin(y)+Math.cos(y)*Math.sin(z)+Math.cos(z)*Math.sin(x+phase)
            if (Math.abs(g)<0.22) {
              const wx=x*scale, wy=y*scale, wz=z*scale
              // gradient of gyroid as normal
              const ngx=-Math.sin(x+phase)*Math.sin(y)+Math.cos(z)*Math.cos(x+phase)
              const ngy=Math.cos(x+phase)*Math.cos(y)-Math.sin(y)*Math.sin(z)
              const ngz=-Math.sin(z)*Math.cos(y)+Math.cos(z)*Math.cos(x+phase)  // simplified
              const ngl=Math.sqrt(ngx*ngx+ngy*ngy+ngz*ngz)||1
              const [px,py,pz]=P(wx,wy,wz)
              plot(buf,px,py,pz,shade(ngx/ngl,ngy/ngl,ngz/ngl,...L))
            }
          }
        }
      }
    }},
]

// ─── Dithering helpers ────────────────────────────────────────────────────
function dithBayer(val,x,y) { return val>BAYER8[(y%8)*8+(x%8)]/64?1:0 }

// ─── Component ────────────────────────────────────────────────────────────
const Morph = forwardRef(function Morph({
  autoPlay = true,
  morphSpeed = 0.045,
  sizePreset = 'default',
  idleMorph = false,
}, ref) {
  const canvasRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState(300)

  const s = useRef({
    rotX:0.4, rotY:0.4, zoom:1.0,
    spinY:0.018, spinX:0,
    currentShape:0, targetShape:0,
    morphT:1, morphing:false,
    frame:0, autoTimer:null, isDark:false,
    autoIdx:1,
    dragging:false, lastX:0, lastY:0, dragVelX:0, dragVelY:0,
    pinching:false, lastPinchDist:0,
    lastTapTime:0, hidden:false,
  })

  // Expose imperative API: { jumpTo(idx), getCurrentShape() }
  useImperativeHandle(ref, () => ({
    jumpTo: (idx) => {
      const st = s.current
      if (idx < 0 || idx >= SHAPES.length || idx === st.currentShape) return
      st.targetShape = idx; st.morphT = 0; st.morphing = true
    },
    getCurrentShape: () => s.current.currentShape,
    getShapes: () => SHAPES.map(sh => sh.name),
    resetView: () => {
      const st = s.current
      st.rotX=0.4; st.rotY=0.4; st.zoom=1; st.spinX=0; st.spinY=0.018
    },
  }))

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth
      if (sizePreset === 'background') {
        const size = vw < 768
          ? Math.min(380, Math.floor(vw * 0.94))
          : vw < 1024
            ? Math.min(580, Math.floor(vw * 0.64))
            : Math.min(760, Math.floor(vw * 0.58))
        setCanvasSize(size)
        return
      }
      setCanvasSize(vw < 375 ? Math.min(vw - 32, 260) : vw < 768 ? Math.min(vw - 32, 280) : vw < 1024 ? 340 : 420)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [sizePreset])

  useEffect(() => {
    ensureBuffers(canvasSize, canvasSize)
    const st = s.current
    st.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const getXY = e => e.touches ? [e.touches[0].clientX, e.touches[0].clientY] : [e.clientX, e.clientY]
    const pinchDist = e => { const dx=e.touches[0].clientX-e.touches[1].clientX, dy=e.touches[0].clientY-e.touches[1].clientY; return Math.sqrt(dx*dx+dy*dy) }
    const sens = () => 0.012 / ((window.devicePixelRatio||1)*0.5+0.5)

    const resetView = () => { st.rotX=0.4;st.rotY=0.4;st.zoom=1;st.spinX=0;st.spinY=0.018 }

    const onDown = e => {
      if (e.touches?.length===2) { st.pinching=true;st.dragging=false;st.lastPinchDist=pinchDist(e);e.preventDefault();return }
      st.dragging=true;st.pinching=false;st.dragVelX=0;st.dragVelY=0
      ;[st.lastX,st.lastY]=getXY(e);canvas.style.cursor='grabbing';e.preventDefault()
    }
    const onMove = e => {
      if (st.pinching && e.touches?.length===2) {
        const d=pinchDist(e); st.zoom=Math.max(0.4,Math.min(2.5,st.zoom*d/(st.lastPinchDist||d))); st.lastPinchDist=d; e.preventDefault(); return
      }
      if (!st.dragging) return
      const [cx,cy]=getXY(e); const dx=cx-st.lastX,dy=cy-st.lastY; const se=sens()
      st.rotY+=dx*se; st.rotX=Math.max(-Math.PI/2,Math.min(Math.PI/2,st.rotX+dy*se))
      st.dragVelY=dx*se; st.dragVelX=dy*se; st.lastX=cx; st.lastY=cy; e.preventDefault()
    }
    const onUp = () => {
      if (st.pinching){st.pinching=false;return}
      st.dragging=false;canvas.style.cursor='grab';st.spinY=st.dragVelY;st.spinX=st.dragVelX
    }
    const onWheel = e => { e.preventDefault(); st.zoom=Math.max(0.4,Math.min(2.5,st.zoom*(e.deltaY>0?0.92:1.08))) }
    const onDbl = () => resetView()
    const onTap = e => { const now=Date.now(); if(now-st.lastTapTime<300){resetView();st.lastTapTime=0}else{st.lastTapTime=now} }
    const onVis = () => { st.hidden=document.hidden }

    canvas.addEventListener('mousedown',onDown)
    canvas.addEventListener('dblclick',onDbl)
    canvas.addEventListener('touchstart',onDown,{passive:false})
    canvas.addEventListener('touchstart',onTap,{passive:true})
    canvas.addEventListener('wheel',onWheel,{passive:false})
    window.addEventListener('mousemove',onMove)
    window.addEventListener('touchmove',onMove,{passive:false})
    window.addEventListener('mouseup',onUp)
    window.addEventListener('touchend',onUp)
    document.addEventListener('visibilitychange',onVis)
    canvas.style.cursor='grab'

    function renderBuf(buf, useBayer) {
      const img = ctx.createImageData(RW,RH)
      const cs = getComputedStyle(document.documentElement).getPropertyValue('--selected-color-rgb')||'51,154,240'
      const [fgR,fgG,fgB]=cs.split(',').map(v=>parseInt(v.trim()))
      const dk=st.isDark, dR=dk?Math.round(fgR*0.15):Math.round(fgR*0.2), dG=dk?Math.round(fgG*0.15):Math.round(fgG*0.2), dB=dk?Math.round(fgB*0.15):Math.round(fgB*0.2)

      if (useBayer) {
        for (let i=0;i<RW*RH;i++) {
          if (buf.dep[i]>-999) {
            const on=dithBayer(buf.col[i],i%RW,Math.floor(i/RW))
            img.data[i*4]=on?fgR:dR; img.data[i*4+1]=on?fgG:dG; img.data[i*4+2]=on?fgB:dB; img.data[i*4+3]=255
          } else { img.data[i*4+3]=0 }
        }
      } else {
        for (let i=0;i<RW*RH;i++) _err[i]=buf.dep[i]>-999?buf.col[i]:-1
        for (let y=0;y<RH;y++) for (let x=0;x<RW;x++) {
          const i=y*RW+x
          if (_err[i]<0){img.data[i*4+3]=0;continue}
          const v=Math.max(0,Math.min(1,_err[i])), q=v>=0.5?1:0, err=v-q
          img.data[i*4]=q?fgR:dR; img.data[i*4+1]=q?fgG:dG; img.data[i*4+2]=q?fgB:dB; img.data[i*4+3]=255
          if (x+1<RW&&_err[i+1]>=0) _err[i+1]+=err*7/16
          if (y+1<RH) {
            if (x>0&&_err[i+RW-1]>=0) _err[i+RW-1]+=err*3/16
            if (_err[i+RW]>=0) _err[i+RW]+=err*5/16
            if (x+1<RW&&_err[i+RW+1]>=0) _err[i+RW+1]+=err/16
          }
        }
      }
      ctx.putImageData(img,0,0)
    }

    let rafId
    const loop = () => {
      rafId = requestAnimationFrame(loop)
      if (st.hidden) return

      st.isDark = document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme')==='dark'

      if (!st.dragging && !st.pinching) {
        // Use current shape's preferred spin speed
        const baseSpinY = SHAPES[st.currentShape].autoSpinY ?? 0.018
        st.spinY += (baseSpinY - st.spinY) * 0.012
        st.spinX *= 0.97
        st.rotY += st.spinY
        st.rotX = Math.max(-Math.PI/2, Math.min(Math.PI/2, st.rotX+st.spinX))
      }
      st.frame++

      buildMatrix(st.rotX, st.rotY, st.zoom)
      const L = getLightOS(st.rotX, st.rotY)

      const buf = getBuf(_col,_dep)
      const isMorphing = st.morphing && st.morphT < 1

      if (isMorphing) {
        st.morphT += morphSpeed
        const ease = st.morphT<0.5 ? 2*st.morphT**2 : 1-(2-2*st.morphT)**2/2
        const bufA=getBuf(_colA,_depA), bufB=getBuf(_colB,_depB)
        SHAPES[st.currentShape].draw(bufA, st.frame, L)
        SHAPES[st.targetShape].draw(bufB, st.frame, L)
        for (let i=0;i<RW*RH;i++) {
          const hA=bufA.dep[i]>-999, hB=bufB.dep[i]>-999
          if (hA||hB) {
            const pA=hA?(1-ease):0, pB=hB?ease:0, tot=pA+pB
            if (tot>0) {
              buf.col[i]=((hA?bufA.col[i]:0)*pA+(hB?bufB.col[i]:0)*pB)/tot
              buf.dep[i]=Math.max(bufA.dep[i],bufB.dep[i])
              buf.col[i]=Math.max(0,Math.min(1,buf.col[i]+Math.random()*0.35*(1-Math.abs(ease-0.5)*2)))
            }
          }
        }
        if (st.morphT>=1) { st.morphing=false; st.currentShape=st.targetShape }
      } else {
        SHAPES[st.currentShape].draw(buf, st.frame, L)
      }

      renderBuf(buf, isMorphing)
    }
    rafId = requestAnimationFrame(loop)

    if (autoPlay || idleMorph) {
      const interval = idleMorph && !autoPlay ? 2400 : 3200
      const nextAuto = () => {
        const st2 = s.current
        const idx = st2.autoIdx
        if (idx !== st2.currentShape) { st2.targetShape=idx; st2.morphT=0; st2.morphing=true }
        st2.autoIdx = (idx+1) % SHAPES.length
        st2.autoTimer = setTimeout(nextAuto, interval)
      }
      st.autoTimer = setTimeout(nextAuto, interval)
    }

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(st.autoTimer)
      canvas.removeEventListener('mousedown',onDown)
      canvas.removeEventListener('dblclick',onDbl)
      canvas.removeEventListener('touchstart',onDown)
      canvas.removeEventListener('touchstart',onTap)
      canvas.removeEventListener('wheel',onWheel)
      window.removeEventListener('mousemove',onMove)
      window.removeEventListener('touchmove',onMove)
      window.removeEventListener('mouseup',onUp)
      window.removeEventListener('touchend',onUp)
      document.removeEventListener('visibilitychange',onVis)
    }
  }, [autoPlay, idleMorph, morphSpeed, canvasSize])

  return (
    <div className="flex items-center justify-center">
      <canvas ref={canvasRef} width={canvasSize} height={canvasSize}
        style={{ imageRendering:'pixelated', width:canvasSize, height:canvasSize, display:'block', touchAction:'none' }}
      />
    </div>
  )
})

export default Morph
export { SHAPES }