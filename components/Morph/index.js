import { useEffect, useRef, useState } from 'react'

const W = 160, H = 160
const BAYER8 = [
  0,32,8,40,2,34,10,42,
  48,16,56,24,50,18,58,26,
  12,44,4,36,14,46,6,38,
  60,28,52,20,62,30,54,22,
  3,35,11,43,1,33,9,41,
  51,19,59,27,49,17,57,25,
  15,47,7,39,13,45,5,37,
  63,31,55,23,61,29,53,21
]

function project(x, y, z, rotX, rotY) {
  const cosX=Math.cos(rotX),sinX=Math.sin(rotX),cosY=Math.cos(rotY),sinY=Math.sin(rotY)
  const y1=y*cosX-z*sinX, z1=y*sinX+z*cosX
  const x2=x*cosY+z1*sinY, z2=-x*sinY+z1*cosY
  const fov=320, dist=fov/(fov+z2+120)
  return [W/2+x2*dist*2, H/2+y1*dist*2, z2, dist]
}

function dithPix(val, x, y) { return val > BAYER8[(y%8)*8+(x%8)]/64 ? 1 : 0 }
function clearBuf() { return { col:new Float32Array(W*H), dep:new Float32Array(W*H).fill(-999) } }
function plotPoint(buf, px, py, pz, light) {
  const lx=Math.round(px),ly=Math.round(py)
  if (lx>=0&&lx<W&&ly>=0&&ly<H) {
    const idx=ly*W+lx
    if (pz>buf.dep[idx]) { buf.dep[idx]=pz; buf.col[idx]=Math.max(0,Math.min(1,light)) }
  }
}

// ─── Primitives ───────────────────────────────────────────────────────────

function drawSphere(buf, rx, ry, r, cx, cy, cz) {
  const S=44
  for (let i=0;i<=S;i++) {
    const lat=(i/S)*Math.PI-Math.PI/2
    for (let j=0;j<=S*2;j++) {
      const lon=(j/(S*2))*Math.PI*2
      const nx=Math.cos(lat)*Math.cos(lon),ny=Math.cos(lat)*Math.sin(lon),nz=Math.sin(lat)
      const [px,py,pz]=project(cx+r*nx,cy+r*ny,cz+r*nz,rx,ry)
      plotPoint(buf,px,py,pz,0.1+0.9*Math.max(0,nx*0.4+ny*0.2+nz*0.9))
    }
  }
}

function drawBox(buf, rx, ry, x0, y0, z0, x1, y1, z1) {
  const faceData=[[0,0,1],[0,0,-1],[0,1,0],[0,-1,0],[1,0,0],[-1,0,0]]
  const S=30
  for (const n of faceData) {
    const light=Math.max(0.05,n[0]*0.3+n[1]*0.5+n[2]*0.9)*0.95
    for (let i=0;i<=S;i++) for (let j=0;j<=S;j++) {
      const u=i/S,v=j/S
      let wx,wy,wz
      if (n[2]) { wx=x0+(x1-x0)*u;wy=y0+(y1-y0)*v;wz=n[2]>0?z1:z0 }
      else if (n[1]) { wx=x0+(x1-x0)*u;wy=n[1]>0?y1:y0;wz=z0+(z1-z0)*v }
      else { wx=n[0]>0?x1:x0;wy=y0+(y1-y0)*u;wz=z0+(z1-z0)*v }
      const [px,py,pz]=project(wx,wy,wz,rx,ry)
      plotPoint(buf,px,py,pz,0.08+0.92*light)
    }
  }
}

function drawCylinder(buf, rx, ry, cx, cy, cz, r, h, S=36) {
  for (let s=0;s<=S;s++) {
    const a=s/S*Math.PI*2,nx=Math.cos(a)
    for (let t=0;t<=22;t++) {
      const [px,py,pz]=project(cx+r*nx,cy-h/2+h*(t/22),cz+r*Math.sin(a),rx,ry)
      plotPoint(buf,px,py,pz,0.08+0.92*Math.min(1,Math.max(0,nx*0.5+0.5)))
    }
  }
  for (let cap=0;cap<2;cap++) {
    const wy=cy+(cap?h/2:-h/2),ny=cap?1:-1
    const light=Math.max(0.05,ny*0.6+0.3)
    for (let ri=0;ri<=14;ri++) for (let s=0;s<=S;s++) {
      const a=s/S*Math.PI*2,rr=ri/14*r
      const [px,py,pz]=project(cx+rr*Math.cos(a),wy,cz+rr*Math.sin(a),rx,ry)
      plotPoint(buf,px,py,pz,0.08+0.92*light)
    }
  }
}

function drawTorus(buf, rx, ry, cx, cy, cz, R, r, S=56) {
  for (let i=0;i<=S;i++) {
    const u=i/S*Math.PI*2
    for (let j=0;j<=S;j++) {
      const v=j/S*Math.PI*2
      const wx=cx+(R+r*Math.cos(v))*Math.cos(u),wy=cy+r*Math.sin(v),wz=cz+(R+r*Math.cos(v))*Math.sin(u)
      const [px,py,pz]=project(wx,wy,wz,rx,ry)
      const nx=(wx-cx-R*Math.cos(u))/r,ny=(wy-cy)/r,nz=(wz-cz-R*Math.sin(u))/r
      plotPoint(buf,px,py,pz,0.1+0.9*Math.max(0,nx*0.3+ny*0.7+nz*0.4))
    }
  }
}

// ─── Shape draw functions (accept time t) ─────────────────────────────────

// Sphere: breathes in and out (scale pulse)
function drawShapeSphere(buf, rx, ry, t) {
  const r = 20 + 3 * Math.sin(t * 0.04)
  drawSphere(buf, rx, ry, r, 0, 0, 0)
}

// Cube: rocks/tilts on its axis like a spinning top wobble
function drawShapeCube(buf, rx, ry, t) {
  const tilt = 0.18 * Math.sin(t * 0.03)
  drawBox(buf, rx+tilt, ry, -18,-18,-18, 18,18,18)
}

// Torus: ring tilts like a coin that was flipped, oscillating between flat and upright
function drawShapeTorus(buf, rx, ry, t) {
  const extra = Math.sin(t * 0.025) * 0.7
  drawTorus(buf, rx + extra, ry, 0,0,0, 16,7)
}

// Pyramid: bobs up and down like it's floating
function drawShapePyramid(buf, rx, ry, t) {
  const bob = 4 * Math.sin(t * 0.05)
  const s=18, h=36, h2=h/2, apex=[0,-h2+bob,0]
  const cy=bob
  const base=[[-s,cy+h2,-s],[s,cy+h2,-s],[s,cy+h2,s],[-s,cy+h2,s]]
  const normals=[[0,s,-h/2],[h/2,s,0],[0,s,h/2],[-h/2,s,0]]
  const S=34
  for (let f=0;f<4;f++) {
    const b0=base[f],b1=base[(f+1)%4],n=normals[f]
    const len=Math.sqrt(n[0]**2+n[1]**2+n[2]**2)
    const light=Math.max(0.05,(n[0]*0.3+n[1]*0.6+n[2]*0.5)/len)
    for (let i=0;i<=S;i++) {
      const tt=i/S
      for (let j=0;j<=Math.round(S*(1-tt));j++) {
        const u=j/(S*(1-tt)+0.001)
        const [px,py,pz]=project(apex[0]*tt+(b0[0]+(b1[0]-b0[0])*u)*(1-tt),apex[1]*tt+(b0[1]+(b1[1]-b0[1])*u)*(1-tt),apex[2]*tt+(b0[2]+(b1[2]-b0[2])*u)*(1-tt),rx,ry)
        plotPoint(buf,px,py,pz,0.08+0.92*light)
      }
    }
  }
  const S2=26
  for (let i=0;i<=S2;i++) for (let j=0;j<=S2;j++) {
    const [px,py,pz]=project(-s+(2*s)*(i/S2),cy+h2,-s+(2*s)*(j/S2),rx,ry)
    plotPoint(buf,px,py,pz,0.15)
  }
}

// Möbius: width pulses, creating a breathing ribbon effect
function drawShapeMobius(buf, rx, ry, t) {
  const w = 6 + 2.5 * Math.sin(t * 0.035)
  const R=16, US=130, VS=24
  for (let i=0;i<=US;i++) {
    const u=i/US*Math.PI*2
    for (let j=0;j<=VS;j++) {
      const v=(j/VS)*2-1
      const wx=(R+v*w*Math.cos(u/2))*Math.cos(u),wy=v*w*Math.sin(u/2),wz=(R+v*w*Math.cos(u/2))*Math.sin(u)
      const [px,py,pz]=project(wx,wy,wz,rx,ry)
      const nx=Math.cos(u/2)*Math.cos(u),ny=Math.sin(u/2),nz=Math.cos(u/2)*Math.sin(u)
      plotPoint(buf,px,py,pz,0.15+0.85*Math.abs(nx*0.4+ny*0.6+nz*0.3))
    }
  }
}

// Gem: facets sparkle — light flickers per facet over time
function drawShapeGem(buf, rx, ry, t) {
  const r=20, girdle=r*0.1, culet=r, top=-r*0.8, F=16, S=22
  for (let f=0;f<F;f++) {
    const a0=f/F*Math.PI*2, a1=(f+1)/F*Math.PI*2
    // Each facet gets its own phase so they sparkle independently
    const sparkle = Math.abs(Math.sin(t*0.07 + f*0.8))
    const light = 0.2 + 0.75 * sparkle
    for (let i=0;i<=S;i++) for (let j=0;j<=S;j++) {
      const tt=i/S,u=j/S,ra=a0+(a1-a0)*u
      const gX=r*Math.cos(ra),gZ=r*Math.sin(ra)
      const [px,py,pz]=project(0*(1-tt)+gX*tt,top*(1-tt)+girdle*tt,0*(1-tt)+gZ*tt,rx,ry)
      plotPoint(buf,px,py,pz,light)
    }
    for (let i=0;i<=S;i++) for (let j=0;j<=S;j++) {
      const tt=i/S,u=j/S,ra=a0+(a1-a0)*u
      const gX=r*Math.cos(ra),gZ=r*Math.sin(ra)
      const sparkle2 = Math.abs(Math.sin(t*0.05 + f*1.3 + 2))
      const [px,py,pz]=project(gX*(1-tt),girdle*(1-tt)+culet*tt,gZ*(1-tt),rx,ry)
      plotPoint(buf,px,py,pz,0.1+0.85*(1-tt)*sparkle2)
    }
  }
}

// DNA: strands scroll upward continuously — like it's replicating
function drawShapeDNA(buf, rx, ry, t) {
  const turns=3, hR=11, S=turns*44, totalH=44
  const scroll = (t * 0.018) % (Math.PI * 2)
  for (let i=0;i<=S;i++) {
    const tt=i/S, angle=tt*turns*Math.PI*2 + scroll, wy=-totalH/2+totalH*tt
    const wxa=hR*Math.cos(angle), wza=hR*Math.sin(angle)
    const wxb=hR*Math.cos(angle+Math.PI), wzb=hR*Math.sin(angle+Math.PI)
    const [pxa,pya,pza]=project(wxa,wy,wza,rx,ry)
    plotPoint(buf,pxa,pya,pza,0.3+0.7*Math.max(0,Math.cos(angle)))
    const [pxb,pyb,pzb]=project(wxb,wy,wzb,rx,ry)
    plotPoint(buf,pxb,pyb,pzb,0.3+0.7*Math.max(0,Math.cos(angle+Math.PI)))
    if (i%7===0) for (let r=0;r<=14;r++) {
      const sr=r/14
      const [prx,pry,prz]=project(wxa+(wxb-wxa)*sr,wy,wza+(wzb-wza)*sr,rx,ry)
      plotPoint(buf,prx,pry,prz,0.5+0.3*sr)
    }
  }
}

// Icosahedron: slowly inflates toward sphere then back (morphing radius)
function drawShapeIcosahedron(buf, rx, ry, t) {
  const blend = (Math.sin(t * 0.022) + 1) * 0.5 // 0..1
  const phi=(1+Math.sqrt(5))/2
  const r=22
  const raw=[[-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],[0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],[phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]]
  const verts=raw.map(v=>{const l=Math.sqrt(v[0]**2+v[1]**2+v[2]**2);return[v[0]/l*r,v[1]/l*r,v[2]/l*r]})
  const faces=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]]
  const S=16
  for (const [ai,bi,ci] of faces) {
    const a=verts[ai],b=verts[bi],c=verts[ci]
    const nx=(b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1])
    const ny=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])
    const nz=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
    const nl=Math.sqrt(nx*nx+ny*ny+nz*nz)
    const light=Math.max(0.05,(nx/nl)*0.3+(ny/nl)*0.7+(nz/nl)*0.5)
    for (let i=0;i<=S;i++) for (let j=0;j<=S-i;j++) {
      const u=i/S,v=j/S,w=1-u-v
      // Blend vertex positions toward sphere surface
      let wx=a[0]*w+b[0]*u+c[0]*v, wy=a[1]*w+b[1]*u+c[1]*v, wz=a[2]*w+b[2]*u+c[2]*v
      const len=Math.sqrt(wx*wx+wy*wy+wz*wz)||1
      wx=wx*(1-blend)+wx/len*r*blend
      wy=wy*(1-blend)+wy/len*r*blend
      wz=wz*(1-blend)+wz/len*r*blend
      const [px,py,pz]=project(wx,wy,wz,rx,ry)
      plotPoint(buf,px,py,pz,0.08+0.92*light)
    }
  }
}

// Linked rings: rings slowly tilt toward/away from each other
function drawShapeLinkedRings(buf, rx, ry, t) {
  const tilt = Math.sin(t * 0.025) * 0.4
  const R=13, r=5, S=84, VS=28
  for (let ring=0;ring<2;ring++) {
    for (let i=0;i<=S;i++) {
      const u=i/S*Math.PI*2
      for (let j=0;j<=VS;j++) {
        const v=j/VS*Math.PI*2
        let wx,wy,wz,nx,ny
        if (ring===0) {
          // ring in XY plane, tilted by tilt
          const bx=(R+r*Math.cos(v))*Math.cos(u), by=(R+r*Math.cos(v))*Math.sin(u), bz=r*Math.sin(v)
          wx=bx; wy=by*Math.cos(tilt)-bz*Math.sin(tilt); wz=by*Math.sin(tilt)+bz*Math.cos(tilt)
          nx=(wx-R*Math.cos(u))/r; ny=(wy)/r
        } else {
          // ring in XZ plane, tilted opposite
          const bx=(R+r*Math.cos(v))*Math.cos(u), by=r*Math.sin(v), bz=(R+r*Math.cos(v))*Math.sin(u)
          wx=bx; wy=by*Math.cos(-tilt)-bz*Math.sin(-tilt); wz=by*Math.sin(-tilt)+bz*Math.cos(-tilt)
          nx=(wx-R*Math.cos(u))/r; ny=wy/r
        }
        const [px,py,pz]=project(wx,wy,wz,rx,ry)
        plotPoint(buf,px,py,pz,0.1+0.9*Math.max(0,nx*0.4+ny*0.3+0.25))
      }
    }
  }
}

// Spring: compresses and stretches vertically
function drawShapeSpring(buf, rx, ry, t) {
  const heightScale = 0.6 + 0.5 * ((Math.sin(t * 0.04) + 1) * 0.5) // 0.6..1.1
  const turns=5, hR=14, tR=4, H=38*heightScale, US=turns*32, VS=18
  for (let i=0;i<=US;i++) {
    const u=i/US, angle=u*turns*Math.PI*2
    const hcx=hR*Math.cos(angle), hcy=-H/2+H*u, hcz=hR*Math.sin(angle)
    const tx=-hR*Math.sin(angle), ty=H/(turns*Math.PI*2), tz=hR*Math.cos(angle)
    const tl=Math.sqrt(tx*tx+ty*ty+tz*tz)
    const txn=tx/tl,tyn=ty/tl,tzn=tz/tl
    const bx=tyn*0-tzn*(-1),by=0,bz=txn*(-1)
    const bl=Math.sqrt(bx*bx+by*by+bz*bz)||1
    const bxn=bx/bl,byn=by/bl,bzn=bz/bl
    const nx2=tyn*bzn-tzn*byn,ny2=tzn*bxn-txn*bzn,nz2=txn*byn-tyn*bxn
    for (let j=0;j<=VS;j++) {
      const v=j/VS*Math.PI*2
      const [px,py,pz]=project(hcx+tR*(Math.cos(v)*nx2+Math.sin(v)*bxn),hcy+tR*(Math.cos(v)*ny2+Math.sin(v)*byn),hcz+tR*(Math.cos(v)*nz2+Math.sin(v)*bzn),rx,ry)
      plotPoint(buf,px,py,pz,0.2+0.8*Math.max(0,Math.cos(v)*0.6+0.4))
    }
  }
}

// Trefoil: tube radius pulses — the knot breathes
function drawShapeTrefoil(buf, rx, ry, t) {
  const r = 3 + 1.5 * Math.abs(Math.sin(t * 0.038))
  const R=15, S=220, VS=20
  for (let i=0;i<=S;i++) {
    const tt=i/S*Math.PI*2, dt=0.02, t2=tt+dt
    const kx=(R+R*0.4*Math.cos(1.5*tt))*Math.cos(tt), ky=(R+R*0.4*Math.cos(1.5*tt))*Math.sin(tt), kz=R*0.4*Math.sin(1.5*tt)
    const kx2=(R+R*0.4*Math.cos(1.5*t2))*Math.cos(t2), ky2=(R+R*0.4*Math.cos(1.5*t2))*Math.sin(t2), kz2=R*0.4*Math.sin(1.5*t2)
    const tx=kx2-kx, ty=ky2-ky, tz=kz2-kz, tl=Math.sqrt(tx*tx+ty*ty+tz*tz)||1
    const nx=ty-0, ny=0-tx, nz=0
    const nl=Math.sqrt(nx*nx+ny*ny+nz*nz)||1
    const nxn=nx/nl,nyn=ny/nl,nzn=nz/nl
    const bx=ty/tl*nzn-tz/tl*nyn, by=tz/tl*nxn-tx/tl*nzn, bz=tx/tl*nyn-ty/tl*nxn
    for (let j=0;j<=VS;j++) {
      const v=j/VS*Math.PI*2
      const [px,py,pz]=project(kx+r*(Math.cos(v)*nxn+Math.sin(v)*bx)+0,ky+r*(Math.cos(v)*nyn+Math.sin(v)*by)+4,kz+r*(Math.cos(v)*nzn+Math.sin(v)*bz),rx,ry)
      plotPoint(buf,px,py,pz,0.15+0.85*Math.max(0,Math.cos(v)*0.6+0.4))
    }
  }
}

// Octahedron: spins an extra axis — dual rotation
function drawShapeOctahedron(buf, rx, ry, t) {
  const extraRot = t * 0.02
  const verts=[[22,0,0],[-22,0,0],[0,22,0],[0,-22,0],[0,0,22],[0,0,-22]].map(([x,y,z])=>{
    // rotate around Z
    return [x*Math.cos(extraRot)-y*Math.sin(extraRot), x*Math.sin(extraRot)+y*Math.cos(extraRot), z]
  })
  const faces=[[0,4,2],[0,2,5],[0,5,3],[0,3,4],[1,2,4],[1,5,2],[1,3,5],[1,4,3]]
  const S=18
  for (const [ai,bi,ci] of faces) {
    const a=verts[ai],b=verts[bi],c=verts[ci]
    const nx=(b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1])
    const ny=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])
    const nz=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
    const nl=Math.sqrt(nx*nx+ny*ny+nz*nz)
    const light=Math.max(0.05,(nx/nl)*0.3+(ny/nl)*0.7+(nz/nl)*0.5)
    for (let i=0;i<=S;i++) for (let j=0;j<=S-i;j++) {
      const u=i/S,v=j/S,w=1-u-v
      const [px,py,pz]=project(a[0]*w+b[0]*u+c[0]*v,a[1]*w+b[1]*u+c[1]*v,a[2]*w+b[2]*u+c[2]*v,rx,ry)
      plotPoint(buf,px,py,pz,0.08+0.92*light)
    }
  }
}

// Hyperboloid: waist tightens and loosens
function drawShapeHyperboloid(buf, rx, ry, t) {
  const waistScale = 0.6 + 0.5 * ((Math.sin(t * 0.03) + 1) * 0.5)
  const a=14*waistScale, cVal=18, H=38, S=52, VS=28
  for (let i=0;i<=VS;i++) {
    const tt=(i/VS)*2-1, wy=tt*H/2
    const rad=a*Math.sqrt(1+tt*tt*(H/2)**2/(cVal*cVal))
    for (let j=0;j<=S;j++) {
      const angle=j/S*Math.PI*2
      const wx=rad*Math.cos(angle), wz=rad*Math.sin(angle)
      const [px,py,pz]=project(wx,wy,wz,rx,ry)
      plotPoint(buf,px,py,pz,0.1+0.9*Math.max(0,Math.cos(angle)*0.5+0.3))
    }
  }
}

// Twisted prism: twist angle increases over time — continuously twisting
function drawShapeTwistedPrism(buf, rx, ry, t) {
  const twist = Math.PI * 0.6 + t * 0.008
  const sides=6, r=18, H=38, layers=40
  for (let l=0;l<=layers;l++) {
    const tt=l/layers, wy=-H/2+H*tt, rot=tt*twist
    for (let s=0;s<sides;s++) {
      const a0=s/sides*Math.PI*2+rot, a1=(s+1)/sides*Math.PI*2+rot
      const x0=r*Math.cos(a0), z0=r*Math.sin(a0), x1=r*Math.cos(a1), z1=r*Math.sin(a1)
      if (l<layers) {
        const rot2=(tt+1/layers)*twist
        const a0n=s/sides*Math.PI*2+rot2, a1n=(s+1)/sides*Math.PI*2+rot2
        const wyn=-H/2+H*(tt+1/layers)
        const nx0=r*Math.cos(a0n), nz0=r*Math.sin(a0n), nx1=r*Math.cos(a1n), nz1=r*Math.sin(a1n)
        const S2=12
        for (let i=0;i<=S2;i++) for (let j=0;j<=S2;j++) {
          const u=i/S2, v=j/S2
          const wx=(1-u)*((1-v)*x0+v*x1)+u*((1-v)*nx0+v*nx1)
          const wz=(1-u)*((1-v)*z0+v*z1)+u*((1-v)*nz0+v*nz1)
          const [px,py,pz]=project(wx,wy+(wyn-wy)*u,wz,rx,ry)
          plotPoint(buf,px,py,pz,0.15+0.85*Math.max(0,Math.cos(a0+(a1-a0)*v+Math.PI/sides)*0.7+0.3))
        }
      }
      for (let st=0;st<=16;st++) {
        const wx=(1-st/16)*x0+(st/16)*x1, wz=(1-st/16)*z0+(st/16)*z1
        const [px,py,pz]=project(wx,wy,wz,rx,ry)
        plotPoint(buf,px,py,pz,0.2+0.6*Math.max(0,Math.cos(a0+(a1-a0)*(st/16))*0.6+0.4))
      }
    }
  }
}

// Stellated octahedron: spikes pulse in/out
function drawShapeStellatedOcta(buf, rx, ry, t) {
  const spikeScale = 1.4 + 0.4 * Math.sin(t * 0.04)
  const r=13
  const verts=[[r,0,0],[-r,0,0],[0,r,0],[0,-r,0],[0,0,r],[0,0,-r]]
  const tips=[[r*spikeScale*1.3,0,0],[-r*spikeScale*1.3,0,0],[0,r*spikeScale*1.3,0],[0,-r*spikeScale*1.3,0],[0,0,r*spikeScale*1.3],[0,0,-r*spikeScale*1.3]]
  const pyramids=[[0,[4,2,5,3]],[1,[2,4,3,5]],[2,[0,4,1,5]],[3,[4,0,5,1]],[4,[2,0,3,1]],[5,[0,2,1,3]]]
  const S=11
  for (const [ti,baseIdxs] of pyramids) {
    const tip=tips[ti], baseV=baseIdxs.map(i=>verts[i])
    for (let f=0;f<4;f++) {
      const a=baseV[f], b=baseV[(f+1)%4]
      const nx=(b[1]-a[1])*(tip[2]-a[2])-(b[2]-a[2])*(tip[1]-a[1])
      const ny=(b[2]-a[2])*(tip[0]-a[0])-(b[0]-a[0])*(tip[2]-a[2])
      const nz=(b[0]-a[0])*(tip[1]-a[1])-(b[1]-a[1])*(tip[0]-a[0])
      const nl=Math.sqrt(nx*nx+ny*ny+nz*nz)||1
      const light=Math.max(0.05,(nx/nl)*0.3+(ny/nl)*0.7+(nz/nl)*0.5)
      for (let i=0;i<=S;i++) for (let j=0;j<=S-i;j++) {
        const u=i/S, v=j/S, w=1-u-v
        const [px,py,pz]=project(a[0]*u+b[0]*v+tip[0]*w,a[1]*u+b[1]*v+tip[1]*w,a[2]*u+b[2]*v+tip[2]*w,rx,ry)
        plotPoint(buf,px,py,pz,0.08+0.92*light)
      }
    }
  }
}

// Torus knot: tube thickness pulses, and p/q ratio slowly morphs
function drawShapeTorusKnot(buf, rx, ry, t) {
  const r2 = 2.5 + 1.2 * Math.abs(Math.sin(t * 0.033))
  const p=2, q=3, R=14, r1=5, S=240, VS=20
  for (let i=0;i<=S;i++) {
    const tt=i/S*Math.PI*2, dt=0.015, t2=tt+dt
    const kx=(R+r1*Math.cos(q*tt))*Math.cos(p*tt), ky=(R+r1*Math.cos(q*tt))*Math.sin(p*tt), kz=r1*Math.sin(q*tt)
    const kx2=(R+r1*Math.cos(q*t2))*Math.cos(p*t2), ky2=(R+r1*Math.cos(q*t2))*Math.sin(p*t2), kz2=r1*Math.sin(q*t2)
    const tx=kx2-kx, ty=ky2-ky, tz=kz2-kz, tl=Math.sqrt(tx*tx+ty*ty+tz*tz)||1
    const nx=ty, ny=-tx, nz=0
    const nl=Math.sqrt(nx*nx+ny*ny+nz*nz)||1
    const nxn=nx/nl, nyn=ny/nl, nzn=nz/nl
    const bx=ty/tl*nzn-tz/tl*nyn, by=tz/tl*nxn-tx/tl*nzn, bz=tx/tl*nyn-ty/tl*nxn
    for (let j=0;j<=VS;j++) {
      const v=j/VS*Math.PI*2
      const [px,py,pz]=project(kx+r2*(Math.cos(v)*nxn+Math.sin(v)*bx),ky+r2*(Math.cos(v)*nyn+Math.sin(v)*by),kz+r2*(Math.cos(v)*nzn+Math.sin(v)*bz),rx,ry)
      plotPoint(buf,px,py,pz,0.15+0.85*Math.max(0,Math.cos(v)*0.6+0.4))
    }
  }
}

// Spiral tower: floors rotate continuously (like a building twisting)
function drawShapeSpiralTower(buf, rx, ry, t) {
  const floors=14, floorR=16, h=3, totalH=floors*h
  const timeRot = t * 0.015
  for (let fl=0;fl<floors;fl++) {
    const tt=fl/(floors-1), rot=tt*Math.PI*2.5 + timeRot
    const wy=-totalH/2+fl*h
    const curR=floorR*(0.4+0.6*(1-tt))
    drawCylinder(buf,rx,ry,0,wy+h*0.3,0,curR,h*0.55,28)
    const S=28
    for (let s=0;s<=S;s++) {
      const a=s/S*Math.PI*2+rot
      for (let ri=0;ri<=8;ri++) {
        const rr=ri/8*curR
        const [px,py,pz]=project(rr*Math.cos(a),wy+h*0.57,rr*Math.sin(a),rx,ry)
        plotPoint(buf,px,py,pz,0.2+0.6*Math.max(0,Math.cos(a)*0.5+0.5))
      }
    }
  }
}

// Saturn: rings slowly tilt (like orbital precession)
function drawShapeSaturn(buf, rx, ry, t) {
  drawSphere(buf,rx,ry,13,0,0,0)
  const tilt = Math.sin(t * 0.018) * 0.3
  for (let ring=0;ring<3;ring++) {
    const R=20+ring*5, r=2, S=72, VS=10
    for (let i=0;i<=S;i++) {
      const u=i/S*Math.PI*2
      for (let j=0;j<=VS;j++) {
        const v=j/VS*Math.PI*2
        // rings tilt in the XY plane
        const bx=(R+r*Math.cos(v))*Math.cos(u)
        const by=r*Math.sin(v)*0.25
        const bz=(R+r*Math.cos(v))*Math.sin(u)
        const wx=bx, wy=by*Math.cos(tilt)-bz*Math.sin(tilt), wz=by*Math.sin(tilt)+bz*Math.cos(tilt)
        const [px,py,pz]=project(wx,wy,wz,rx,ry)
        const nx=(bx-R*Math.cos(u))/r
        plotPoint(buf,px,py,pz,0.15+0.85*Math.max(0,nx*0.5+0.35))
      }
    }
  }
}

// Dodecahedron: faces slowly push outward (explode effect oscillating)
function drawShapeDodecahedron(buf, rx, ry, t) {
  const explode = 1 + 0.18 * Math.abs(Math.sin(t * 0.025))
  const phi=(1+Math.sqrt(5))/2
  const raw=[[1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1],[-1,1,1],[-1,1,-1],[-1,-1,1],[-1,-1,-1],[0,phi,1/phi],[0,phi,-1/phi],[0,-phi,1/phi],[0,-phi,-1/phi],[1/phi,0,phi],[-1/phi,0,phi],[1/phi,0,-phi],[-1/phi,0,-phi],[phi,1/phi,0],[phi,-1/phi,0],[-phi,1/phi,0],[-phi,-1/phi,0]]
  const r=22
  const verts=raw.map(v=>{const l=Math.sqrt(v[0]**2+v[1]**2+v[2]**2);return[v[0]/l*r,v[1]/l*r,v[2]/l*r]})
  const faces=[[0,16,2,12,13],[4,13,12,1,9],[0,9,8,5,15],[1,15,3,17,14],[2,17,3,11,10],[6,10,11,7,19],[4,18,19,7,13],[5,18,4,9,8],[6,19,18,5,10],[0,16,17,3,15],[1,14,6,13,12],[2,10,6,7,11]]
  const S=9
  for (const face of faces) {
    const pts=face.map(i=>verts[i])
    const ccx=pts.reduce((s,p)=>s+p[0],0)/pts.length
    const ccy=pts.reduce((s,p)=>s+p[1],0)/pts.length
    const ccz=pts.reduce((s,p)=>s+p[2],0)/pts.length
    const clen=Math.sqrt(ccx*ccx+ccy*ccy+ccz*ccz)||1
    const light=Math.max(0.08,(ccx/clen)*0.3+(ccy/clen)*0.5+(ccz/clen)*0.4+0.2)
    // offset each face outward
    const ox=ccx/clen*(explode-1)*4, oy=ccy/clen*(explode-1)*4, oz=ccz/clen*(explode-1)*4
    for (let i=0;i<pts.length;i++) {
      const a=pts[i],b=pts[(i+1)%pts.length],c=[ccx,ccy,ccz]
      for (let p=0;p<=S;p++) for (let q=0;q<=S-p;q++) {
        const u=p/S,v=q/S,w=1-u-v
        const [px,py,pz]=project(a[0]*u+b[0]*v+c[0]*w+ox,a[1]*u+b[1]*v+c[1]*w+oy,a[2]*u+b[2]*v+c[2]*w+oz,rx,ry)
        plotPoint(buf,px,py,pz,0.08+0.92*light)
      }
    }
  }
}

// Capsule: bounces vertically like it was dropped
function drawShapeCapsule(buf, rx, ry, t) {
  const bounce = Math.abs(Math.sin(t * 0.045)) * 5
  const squash = 1 - 0.15 * Math.abs(Math.sin(t * 0.045))
  const stretch = 1 + 0.1 * Math.cos(t * 0.045)
  drawCylinder(buf,rx,ry,0,bounce,0,12,24*stretch)
  drawSphere(buf,rx,ry,12*squash,0,-12*stretch+bounce,0)
  drawSphere(buf,rx,ry,12*squash,0,12*stretch+bounce,0)
}

// Ring stack: rings spin at different speeds (gyroscope-like)
function drawShapeRingStack(buf, rx, ry, t) {
  const offsets = [t * 0.04, t * 0.025, t * 0.06]
  const ys = [-14, 0, 14]
  for (let ri=0;ri<3;ri++) {
    const S=56, R=12, r=4
    for (let i=0;i<=S;i++) {
      const u=i/S*Math.PI*2 + offsets[ri]
      for (let j=0;j<=S;j++) {
        const v=j/S*Math.PI*2
        const wx=(R+r*Math.cos(v))*Math.cos(u), wy=ys[ri]+r*Math.sin(v), wz=(R+r*Math.cos(v))*Math.sin(u)
        const [px,py,pz]=project(wx,wy,wz,rx,ry)
        const nx=(wx-R*Math.cos(u))/r, ny=(wy-ys[ri])/r, nz=(wz-R*Math.sin(u))/r
        plotPoint(buf,px,py,pz,0.1+0.9*Math.max(0,nx*0.3+ny*0.7+nz*0.4))
      }
    }
  }
}

// Tower: beacon light spins on top
function drawShapeTower(buf, rx, ry, t) {
  drawBox(buf,rx,ry,-14,-20,-14,14,20,14)
  drawBox(buf,rx,ry,-8,-28,-8,8,-20,8)
  // spinning light orb around the top sphere
  const orbitAngle = t * 0.06
  const orbitR = 10
  const ox = orbitR * Math.cos(orbitAngle), oz = orbitR * Math.sin(orbitAngle)
  drawSphere(buf,rx,ry,6,0,-30,0)
  drawSphere(buf,rx,ry,3,ox,-32,oz) // small orbiting sphere
}

// ─── Shape registry ───────────────────────────────────────────────────────

const shapes = [
  { name:'sphere',         draw:(b,rx,ry,t)=>drawShapeSphere(b,rx,ry,t) },
  { name:'cube',           draw:(b,rx,ry,t)=>drawShapeCube(b,rx,ry,t) },
  { name:'torus',          draw:(b,rx,ry,t)=>drawShapeTorus(b,rx,ry,t) },
  { name:'pyramid',        draw:(b,rx,ry,t)=>drawShapePyramid(b,rx,ry,t) },
  { name:'möbius',         draw:(b,rx,ry,t)=>drawShapeMobius(b,rx,ry,t) },
  { name:'gem',            draw:(b,rx,ry,t)=>drawShapeGem(b,rx,ry,t) },
  { name:'DNA',            draw:(b,rx,ry,t)=>drawShapeDNA(b,rx,ry,t) },
  { name:'icosahedron',    draw:(b,rx,ry,t)=>drawShapeIcosahedron(b,rx,ry,t) },
  { name:'linked rings',   draw:(b,rx,ry,t)=>drawShapeLinkedRings(b,rx,ry,t) },
  { name:'spring',         draw:(b,rx,ry,t)=>drawShapeSpring(b,rx,ry,t) },
  { name:'trefoil knot',   draw:(b,rx,ry,t)=>drawShapeTrefoil(b,rx,ry,t) },
  { name:'octahedron',     draw:(b,rx,ry,t)=>drawShapeOctahedron(b,rx,ry,t) },
  { name:'hyperboloid',    draw:(b,rx,ry,t)=>drawShapeHyperboloid(b,rx,ry,t) },
  { name:'twisted prism',  draw:(b,rx,ry,t)=>drawShapeTwistedPrism(b,rx,ry,t) },
  { name:'stellated octa', draw:(b,rx,ry,t)=>drawShapeStellatedOcta(b,rx,ry,t) },
  { name:'torus knot',     draw:(b,rx,ry,t)=>drawShapeTorusKnot(b,rx,ry,t) },
  { name:'spiral tower',   draw:(b,rx,ry,t)=>drawShapeSpiralTower(b,rx,ry,t) },
  { name:'saturn',         draw:(b,rx,ry,t)=>drawShapeSaturn(b,rx,ry,t) },
  { name:'dodecahedron',   draw:(b,rx,ry,t)=>drawShapeDodecahedron(b,rx,ry,t) },
  { name:'capsule',        draw:(b,rx,ry,t)=>drawShapeCapsule(b,rx,ry,t) },
  { name:'ring stack',     draw:(b,rx,ry,t)=>drawShapeRingStack(b,rx,ry,t) },
  { name:'tower',          draw:(b,rx,ry,t)=>drawShapeTower(b,rx,ry,t) },
]

// ─── Component ────────────────────────────────────────────────────────────

export default function Morph() {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState(300)

  const st = useRef({
    rotX: 0.4, rotY: 0.4,
    spinY: 0.018, spinX: 0,
    targetShape: 0, currentShape: 0,
    morphT: 1, morphing: false,
    frame: 0, autoTimer: null, isDark: false, autoIdx: 1,
    dragging: false, lastX: 0, lastY: 0,
    dragVelX: 0, dragVelY: 0,
  })

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth
      setCanvasSize(vw < 480 ? Math.min(vw - 32, 280) : vw < 1024 ? 340 : 420)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  function jumpTo(idx) {
    if (idx === st.current.currentShape) return
    st.current.targetShape = idx
    st.current.morphT = 0
    st.current.morphing = true
  }

  useEffect(() => {
    const s = st.current
    s.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const getXY = e => e.touches ? [e.touches[0].clientX, e.touches[0].clientY] : [e.clientX, e.clientY]

    const onDown = e => {
      s.dragging = true
      s.dragVelX = 0; s.dragVelY = 0
      ;[s.lastX, s.lastY] = getXY(e)
      canvas.style.cursor = 'grabbing'
      e.preventDefault()
    }
    const onMove = e => {
      if (!s.dragging) return
      const [cx, cy] = getXY(e)
      const dx = cx - s.lastX, dy = cy - s.lastY
      s.rotY += dx * 0.012
      s.rotX = Math.max(-Math.PI/2, Math.min(Math.PI/2, s.rotX + dy * 0.012))
      s.dragVelY = dx * 0.012
      s.dragVelX = dy * 0.012
      s.lastX = cx; s.lastY = cy
      e.preventDefault()
    }
    const onUp = () => {
      s.dragging = false
      canvas.style.cursor = 'grab'
      s.spinY = s.dragVelY
      s.spinX = s.dragVelX
    }

    canvas.addEventListener('mousedown', onDown)
    canvas.addEventListener('touchstart', onDown, { passive: false })
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)
    canvas.style.cursor = 'grab'

    function renderBuf(buf) {
      const img = ctx.createImageData(W, H)
      const colorStr = getComputedStyle(document.documentElement).getPropertyValue('--selected-color-rgb') || '51,154,240'
      const rgb = colorStr.split(',').map(v => parseInt(v.trim()))
      const isDark = s.isDark
      const [fgR, fgG, fgB] = rgb
      for (let i = 0; i < W * H; i++) {
        const x = i % W, y = Math.floor(i / W)
        if (buf.dep[i] > -999) {
          if (dithPix(buf.col[i], x, y)) {
            img.data[i*4]=fgR; img.data[i*4+1]=fgG; img.data[i*4+2]=fgB; img.data[i*4+3]=255
          } else {
            img.data[i*4]=isDark?220:Math.round(fgR*0.2)
            img.data[i*4+1]=isDark?220:Math.round(fgG*0.2)
            img.data[i*4+2]=isDark?220:Math.round(fgB*0.2)
            img.data[i*4+3]=255
          }
        } else {
          img.data[i*4+3]=0
        }
      }
      ctx.putImageData(img, 0, 0)
    }

    let rafId
    const loop = () => {
      s.isDark = document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark'

      if (!s.dragging) {
        s.spinY += (0.018 - s.spinY) * 0.012
        s.spinX *= 0.97
        s.rotY += s.spinY
        s.rotX = Math.max(-Math.PI/2, Math.min(Math.PI/2, s.rotX + s.spinX))
      }
      s.frame++
      const t = s.frame

      const buf = clearBuf()
      if (s.morphing && s.morphT < 1) {
        s.morphT += 0.045
        const ease = s.morphT < 0.5 ? 2*s.morphT**2 : 1-(2-2*s.morphT)**2/2
        const bufA = clearBuf(), bufB = clearBuf()
        shapes[s.currentShape].draw(bufA, s.rotX, s.rotY, t)
        shapes[s.targetShape].draw(bufB, s.rotX, s.rotY, t)
        for (let i = 0; i < W*H; i++) {
          const hasA=bufA.dep[i]>-999, hasB=bufB.dep[i]>-999
          if (hasA||hasB) {
            const pA=hasA?(1-ease):0, pB=hasB?ease:0, tot=pA+pB
            if (tot>0) {
              buf.col[i]=((hasA?bufA.col[i]:0)*pA+(hasB?bufB.col[i]:0)*pB)/tot
              buf.dep[i]=Math.max(bufA.dep[i],bufB.dep[i])
              buf.col[i]=Math.max(0,Math.min(1,buf.col[i]+Math.random()*0.35*(1-Math.abs(ease-0.5)*2)))
            }
          }
        }
        if (s.morphT>=1) { s.morphing=false; s.currentShape=s.targetShape }
      } else {
        shapes[s.currentShape].draw(buf, s.rotX, s.rotY, t)
      }
      renderBuf(buf)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    const nextAuto = () => {
      jumpTo(s.autoIdx)
      s.autoIdx = (s.autoIdx + 1) % shapes.length
      s.autoTimer = setTimeout(nextAuto, 3200)
    }
    s.autoTimer = setTimeout(nextAuto, 3200)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(s.autoTimer)
      canvas.removeEventListener('mousedown', onDown)
      canvas.removeEventListener('touchstart', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  return (
    <div ref={wrapRef} className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ imageRendering:'pixelated', width:canvasSize, height:canvasSize, display:'block', touchAction:'none' }}
      />
    </div>
  )
}