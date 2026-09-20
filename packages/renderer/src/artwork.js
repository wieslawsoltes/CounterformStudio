import {validateArtwork,bytesFromBase64} from '@wieslawsoltes/counterform-artwork';
/** Native resources are scoped to the visible source master, never the font model. */
export class ArtworkRenderer {
    constructor(S,makePath){this.S=S;this.makePath=makePath;this.entries=new Map();this.references=[];this.disposed=false;}
    update(references=[]){
        validateArtwork(references);if(this.disposed)return;
        const next=new Map(references.filter(r=>r.visible).map(r=>[r.id,r]));
        for(const [id,e]of this.entries)if(!next.has(id)||next.get(id).kind!==e.kind||e.kind==='vector'){e.resource?.Dispose();this.entries.delete(id);}
        for(const r of references)if(r.kind==='bitmap'){const e=this.entries.get(r.id);if(e&&e.png!==r.png){e.resource?.Dispose();this.entries.delete(r.id);}}
        this.references=references;
    }
    draw(canvas){
        if(this.disposed)return;const S=this.S;let count=0;
        for(const r of this.references){
            if(!r.visible||r.opacity===0)continue;
            let e=this.entries.get(r.id);
            if(!e){
                const resource=r.kind==='bitmap'?S.SKImage.FromEncodedData(bytesFromBase64(r.png)):this.makePath(S,r.contours);
                if(!resource)throw new Error(`Skia could not decode artwork ${r.name}`);
                if(r.kind==='bitmap'&&(resource.Width!==r.width||resource.Height!==r.height)){resource.Dispose();throw new Error('Artwork decoded dimensions mismatch');}
                e={kind:r.kind,png:r.png,resource};this.entries.set(r.id,e);
            }
            const paint=new S.SKPaint();canvas.Save();
            try{
                const [a,b,c,d,x,y]=r.transform;canvas.Concat(new S.SKMatrix(a,c,x,b,d,y,0,0,1));paint.IsAntialias=true;
                if(r.kind==='bitmap'){paint.Color=new S.SKColor(255,255,255,Math.round(r.opacity*255));canvas.DrawImage(e.resource,0,0,paint);}
                else{paint.Color=new S.SKColor(158,91,48,Math.round(r.opacity*255));paint.Style=S.SKPaintStyle.Fill;canvas.DrawPath(e.resource,paint);}
                count++;
            }finally{paint.Dispose();canvas.Restore();}
        }
        return count;
    }
    dispose(){if(this.disposed)return;this.disposed=true;for(const e of this.entries.values())e.resource.Dispose();this.entries.clear();this.references=[];}
}
