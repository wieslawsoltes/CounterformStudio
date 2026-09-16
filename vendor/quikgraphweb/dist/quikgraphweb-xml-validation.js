var hs=Object.defineProperty;var ei=(n,e)=>{for(var t in e)hs(n,t,{get:e[t],enumerable:!0})};function In(n,e){return n===e||n!==n&&e!==e||n!=null&&typeof n.Equals=="function"&&!!n.Equals(e)}var te=globalThis.Map,De=globalThis.Set,ye=n=>n!==null&&(typeof n=="object"||typeof n=="function")&&typeof n.Equals=="function",_n=n=>typeof n.GetHashCode=="function"?n.GetHashCode():void 0;function Pe(n){if(n==null||typeof n!="object"&&typeof n!="function")throw new TypeError("Expected a set-like object.");let e=Number(n.size);if(Number.isNaN(e))throw new TypeError("Set-like size must be numeric.");if(Math.trunc(e)<0)throw new RangeError("Set-like size must be nonnegative.");if(typeof n.has!="function"||typeof n.keys!="function")throw new TypeError("Set-like object must provide has() and keys().");return n instanceof R?n:new R({[Symbol.iterator]:()=>n.keys()})}var D=class extends te{constructor(e){if(super(),this._buckets=null,e!=null)for(let[t,r]of e)this.set(t,r)}_canonicalKey(e){if(te.prototype.has.call(this,e)||!ye(e))return e;let t=this._buckets?.get(_n(e));if(t){for(let r of t)if(In(r,e))return r}return e}has(e){return te.prototype.has.call(this,e)?!0:ye(e)?te.prototype.has.call(this,this._canonicalKey(e)):!1}get(e){return te.prototype.has.call(this,e)||!ye(e)?te.prototype.get.call(this,e):te.prototype.get.call(this,this._canonicalKey(e))}set(e,t){if(te.prototype.has.call(this,e)||!ye(e))return te.prototype.set.call(this,e,t),this;let r=_n(e);this._buckets??=new te;let i=this._buckets.get(r);if(i){for(let s of i)if(In(s,e))return te.prototype.set.call(this,s,t),this}return i||(i=[],this._buckets.set(r,i)),i.push(e),te.prototype.set.call(this,e,t),this}delete(e){let t=this._canonicalKey(e);if(!te.prototype.delete.call(this,t))return!1;if(ye(t)){let r=_n(t),i=this._buckets.get(r);if(i){let s=i.indexOf(t);s>=0&&i.splice(s,1),i.length||this._buckets.delete(r)}}return!0}clear(){te.prototype.clear.call(this),this._buckets?.clear()}},R=class n extends De{constructor(e){if(super(),this._index=null,e!=null)for(let t of e)this.add(t)}add(e){return ye(e)?(this._index??=new D,this._index.has(e)||(this._index.set(e,e),De.prototype.add.call(this,e)),this):(De.prototype.add.call(this,e),this)}has(e){return De.prototype.has.call(this,e)?!0:ye(e)&&(this._index?.has(e)??!1)}delete(e){if(!ye(e))return De.prototype.delete.call(this,e);if(!this._index?.has(e))return!1;let t=this._index.get(e);return this._index.delete(e),De.prototype.delete.call(this,t)}clear(){De.prototype.clear.call(this),this._index?.clear()}union(e){let t=Pe(e),r=new n(this);for(let i of t)r.add(i);return r}intersection(e){let t=Pe(e),r=new n,i=this.size<=t.size?this:t,s=i===this?t:this;for(let l of i)s.has(l)&&r.add(l);return r}difference(e){let t=Pe(e),r=new n;for(let i of this)t.has(i)||r.add(i);return r}symmetricDifference(e){let t=Pe(e),r=this.difference(t);for(let i of t)this.has(i)||r.add(i);return r}isSubsetOf(e){let t=Pe(e);if(this.size>t.size)return!1;for(let r of this)if(!t.has(r))return!1;return!0}isSupersetOf(e){return Pe(e).isSubsetOf(this)}isDisjointFrom(e){let t=Pe(e),r=this.size<=t.size?this:t,i=r===this?t:this;for(let s of r)if(i.has(s))return!1;return!0}};var de={};ei(de,{AdjacencyGraph:()=>Z,ArgumentException:()=>kt,ArgumentNullException:()=>Ft,ArgumentOutOfRangeException:()=>At,ArrayAdjacencyGraph:()=>it,ArrayBidirectionalGraph:()=>st,ArrayUndirectedGraph:()=>Lt,BidirectionalAdapterGraph:()=>Rt,BidirectionalGraph:()=>ce,BidirectionalMatrixGraph:()=>ot,ClusteredAdjacencyGraph:()=>ht,CompressedSparseRowGraph:()=>Vt,DelegateBidirectionalIncidenceGraph:()=>Ot,DelegateImplicitGraph:()=>at,DelegateImplicitUndirectedGraph:()=>Bt,DelegateIncidenceGraph:()=>Ue,DelegateUndirectedGraph:()=>Mt,DelegateVertexAndEdgeListGraph:()=>lt,Edge:()=>$,EdgeEventArgs:()=>Dt,EdgeExtensions:()=>ps,EdgeListGraph:()=>rt,EquatableEdge:()=>Pt,EquatableTaggedEdge:()=>jn,EquatableTermEdge:()=>Un,EquatableUndirectedEdge:()=>Bn,EventHook:()=>O,FilteredBidirectionalGraph:()=>Xn,FilteredEdgeListGraph:()=>Qn,FilteredGraph:()=>dt,FilteredImplicitGraph:()=>jt,FilteredImplicitVertexSet:()=>ut,FilteredIncidenceGraph:()=>vt,FilteredUndirectedGraph:()=>Yn,FilteredVertexAndEdgeListGraph:()=>Kn,FilteredVertexListGraph:()=>ct,GetOtherVertex:()=>Se,GetUndirectedVertexEquality:()=>si,GraphColor:()=>ds,GraphExtensions:()=>yi,HasCycles:()=>rr,InDictionaryVertexPredicate:()=>Zn,InvalidOperationException:()=>Y,IsAdjacent:()=>we,IsPath:()=>nr,IsPathWithoutCycles:()=>ni,IsPredecessor:()=>ri,IsSelfEdge:()=>re,IsolatedVertexPredicate:()=>Jn,NegativeCapacityException:()=>Pn,NegativeCycleGraphException:()=>An,NegativeWeightException:()=>Gn,NoPathFoundException:()=>Nn,NonAcyclicGraphException:()=>Rn,NonStronglyConnectedGraphException:()=>Ln,NotSupportedException:()=>Gt,ParallelEdgeNotAllowedException:()=>Dn,QuikGraphException:()=>le,ResidualEdgePredicate:()=>zt,ReverseEdges:()=>oi,ReversedBidirectionalGraph:()=>$n,ReversedResidualEdgePredicate:()=>tr,SEdge:()=>We,SEquatableEdge:()=>he,SEquatableTaggedEdge:()=>zn,SReversedEdge:()=>Le,STaggedEdge:()=>vn,STaggedUndirectedEdge:()=>Wn,SUndirectedEdge:()=>nt,SinkVertexPredicate:()=>er,SortedVertexEquality:()=>$e,TaggedEdge:()=>Mn,TaggedUndirectedEdge:()=>qn,TermEdge:()=>Nt,ToAdjacencyGraph:()=>ai,ToArrayAdjacencyGraph:()=>di,ToArrayBidirectionalGraph:()=>ui,ToArrayUndirectedGraph:()=>ci,ToBidirectionalGraph:()=>li,ToCompressedRowGraph:()=>pi,ToDelegateBidirectionalIncidenceGraph:()=>mi,ToDelegateIncidenceGraph:()=>gi,ToDelegateUndirectedGraph:()=>xi,ToDelegateVertexAndEdgeListGraph:()=>fi,ToUndirectedGraph:()=>hi,ToVertexPair:()=>ir,TryGetPath:()=>ii,UndirectedBidirectionalGraph:()=>Hn,UndirectedEdge:()=>pe,UndirectedEdgeEventArgs:()=>On,UndirectedGraph:()=>ge,UndirectedVertexEquality:()=>fe,VertexEventArgs:()=>Vn,VertexNotFoundException:()=>V,defaultCompare:()=>oe,equals:()=>T,requireValue:()=>d});var ds=Object.freeze({White:0,Gray:1,Black:2}),le=class extends Error{constructor(e="A graph operation failed.",t){super(e,t instanceof Error?{cause:t}:t??void 0),this.name=new.target.name}get Message(){return this.message}get InnerException(){return this.cause??null}get StackTrace(){return this.stack}ToString(){return this.toString()}},V=class extends le{},An=class extends le{},Gn=class extends le{},Dn=class extends le{},Pn=class extends le{},Nn=class extends le{},Ln=class extends le{},Rn=class extends le{},kt=class extends TypeError{constructor(e="Invalid argument."){super(e),this.name=new.target.name}},Ft=class extends kt{},At=class extends RangeError{constructor(e="Argument out of range."){super(e),this.name=new.target.name}},Y=class extends Error{constructor(e="Operation is not valid."){super(e),this.name=new.target.name}},Gt=class extends Error{constructor(e="Operation is not supported."){super(e),this.name=new.target.name}};function d(n,e="value"){if(n==null)throw new Ft(`${e} must not be null.`);return n}function T(n,e){return n===e||n!==n&&e!==e||n!=null&&typeof n.Equals=="function"&&n.Equals(e)}function oe(n,e){return n===e?0:typeof n?.CompareTo=="function"?n.CompareTo(e):n<e?-1:n>e?1:0}var be=(n,e)=>{let t=Array.from(d(n,e));return t.forEach(r=>d(r,e)),t},kn=(n,e)=>{if(!Number.isInteger(e)||e<0||e>=n.length)throw new At("Index is outside the collection.");return n[e]},Ne=(n,e)=>{let t=n.findIndex(r=>T(r,e));return t<0?!1:(n.splice(t,1),!0)},O=class{constructor(){this._listeners=[]}add(e){if(typeof e!="function")throw new TypeError("Listener must be a function.");return this._listeners.push(e),e}remove(e){let t=this._listeners.lastIndexOf(e);return t>=0&&this._listeners.splice(t,1),t>=0}subscribe(e){this.add(e);let t=!0,r=()=>{t&&(t=!1,this.remove(e))};return{dispose:r,unsubscribe:r,Dispose:r}}emit(...e){for(let t of this._listeners.slice())t(...e)}clear(){this._listeners.length=0}get Count(){return this._listeners.length}},Vn=class{constructor(e){this.Vertex=d(e,"vertex")}},Dt=class{constructor(e){this.Edge=d(e,"edge")}},On=class extends Dt{constructor(e,t){super(e),this.Reversed=!!t}get Source(){return this.Reversed?this.Edge.Target:this.Edge.Source}get Target(){return this.Reversed?this.Edge.Source:this.Edge.Target}},Fn=new WeakMap,us=1;function ti(n){if(n==null)return 0;if(typeof n=="object"||typeof n=="function")return Fn.has(n)||Fn.set(n,us++),Fn.get(n);let e=0;for(let t of String(n))e=e*31^t.charCodeAt(0)|0;return e}function tt(n){return typeof n?.GetHashCode=="function"?n.GetHashCode():typeof n?.Equals=="function"?0:ti(n)}function Re(n){return Math.imul(tt(n.Source),397)^tt(n.Target)|0}function cs(n,e,t){Object.defineProperties(n,{Source:{value:d(e,"source"),enumerable:!0},Target:{value:d(t,"target"),enumerable:!0}})}var pt=Symbol("struct default"),$=class{constructor(e,t,r){r===pt?Object.defineProperties(this,{Source:{value:null,enumerable:!0},Target:{value:null,enumerable:!0}}):cs(this,e,t)}Equals(e){return this===e}GetHashCode(){return ti(this)}ToString(){return`${this.Source??""} -> ${this.Target??""}`}toString(){return this.ToString()}},Pt=class n extends ${Equals(e){return e instanceof n&&T(this.Source,e.Source)&&T(this.Target,e.Target)}GetHashCode(){return Re(this)}},We=class extends ${constructor(e,t){arguments.length===0?super(null,null,pt):super(e,t)}Equals(e){return e?.constructor===this.constructor&&T(this.Source,e.Source)&&T(this.Target,e.Target)}GetHashCode(){return Re(this)}},he=class extends We{},pe=class extends ${constructor(e,t,r){if(super(e,t,r),r!==pt&&oe(e,t)>0)throw new RangeError("source must be lower than or equal to target.")}ToString(){return`${this.Source??""} <-> ${this.Target??""}`}},Bn=class n extends pe{Equals(e){return e instanceof n&&T(this.Source,e.Source)&&T(this.Target,e.Target)}GetHashCode(){return Re(this)}},nt=class extends pe{constructor(e,t){arguments.length===0?super(null,null,pt):super(e,t)}Equals(e){return e?.constructor===this.constructor&&T(this.Source,e.Source)&&T(this.Target,e.Target)}GetHashCode(){return Re(this)}},He=n=>class extends n{constructor(...e){e.length===0&&(n===We||n===he||n===nt)?super():super(e[0],e[1]),this._tag=e.length===0?null:e[2],this.TagChanged=new O}get Tag(){return this._tag}set Tag(e){T(e,this._tag)||(this._tag=e,this.TagChanged.emit(this,{}))}ToString(){return`${super.ToString()} (${this.Tag==null?"":this.Tag})`}},Mn=class extends He($){},jn=class extends He(Pt){},vn=class extends He(We){Equals(e){return super.Equals(e)&&T(this.Tag,e.Tag)}GetHashCode(){return Re(this)^tt(this.Tag)}},zn=class extends He(he){},qn=class extends He(pe){},Wn=class extends He(nt){Equals(e){return super.Equals(e)&&T(this.Tag,e.Tag)}GetHashCode(){return Re(this)^tt(this.Tag)}},Nt=class extends ${constructor(e,t,r=0,i=0){if(super(e,t),!Number.isInteger(r)||r<0||!Number.isInteger(i)||i<0)throw new RangeError("Terminals must be nonnegative integers.");Object.defineProperties(this,{SourceTerminal:{value:r,enumerable:!0},TargetTerminal:{value:i,enumerable:!0}})}ToString(){return`${this.Source} (${this.SourceTerminal}) -> ${this.Target} (${this.TargetTerminal})`}},Un=class n extends Nt{Equals(e){return e instanceof n&&T(this.Source,e.Source)&&T(this.Target,e.Target)&&this.SourceTerminal===e.SourceTerminal&&this.TargetTerminal===e.TargetTerminal}GetHashCode(){return Re(this)^this.SourceTerminal^Math.imul(this.TargetTerminal,397)}},Le=class n extends ${constructor(e){arguments.length===0?(super(null,null,pt),e=null):(d(e,"originalEdge"),super(e.Target,e.Source)),Object.defineProperty(this,"OriginalEdge",{value:e,enumerable:!0})}Equals(e){return e instanceof n&&T(this.OriginalEdge,e.OriginalEdge)}GetHashCode(){return(typeof this.OriginalEdge?.GetHashCode=="function"?this.OriginalEdge.GetHashCode():tt(this.OriginalEdge))^16777619}ToString(){return`R(${this.OriginalEdge??""})`}},Ee=class{get IsVerticesEmpty(){return this.VertexCount===0}get IsEdgesEmpty(){return this.EdgeCount===0}ContainsEdge(e,t){return d(e),arguments.length===2?this.TryGetEdge(e,d(t))!==void 0:this.Edges.some(r=>T(r,e))}TryGetEdge(e,t){return d(e),d(t),this.TryGetEdges(e,t)?.[0]}TryGetEdges(e,t){d(e),d(t);let r=this.TryGetOutEdges(e);if(r)return r.filter(i=>this.IsDirected?T(i.Target,t):fe(i,e,t))}OutDegree(e){return this.OutEdges(e).length}IsOutEdgesEmpty(e){return this.OutDegree(e)===0}OutEdge(e,t){return kn(this.OutEdges(e),t)}InDegree(e){return this.InEdges(e).length}IsInEdgesEmpty(e){return this.InDegree(e)===0}InEdge(e,t){return kn(this.InEdges(e),t)}Degree(e){return this.OutDegree(e)+this.InDegree(e)}AdjacentEdges(e){return this.OutEdges(e).concat(this.InEdges(e).filter(t=>!re(t)))}TryGetAdjacentEdges(e){return this.ContainsVertex(e)?this.AdjacentEdges(e):void 0}AdjacentDegree(e){return this.AdjacentEdges(e).length}IsAdjacentEdgesEmpty(e){return this.AdjacentDegree(e)===0}AdjacentEdge(e,t){return kn(this.AdjacentEdges(e),t)}AdjacentVertices(e){return Array.from(new R(this.AdjacentEdges(e).filter(t=>!re(t)).map(t=>Se(t,e))))}},Z=class extends Ee{constructor(e=!0,t=-1,r=0){super();let i=typeof e=="object"?d(e):null;if(this.AllowParallelEdges=i?i.AllowParallelEdges:!!e,this.EdgeCapacity=i?i.EdgeCapacity:r,this._out=new D,this._in=new D,this._count=0,this.VertexAdded=new O,this.VertexRemoved=new O,this.EdgeAdded=new O,this.EdgeRemoved=new O,i&&(this.AddVertexRange(i.Vertices),this.AddEdgeRange(i.Edges),typeof i.InEdges=="function"))for(let s of i.Vertices)this._in.set(s,Array.from(i.InEdges(s)))}get IsDirected(){return!0}get VertexType(){return Object}get EdgeType(){return $}get VertexCount(){return this._out.size}get EdgeCount(){return this._count}get Vertices(){return Array.from(this._out.keys())}get Edges(){let e=[];for(let t of this._out.values())for(let r of t)e.push(r);return e}ContainsVertex(e){return this._out.has(d(e,"vertex"))}ContainsEdge(e,t){if(arguments.length===2)return this.TryGetEdge(e,t)!==void 0;let r=d(e,"edge");return this._out.get(r.Source)?.some(i=>T(i,r))??!1}TryGetEdge(e,t){return d(e),d(t),this._out.get(e)?.find(r=>T(r.Target,t))}TryGetEdges(e,t){return d(e),d(t),this._out.get(e)?.filter(r=>T(r.Target,t))}OutEdges(e){let t=this.TryGetOutEdges(e);if(!t)throw new V;return t}TryGetOutEdges(e){return this._out.get(d(e,"vertex"))?.slice()}InEdges(e){let t=this.TryGetInEdges(e);if(!t)throw new V;return t}TryGetInEdges(e){return this._in.get(d(e,"vertex"))?.slice()}OutDegree(e){let t=this._out.get(d(e));if(!t)throw new V;return t.length}InDegree(e){let t=this._in.get(d(e));if(!t)throw new V;return t.length}AddVertex(e){return d(e,"vertex"),this._out.has(e)?!1:(this._out.set(e,[]),this._in.set(e,[]),this.VertexAdded.emit(e),!0)}AddVertexRange(e){let t=0;for(let r of be(e,"vertices"))t+=this.AddVertex(r);return t}AddEdge(e){if(d(e,"edge"),!this.ContainsVertex(e.Source)||!this.ContainsVertex(e.Target))throw new V;return!this.AllowParallelEdges&&this.ContainsEdge(e.Source,e.Target)?!1:(this._out.get(e.Source).push(e),this._in.get(e.Target).push(e),++this._count,this.EdgeAdded.emit(e),!0)}AddEdgeRange(e){let t=0;for(let r of be(e,"edges"))t+=this.AddEdge(r);return t}AddVerticesAndEdge(e){return d(e,"edge"),this.AddVertex(e.Source),this.AddVertex(e.Target),this.AddEdge(e)}AddVerticesAndEdgeRange(e){let t=0;for(let r of be(e,"edges"))t+=this.AddVerticesAndEdge(r);return t}RemoveEdge(e){d(e,"edge");let t=this._out.get(e.Source);return!t||!Ne(t,e)?!1:(Ne(this._in.get(e.Target),e),--this._count,this.EdgeRemoved.emit(e),!0)}RemoveEdges(e){let t=0;for(let r of be(e,"edges"))t+=this.RemoveEdge(r);return t}RemoveEdgeIf(e){return d(e),this.RemoveEdges(this.Edges.filter(e))}RemoveOutEdgeIf(e,t){return d(t),this.RemoveEdges((this.TryGetOutEdges(e)??[]).filter(t))}RemoveInEdgeIf(e,t){return d(t),this.RemoveEdges((this.TryGetInEdges(e)??[]).filter(t))}ClearOutEdges(e){this.RemoveEdges(this.TryGetOutEdges(e)??[])}ClearInEdges(e){this.RemoveEdges(this.TryGetInEdges(e)??[])}ClearEdges(e){this.ClearOutEdges(e),this.ClearInEdges(e)}RemoveVertex(e){return this.ContainsVertex(e)?(this.ClearEdges(e),this._out.delete(e),this._in.delete(e),this.VertexRemoved.emit(e),!0):!1}RemoveVertexIf(e){d(e);let t=this.Vertices.filter(e);for(let r of t)this.RemoveVertex(r);return t.length}Clear(){let e=this.Edges,t=this.Vertices;this._out.clear(),this._in.clear(),this._count=0;for(let r of e)this.EdgeRemoved.emit(r);for(let r of t)this.VertexRemoved.emit(r)}TrimEdgeExcess(){for(let[e,t]of this._out)this._out.set(e,t.slice());for(let[e,t]of this._in)this._in.set(e,t.slice())}Clone(){return new this.constructor(this)}},ce=class extends Z{MergeVertex(e,t){d(t);let r=this.InEdges(e).filter(s=>!re(s)),i=this.OutEdges(e).filter(s=>!re(s));this.RemoveVertex(e);for(let s of r)for(let l of i)this.AddEdge(t(s.Source,l.Target))}MergeVerticesIf(e,t){d(e),d(t);for(let r of this.Vertices.filter(e))this.MergeVertex(r,t)}},ge=class n extends Z{constructor(e=!0,t=fe){super(typeof e=="object"?d(e).AllowParallelEdges:e),this.EdgeCapacity=-1,this.EdgeEqualityComparer=d(t),this._edges=[],typeof e=="object"&&(this.AddVertexRange(e.Vertices),this.AddEdgeRange(e.Edges))}get IsDirected(){return!1}get Edges(){return this._edges.slice()}ContainsEdge(e,t){return arguments.length===2?this.TryGetEdge(e,t)!==void 0:(d(e),this._out.get(e.Source)?.some(r=>T(r,e))??!1)}TryGetEdges(e,t){d(t);let r=this.TryGetAdjacentEdges(e)?.filter(i=>this.EdgeEqualityComparer(i,e,t));return r?.length?r:void 0}TryGetEdge(e,t){return d(e),d(t),this._sortedEdgeType&&oe(e,t)>0&&([e,t]=[t,e]),this._out.get(e)?.find(r=>this.EdgeEqualityComparer(r,e,t))}AdjacentEdges(e){return this.OutEdges(e)}AdjacentDegree(e){return this.AdjacentEdges(e).reduce((t,r)=>t+(re(r)?2:1),0)}TryGetAdjacentEdges(e){return this.TryGetOutEdges(e)}InEdges(e){return this.OutEdges(e)}TryGetInEdges(e){return this.TryGetOutEdges(e)}InDegree(e){return this.OutDegree(e)}Degree(e){return this.AdjacentDegree(e)}AddEdge(e){if(d(e),!this.ContainsVertex(e.Source)||!this.ContainsVertex(e.Target))throw new V;return!this.AllowParallelEdges&&this.ContainsEdge(e.Source,e.Target)?!1:(this._sortedEdgeType=(this._sortedEdgeType??!0)&&e instanceof pe,this._out.get(e.Source).push(e),re(e)||this._out.get(e.Target).push(e),this._edges.push(e),++this._count,this.EdgeAdded.emit(e),!0)}RemoveEdge(e){d(e);let t=this._out.get(e.Source);return!t||!Ne(t,e)?!1:(re(e)||Ne(this._out.get(e.Target),e),Ne(this._edges,e),--this._count,this.EdgeRemoved.emit(e),!0)}ClearAdjacentEdges(e){this.RemoveEdges(this.TryGetAdjacentEdges(e)??[])}ClearEdges(e){this.ClearAdjacentEdges(e)}ClearInEdges(e){this.ClearAdjacentEdges(e)}RemoveAdjacentEdgeIf(e,t){return d(t),this.RemoveEdges((this.TryGetAdjacentEdges(e)??[]).filter(t))}Clear(){let e=this.Edges,t=this.Vertices;this._edges.length=0,this._out.clear(),this._in.clear(),this._count=0;for(let r of e)this.EdgeRemoved.emit(r);for(let r of t)this.VertexRemoved.emit(r)}Clone(){let e=new n(this.AllowParallelEdges,this.EdgeEqualityComparer);return e.EdgeCapacity=this.EdgeCapacity,e.AddVertexRange(this.Vertices),e.AddEdgeRange(this.Edges),e}},rt=class n extends Ee{constructor(e=!0,t=!0){super(),this.IsDirected=!!e,this.AllowParallelEdges=!!t,this._edges=[],this.EdgeAdded=new O,this.EdgeRemoved=new O}get Edges(){return this._edges.slice()}get EdgeCount(){return this._edges.length}get Vertices(){let e=new R;for(let t of this._edges)e.add(t.Source),e.add(t.Target);return[...e]}get VertexCount(){return this.Vertices.length}ContainsVertex(e){return d(e),this._edges.some(t=>we(t,e))}TryGetOutEdges(e){return this.ContainsVertex(e)?this._edges.filter(t=>this.IsDirected?T(t.Source,e):we(t,e)):void 0}OutEdges(e){let t=this.TryGetOutEdges(e);if(!t)throw new V;return t}InEdges(e){if(!this.ContainsVertex(e))throw new V;return this._edges.filter(t=>this.IsDirected?T(t.Target,e):we(t,e))}AddEdge(e){return d(e),(this.AllowParallelEdges?this.ContainsEdge(e):this.ContainsEdge(e.Source,e.Target))?!1:(this._edges.push(e),this.EdgeAdded.emit(e),!0)}AddVerticesAndEdge(e){return this.AddEdge(e)}AddEdgeRange(e){let t=0;for(let r of be(e,"edges"))t+=this.AddEdge(r);return t}AddVerticesAndEdgeRange(e){return this.AddEdgeRange(e)}RemoveEdge(e){return d(e),Ne(this._edges,e)?(this.EdgeRemoved.emit(e),!0):!1}RemoveEdgeIf(e){d(e);let t=this.Edges.filter(e);for(let r of t)this.RemoveEdge(r);return t.length}Clear(){let e=this._edges;this._edges=[];for(let t of e)this.EdgeRemoved.emit(t)}Clone(){let e=new n(this.IsDirected,this.AllowParallelEdges);return e.AddEdgeRange(this.Edges),e}},me=class extends Ee{constructor(e){super(),this.OriginalGraph=d(e,"graph")}get IsDirected(){return this.OriginalGraph.IsDirected}get AllowParallelEdges(){return this.OriginalGraph.AllowParallelEdges}get Vertices(){return Array.from(this.OriginalGraph.Vertices)}get VertexCount(){return this.OriginalGraph.VertexCount}get Edges(){return Array.from(this.OriginalGraph.Edges)}get EdgeCount(){return this.OriginalGraph.EdgeCount}ContainsVertex(e){return this.OriginalGraph.ContainsVertex(e)}OutEdges(e){return Array.from(this.OriginalGraph.OutEdges(e))}TryGetOutEdges(e){return this.ContainsVertex(e)?this.OutEdges(e):void 0}InEdges(e){return Array.from(this.OriginalGraph.InEdges(e))}TryGetInEdges(e){return this.ContainsVertex(e)?this.InEdges(e):void 0}},it=class extends me{constructor(e){let t=new Z(d(e).AllowParallelEdges);t.AddVertexRange(e.Vertices),t.AddEdgeRange(e.Edges),super(t)}Clone(){return new this.constructor(this)}},st=class extends it{constructor(e){super(e);for(let t of e.Vertices)this.OriginalGraph._in.set(t,Array.from(e.InEdges(t)))}},Lt=class n extends me{constructor(e){let t=new ge(d(e).AllowParallelEdges,e.EdgeEqualityComparer??fe);t.AddVertexRange(e.Vertices),t.AddEdgeRange(e.Edges),super(t),this.EdgeEqualityComparer=t.EdgeEqualityComparer}AdjacentEdges(e){return this.OriginalGraph.AdjacentEdges(e)}AdjacentDegree(e){return this.OriginalGraph.AdjacentDegree(e)}TryGetEdges(e,t){return this.OriginalGraph.TryGetEdges(e,t)}Clone(){return new n(this)}},Rt=class extends me{constructor(e){super(e),this._incoming=new D;for(let t of e.Vertices)this._incoming.set(t,[]);for(let t of e.Edges)this._incoming.has(t.Target)||this._incoming.set(t.Target,[]),this._incoming.get(t.Target).push(t)}InEdges(e){let t=this._incoming.get(d(e));if(!t)throw new V;return t.slice()}TryGetInEdges(e){return this._incoming.get(d(e))?.slice()}},$n=class extends me{get Edges(){return this.OriginalGraph.Edges.map(e=>new Le(e))}OutEdges(e){return this.OriginalGraph.InEdges(e).map(t=>new Le(t))}InEdges(e){return this.OriginalGraph.OutEdges(e).map(t=>new Le(t))}},Hn=class extends me{constructor(e){super(e),this.EdgeEqualityComparer=fe}get IsDirected(){return!1}AdjacentEdges(e){return this.OriginalGraph.OutEdges(e).concat(this.OriginalGraph.InEdges(e).filter(t=>!re(t)))}AdjacentDegree(e){return this.OriginalGraph.Degree(e)}AdjacentEdge(){throw new Gt}OutEdges(e){return this.AdjacentEdges(e)}InEdges(e){return this.AdjacentEdges(e)}},ot=class n extends ce{constructor(e){if(!Number.isInteger(e)||e<0)throw new RangeError("vertexCount must be nonnegative.");super(!1),this._size=e;for(let t=0;t<e;++t)Z.prototype.AddVertex.call(this,t)}AddVertex(){throw new TypeError("Matrix graph has a fixed vertex set.")}RemoveVertex(){throw new TypeError("Matrix graph has a fixed vertex set.")}ContainsVertex(e){return Number.isInteger(e)&&e>=0&&e<this._size}TryGetEdge(e,t){return this.ContainsVertex(e)&&this.ContainsVertex(t)?this._matrix?.get(e*this._size+t):void 0}AddEdge(e){if(d(e),!this.ContainsVertex(e.Source)||!this.ContainsVertex(e.Target))throw new V;this._matrix||(this._matrix=new D);let t=e.Source*this._size+e.Target;return this._matrix.has(t)?!1:(this._matrix.set(t,e),this._out.get(e.Source).push(e),this._in.get(e.Target).push(e),++this._count,this.EdgeAdded.emit(e),!0)}RemoveEdge(e){d(e);let t=e.Source*this._size+e.Target,r=this._matrix?.get(t);return!r||!T(r,e)?!1:(this._matrix.delete(t),super.RemoveEdge(r))}OutEdges(e){return super.OutEdges(e).sort((t,r)=>t.Target-r.Target)}InEdges(e){return super.InEdges(e).sort((t,r)=>t.Source-r.Source)}get Edges(){return super.Edges.sort((e,t)=>e.Source-t.Source||e.Target-t.Target)}Clear(){this.RemoveEdgeIf(()=>!0)}Clone(){let e=new n(this.VertexCount);return e.AddEdgeRange(this.Edges),e}},Vt=class n extends Ee{constructor(e){super(),d(e),this._vertices=Array.from(e.Vertices),this._index=new D(this._vertices.map((t,r)=>[t,r])),this._offsets=new Uint32Array(this._vertices.length+1),this._targets=[];for(let t=0;t<this._vertices.length;++t){this._offsets[t]=this._targets.length;for(let r of e.OutEdges(this._vertices[t]))this._targets.push(r.Target)}this._offsets[this._vertices.length]=this._targets.length}static FromGraph(e){return new n(e)}get IsDirected(){return!0}get AllowParallelEdges(){return!1}get VertexCount(){return this._vertices.length}get Vertices(){return this._vertices.slice()}get EdgeCount(){return this._targets.length}get Edges(){let e=[];for(let t of this._vertices)for(let r of this.OutEdges(t))e.push(r);return e}ContainsVertex(e){return this._index.has(d(e))}OutEdges(e){let t=this.TryGetOutEdges(e);if(!t)throw new V;return t}TryGetOutEdges(e){d(e);let t=this._index.get(e);if(t===void 0)return;let r=[];for(let i=this._offsets[t];i<this._offsets[t+1];++i)r.push(new he(e,this._targets[i]));return r}OutDegree(e){let t=this._index.get(d(e));if(t===void 0)throw new V;return this._offsets[t+1]-this._offsets[t]}Clone(){return new n(this)}},at=class extends Ee{constructor(e,t=!0){super(),this._getter=d(e),this.AllowParallelEdges=!!t}get IsDirected(){return!0}TryGetOutEdges(e){let t=this._getter(d(e));return t==null||t===!1?void 0:Array.from(t)}ContainsVertex(e){return this.TryGetOutEdges(e)!==void 0}OutEdges(e){let t=this.TryGetOutEdges(e);if(!t)throw new V;return t}},Ue=class extends at{},Ot=class extends Ue{constructor(e,t,r=!0){super(e,r),this._inGetter=d(t)}TryGetInEdges(e){let t=this._inGetter(d(e));return t==null||t===!1?void 0:Array.from(t)}InEdges(e){let t=this.TryGetInEdges(e);if(!t)throw new V;return t}},lt=class extends Ue{constructor(e,t,r=!0){super(t,r),this._vertices=d(e)}get Vertices(){return Array.from(typeof this._vertices=="function"?this._vertices():this._vertices)}get VertexCount(){return this.Vertices.length}get Edges(){return this.Vertices.flatMap(e=>this.OutEdges(e))}get EdgeCount(){return this.Edges.length}ContainsVertex(e){return d(e),this.Vertices.some(t=>T(t,e))}TryGetOutEdges(e){if(!this.ContainsVertex(e))return;let t=new R(this.Vertices);return(super.TryGetOutEdges(e)??[]).filter(r=>T(r.Source,e)&&t.has(r.Target))}OutEdges(e){if(!this.ContainsVertex(e))throw new V;let t=this._getter(e);if(t==null||t===!1)throw new V;let r=new R(this.Vertices);return Array.from(t).filter(i=>T(i.Source,e)&&r.has(i.Target))}},Bt=class extends at{constructor(e,t=!0){super(e,t),this.EdgeEqualityComparer=fe}get IsDirected(){return!1}AdjacentEdges(e){return this.OutEdges(e)}TryGetAdjacentEdges(e){return this.TryGetOutEdges(e)}},Mt=class extends Bt{constructor(e,t,r=!0){super(t,r),this._vertices=d(e)}get Vertices(){return Array.from(typeof this._vertices=="function"?this._vertices():this._vertices)}get VertexCount(){return this.Vertices.length}get Edges(){return this.Vertices.flatMap(e=>this.AdjacentEdges(e).filter(t=>T(t.Source,e)))}get EdgeCount(){return this.Edges.length}ContainsVertex(e){return d(e),this.Vertices.some(t=>T(t,e))}TryGetOutEdges(e){if(!this.ContainsVertex(e))return;let t=new R(this.Vertices);return(super.TryGetOutEdges(e)??[]).filter(r=>we(r,e)&&t.has(Se(r,e)))}OutEdges(e){if(!this.ContainsVertex(e))throw new V;let t=this._getter(e);if(t==null||t===!1)throw new V;let r=new R(this.Vertices);return Array.from(t).filter(i=>we(i,e)&&r.has(Se(i,e)))}},ht=class n extends me{constructor(e){let t=e instanceof n?e:null;super(t?new Z(t.AllowParallelEdges):d(e)),this.Parent=t,this.Wrapped=this.OriginalGraph,this.Collapsed=!1,this._clusters=[]}get EdgeCapacity(){return this.Wrapped.EdgeCapacity}set EdgeCapacity(e){this.Wrapped.EdgeCapacity=e}get VertexType(){return Object}get EdgeType(){return $}get Clusters(){return this._clusters.slice()}get ClustersCount(){return this._clusters.length}AddCluster(){let e=new n(this);return this._clusters.push(e),e}RemoveCluster(e){d(e),Ne(this._clusters,e)}AddVertex(e){return this.Parent?.AddVertex(e),this.Wrapped.AddVertex(e)}AddVertexRange(e){return be(e).reduce((t,r)=>t+this.AddVertex(r),0)}AddEdge(e){return d(e),this.Parent&&!this.Parent.ContainsEdge(e)&&this.Parent.AddEdge(e),this.Wrapped.AddEdge(e)}AddEdgeRange(e){return be(e).reduce((t,r)=>t+this.AddEdge(r),0)}AddVerticesAndEdge(e){return d(e),this.AddVertex(e.Source),this.AddVertex(e.Target),this.AddEdge(e)}AddVerticesAndEdgeRange(e){return be(e).reduce((t,r)=>t+this.AddVerticesAndEdge(r),0)}_removeDescendants(e,t){for(let r of this._clusters)r.Wrapped[e](t),r._removeDescendants(e,t)}RemoveVertex(e){return this.ContainsVertex(e)?(this._removeDescendants("RemoveVertex",e),this.Wrapped.RemoveVertex(e),this.Parent?.RemoveVertex(e),!0):!1}RemoveEdge(e){return this.ContainsEdge(e)?(this._removeDescendants("RemoveEdge",e),this.Wrapped.RemoveEdge(e),this.Parent?.RemoveEdge(e),!0):!1}RemoveVertexIf(e){return d(e),this.Vertices.filter(e).reduce((t,r)=>t+this.RemoveVertex(r),0)}RemoveEdgeIf(e){return d(e),this.Edges.filter(e).reduce((t,r)=>t+this.RemoveEdge(r),0)}RemoveOutEdgeIf(e,t){return d(t),(this.TryGetOutEdges(e)??[]).filter(t).reduce((r,i)=>r+this.RemoveEdge(i),0)}ClearOutEdges(e){this.Wrapped.ClearOutEdges(e)}Clear(){this.Wrapped.Clear(),this._clusters.length=0}},dt=class extends me{constructor(e,t,r){super(e),this.BaseGraph=e,this.VertexPredicate=d(t),this.EdgePredicate=d(r)}FilterEdge(e){return d(e),this.VertexPredicate(e.Source)&&this.VertexPredicate(e.Target)&&this.EdgePredicate(e)}get Vertices(){return Array.from(this.BaseGraph.Vertices).filter(this.VertexPredicate)}get VertexCount(){return this.Vertices.length}get Edges(){return Array.from(this.BaseGraph.Edges).filter(e=>this.FilterEdge(e))}get EdgeCount(){return this.Edges.length}ContainsVertex(e){return this.VertexPredicate(d(e))&&this.BaseGraph.ContainsVertex(e)}ContainsEdge(e,t){return arguments.length===2?this.TryGetEdge(e,t)!==void 0:this.FilterEdge(e)&&this.BaseGraph.ContainsEdge(e)}OutEdges(e){if(!this.VertexPredicate(d(e)))throw new V;return Array.from(this.BaseGraph.OutEdges(e)).filter(t=>this.FilterEdge(t))}TryGetOutEdges(e){return this.ContainsVertex(e)?this.OutEdges(e):void 0}InEdges(e){if(!this.VertexPredicate(d(e)))throw new V;return Array.from(this.BaseGraph.InEdges(e)).filter(t=>this.FilterEdge(t))}TryGetInEdges(e){return this.ContainsVertex(e)?this.InEdges(e):void 0}TryGetEdges(e,t){if(d(e),d(t),!(!this.VertexPredicate(e)||!this.VertexPredicate(t)))return this.BaseGraph.TryGetEdges(e,t)?.filter(r=>this.EdgePredicate(r))}},ut=class extends dt{},jt=class extends ut{},vt=class extends jt{},ct=class extends vt{},Kn=class extends ct{},Qn=class extends ut{},Xn=class extends ct{},Yn=class extends dt{get EdgeEqualityComparer(){return this.BaseGraph.EdgeEqualityComparer}AdjacentEdges(e){if(!this.VertexPredicate(d(e)))throw new V;return Array.from(this.BaseGraph.AdjacentEdges(e)).filter(t=>this.FilterEdge(t))}AdjacentDegree(e){return this.AdjacentEdges(e).reduce((t,r)=>t+(re(r)?2:1),0)}OutEdges(e){return this.AdjacentEdges(e)}InEdges(e){return this.AdjacentEdges(e)}},Zn=class{constructor(e){this.VertexMap=d(e)}Test(e){return this.VertexMap.has(d(e))}},Jn=class{constructor(e){this.VisitedGraph=d(e)}Test(e){return this.VisitedGraph.Degree(d(e))===0}},er=class{constructor(e){this.VisitedGraph=d(e)}Test(e){return this.VisitedGraph.OutDegree(d(e))===0}},zt=class{constructor(e){this.ResidualCapacities=d(e)}Test(e){if(d(e),!this.ResidualCapacities.has(e))throw new TypeError("Residual capacity is missing.");return this.ResidualCapacities.get(e)>0}},tr=class extends zt{constructor(e,t){super(e),this.ReversedEdges=d(t)}Test(e){if(d(e),!this.ReversedEdges.has(e))throw new TypeError("Reversed edge is missing.");return super.Test(this.ReversedEdges.get(e))}};function re(n){return d(n),T(n.Source,n.Target)}function Se(n,e){return d(n),d(e),T(n.Source,e)?n.Target:n.Source}function we(n,e){return d(n),d(e),T(n.Source,e)||T(n.Target,e)}function nr(n){let e=!0,t;for(let r of d(n)){if(!e&&!T(t,r.Source))return!1;e=!1,t=r.Target}return!0}function rr(n){let e=new R,t=!0;for(let r of d(n)){if(t&&(e.add(r.Source),t=!1),e.has(r.Target))return!0;e.add(r.Target)}return!1}function ni(n){let e=Array.from(d(n));return nr(e)&&!rr(e)}function ir(n){return d(n),new he(n.Source,n.Target)}function ri(n,e,t){d(n),d(e),d(t);let r=new R;for(;!r.has(t);){if(T(t,e))return!0;r.add(t);let i=n.get(t);if(!i)return!1;t=Se(i,t)}return!1}function ii(n,e){d(n),d(e);let t=[],r=new R;for(;n.has(e);){if(r.has(e))return;r.add(e);let i=n.get(e);if(re(i))break;t.push(i),e=Se(i,e)}return t.length?t.reverse():void 0}function $e(n,e,t){return d(n),d(e),d(t),T(n.Source,e)&&T(n.Target,t)}function fe(n,e,t){return $e(n,e,t)||$e(n,t,e)}function si(n){return n===pe||n?.prototype instanceof pe?$e:fe}function oi(n){return Array.from(d(n),e=>new Le(e))}var ps=Object.freeze({IsSelfEdge:re,GetOtherVertex:Se,IsAdjacent:we,IsPath:nr,HasCycles:rr,IsPathWithoutCycles:ni,ToVertexPair:ir,IsPredecessor:ri,TryGetPath:ii,SortedVertexEquality:$e,UndirectedVertexEquality:fe,GetUndirectedVertexEquality:si,ReverseEdges:oi});for(let[n,e]of Object.entries({IsSelfEdge:re,GetOtherVertex:Se,IsAdjacent:we,ToVertexPair:ir,SortedVertexEquality:$e,UndirectedVertexEquality:fe}))Object.defineProperty($.prototype,n,{value(...t){return e(this,...t)}});function qt(n,e,t=!0,r=!0){d(e),d(t);let i=typeof t=="function"?t:null,s=new n(i?r:t);if(i){s.AddVertexRange(e);for(let l of s.Vertices)s.AddEdgeRange(i(l))}else if(e.Vertices&&e.Edges)s.AddVertexRange(e.Vertices),s.AddEdgeRange(e.Edges);else{let l=Array.from(e);if(l.length&&Array.isArray(l[0])){if(l.length!==2||l[0].length!==l[1]?.length)throw new RangeError("Expected equally sized source and target columns.");s.AddVerticesAndEdgeRange(l[0].map((a,h)=>new he(a,l[1][h])))}else s.AddVerticesAndEdgeRange(l)}return s}function ai(n,e=!0,t=!0){return qt(Z,n,e,t)}function li(n,e=!0,t=!0){return n?.Vertices&&n?.Edges&&arguments.length===1?n.IsDirected?n instanceof ce||n instanceof st?n:new Rt(n):qt(ce,n):qt(ce,n,e,t)}function hi(n,e=!0,t=!0){return qt(ge,n,e,t)}function di(n){return new it(n)}function ui(n){return new st(n)}function ci(n){return new Lt(n)}function pi(n){return Vt.FromGraph(n)}function gi(n){return new Ue(n)}function mi(n,e){return new Ot(n,e)}function fi(n,e){if(n instanceof globalThis.Map){arguments.length>1&&d(e);let t=n;return new lt(()=>t.keys(),r=>t.has(r)?e?e({Key:r,Value:t.get(r)}):t.get(r):void 0)}return new lt(n,e)}function xi(n,e){return new Mt(n,e)}var yi=Object.freeze({ToAdjacencyGraph:ai,ToBidirectionalGraph:li,ToUndirectedGraph:hi,ToArrayAdjacencyGraph:di,ToArrayBidirectionalGraph:ui,ToArrayUndirectedGraph:ci,ToCompressedRowGraph:pi,ToDelegateIncidenceGraph:gi,ToDelegateBidirectionalIncidenceGraph:mi,ToDelegateVertexAndEdgeListGraph:fi,ToDelegateUndirectedGraph:xi});for(let[n,e]of Object.entries(yi))n.startsWith("ToDelegate")||Object.defineProperty(Ee.prototype,n,{value(...t){return e(this,...t)}});var ue=Object.freeze({NotRunning:0,Running:1,PendingAbortion:2,Finished:3,Aborted:4}),Ut=class extends Error{constructor(e="Algorithm aborted."){super(e),this.name="OperationCanceledException"}};function sr(n,e){if(typeof de[n]=="function")return new de[n](e);let t=new Error(e);return t.name=n,t}function gs(n,e){for(let t of e.split(" "))n[t]||(n[t]=new O)}var Te=class{constructor(){this.IsCancelling=!1,this.CancelRequested=new O,this.CancelReset=new O,this.Cancelling=this.CancelRequested}Cancel(){this.IsCancelling||(this.IsCancelling=!0,this.Cancelling.emit(this,{}))}ResetCancel(){let e=this.IsCancelling;this.IsCancelling=!1,e&&this.CancelReset.emit(this,{})}},or=class{constructor(e){this.Host=d(e,"host")}get CancelManager(){return this._cancelManager??=this.Host.GetService(Te)}},$t=class{constructor(e,t){arguments.length===1&&(t=e,e=null),this.VisitedGraph=d(t,"visitedGraph"),this.State=ue.NotRunning,this.SyncRoot={},this._services=new D,this.Services=new or(e??this),gs(this,"StateChanged Started Finished Aborted")}TryGetService(e){return d(e,"serviceType"),e===Te||e==="ICancelManager"||e==="CancelManager"?(this._services.has(Te)||this._services.set(Te,new Te),this._services.get(Te)):this._services.get(e)}GetService(e){let t=this.TryGetService(e);if(t===void 0)throw sr("InvalidOperationException","Service not found.");return t}Compute(){if(this.State===ue.Running||this.State===ue.PendingAbortion)throw sr("InvalidOperationException","Algorithm is already running.");this.State=ue.Running,this.Services.CancelManager.ResetCancel(),this.OnStarted({}),this.OnStateChanged({});try{this.Initialize(),this.ThrowIfCancellationRequested(),this.InternalCompute()}catch(e){if(!(e instanceof Ut))throw e}finally{try{this.Clean()}finally{this.State=this.State===ue.PendingAbortion?ue.Aborted:ue.Finished,this.State===ue.Aborted?this.OnAborted({}):this.OnFinished({}),this.Services.CancelManager.ResetCancel(),this.OnStateChanged({})}}return this}Abort(){this.State===ue.Running&&(this.State=ue.PendingAbortion,this.Services.CancelManager.Cancel(),this.OnStateChanged({}))}ThrowIfCancellationRequested(){if(this.Services.CancelManager.IsCancelling)throw new Ut}OnStateChanged(e={}){this.StateChanged.emit(this,e)}OnStarted(e={}){this.Started.emit(this,e)}OnFinished(e={}){this.Finished.emit(this,e)}OnAborted(e={}){this.Aborted.emit(this,e)}Initialize(){}InternalCompute(){throw sr("NotImplementedException","Override InternalCompute().")}Clean(){}};var Wt=(n,e)=>n<e?-1:n>e?1:0,Hs=Object.freeze({ShortestDistance:Object.freeze({InitialDistance:Number.MAX_VALUE,Compare:Wt,Combine:(n,e)=>n+e}),CriticalDistance:Object.freeze({InitialDistance:-Number.MAX_VALUE,Compare:(n,e)=>-Wt(n,e),Combine:(n,e)=>n+e}),EdgeShortestDistance:Object.freeze({InitialDistance:0,Compare:Wt,Combine:(n,e)=>n+e}),Prim:Object.freeze({InitialDistance:Number.MAX_VALUE,Compare:Wt,Combine:(n,e)=>e})});var Jt={};ei(Jt,{BinaryHeap:()=>Xt,BinaryQueue:()=>ar,EdgeEdgeDictionary:()=>ft,EdgeList:()=>Ce,FibonacciHeap:()=>Zt,FibonacciHeapCell:()=>Yt,FibonacciHeapLinkedList:()=>xt,FibonacciQueue:()=>hr,ForestDisjointSet:()=>lr,HeapConstants:()=>gt,HeapDirection:()=>ur,Queue:()=>Ve,SoftHeap:()=>dr,VertexEdgeDictionary:()=>mt,VertexList:()=>Ke});var Ht=(n,e)=>({Key:n,Value:e}),ur=Object.freeze({Increasing:0,Decreasing:1}),gt=Object.freeze({Consistent:"Is_Consistent",NotConsistent:"Is_NOT_Consistent"}),Kt=class extends Array{constructor(e=[]){if(super(),typeof e=="number"){if(e<0)throw new RangeError("Negative capacity.");this.Capacity=e}else{d(e);for(let t of e)this.push(t);this.Capacity=this.length}}static get[Symbol.species](){return Array}get Count(){return this.length}Add(e){this.push(e)}AddRange(e){for(let t of d(e))this.push(t)}Contains(e){return this.some(t=>T(t,e))}IndexOf(e){return this.findIndex(t=>T(t,e))}Remove(e){let t=this.IndexOf(e);return t<0?!1:(this.splice(t,1),!0)}RemoveAt(e){if(!Number.isInteger(e)||e<0||e>=this.length)throw new RangeError("Index out of range.");this.splice(e,1)}RemoveAll(e){d(e);let t=this.filter(i=>!e(i)),r=this.length-t.length;return this.length=0,this.AddRange(t),r}Clear(){this.length=0}ToArray(){return Array.from(this)}TrimExcess(){this.Capacity=this.length}Clone(){return new this.constructor(this)}},Ke=class extends Kt{},Ce=class extends Kt{},Qt=class extends D{constructor(e){if(typeof e=="number"){if(e<0)throw new RangeError("Negative capacity.");super()}else super(e)}get Count(){return this.size}get Keys(){return Array.from(this.keys())}get Values(){return Array.from(this.values())}Add(e,t){if(d(e),this.has(e))throw new TypeError("Duplicate key.");this.set(e,t)}ContainsKey(e){return this.has(d(e))}Remove(e){return this.delete(d(e))}TryGetValue(e){return this.get(d(e))}Clear(){this.clear()}Clone(){return new this.constructor(this)}},mt=class n extends Qt{Clone(){let e=new n;for(let[t,r]of this)e.set(t,typeof r.Clone=="function"?r.Clone():new Ce(r));return e}},ft=class extends Qt{},Ve=class{constructor(e=[]){if(typeof e=="number"){if(e<0)throw new RangeError("Negative capacity.");e=[]}this._a=Array.from(d(e)),this._head=0}get Count(){return this._a.length-this._head}Enqueue(e){this._a.push(e)}Dequeue(){if(!this.Count)throw new Y("Queue is empty.");let e=this._a[this._head];return this._a[this._head++]=void 0,this._head>=1024&&this._head*2>=this._a.length&&(this._a=this._a.slice(this._head),this._head=0),e}Peek(){if(!this.Count)throw new Y("Queue is empty.");return this._a[this._head]}Contains(e){for(let t=this._head;t<this._a.length;++t)if(T(e,this._a[t]))return!0;return!1}Clear(){this._a=[],this._head=0}ToArray(){return this._a.slice(this._head)}[Symbol.iterator](){return this.ToArray()[Symbol.iterator]()}},Xt=class{constructor(e=16,t=oe){if(typeof e=="function"&&(t=e,e=16),!Number.isInteger(e)||e<0)throw new RangeError("Negative capacity.");this.Capacity=e,this.PriorityComparison=d(t),this._items=[],this._version=0}get Count(){return this._items.length}_less(e,t){return this.PriorityComparison(this._items[e].Key,this._items[t].Key)<0}_swap(e,t){let r=this._items[e];this._items[e]=this._items[t],this._items[t]=r}_up(e){for(;e>0;){let t=e-1>>1;if(!this._less(e,t))break;this._swap(e,t),e=t}}_down(e){for(;;){let t=e*2+1,r=t+1,i=e;if(t<this.Count&&this._less(t,i)&&(i=t),r<this.Count&&this._less(r,i)&&(i=r),i===e)break;this._swap(e,i),e=i}}Add(e,t){d(e),this.Count>=this.Capacity&&(this.Capacity=this.Capacity*2+1),this._items.push(Ht(e,t)),++this._version,this._up(this.Count-1)}Minimum(){if(!this.Count)throw new Y("Heap is empty.");return{...this._items[0]}}RemoveMinimum(){let e=this.Minimum(),t=this._items.pop();return this.Count&&(this._items[0]=t,this._down(0)),++this._version,e}IndexOf(e){return this._items.findIndex(t=>T(t.Value,e))}Update(e,t){d(e);let r=this.IndexOf(t);if(r<0)return this.Add(e,t);let i=this._items[r].Key;this._items[r]=Ht(e,t),++this._version,this.PriorityComparison(e,i)>0?this._down(r):this._up(r)}MinimumUpdate(e,t){d(e);let r=this.IndexOf(t);return r>=0&&this.PriorityComparison(e,this._items[r].Key)>0?!1:(this.Update(e,t),!0)}ToArray(){return this._items.map(e=>e.Value)}ToPairsArray(){return this._items.map(e=>({...e}))}*[Symbol.iterator](){let e=this._version;for(let t=0;t<this.Count;++t){if(e!==this._version)throw new Y("Collection modified during enumeration.");yield{...this._items[t]}}if(e!==this._version)throw new Y("Collection modified during enumeration.")}IsConsistent(){for(let e=1;e<this.Count;++e)if(this.PriorityComparison(this._items[e-1>>1].Key,this._items[e].Key)>0)return!1;return!0}_entry(e){let t=this._items[e];return t?`${t.Key} ${t.Value==null?"null":t.Value}`:"null"}ToString2(){return`${this.IsConsistent()?gt.Consistent:gt.NotConsistent}: ${Array.from({length:this.Capacity},(e,t)=>this._entry(t)).join(", ")}`}ToStringTree(){let e=this.IsConsistent()?gt.Consistent:gt.NotConsistent;for(let t=0;t<this.Count;++t)e+=`
index${t} ${this._entry(t)} -> ${this._entry(2*t+1)} and ${this._entry(2*t+2)}`;return e}},ar=class{constructor(e,t=oe){this._distance=d(e),this._heap=new Xt(d(t))}get Count(){return this._heap.Count}Contains(e){return this._heap.IndexOf(e)>=0}Enqueue(e){this._heap.Add(this._distance(d(e)),e)}Dequeue(){return this._heap.RemoveMinimum().Value}Peek(){return this._heap.Minimum().Value}Update(e){this._heap.Update(this._distance(d(e)),e)}ToArray(){return this._heap.ToArray()}ToPairsArray(){return this._heap.ToPairsArray()}ToString2(){return this._heap.ToString2()}},lr=class{constructor(e=0){if(e<0)throw new RangeError("Negative capacity.");this._elements=new D,this.SetCount=0}get ElementCount(){return this._elements.size}Contains(e){return this._elements.has(d(e))}MakeSet(e){if(d(e),this._elements.has(e))throw new TypeError("Element already exists.");let t={Value:e,Rank:0};t.Parent=t,this._elements.set(e,t),++this.SetCount}_find(e){let t=this._elements.get(d(e));if(!t)throw new TypeError("Element is not in the disjoint set.");let r=t;for(;r.Parent!==r;)r=r.Parent;for(;t.Parent!==t;){let i=t.Parent;t.Parent=r,t=i}return r}FindSet(e){return this._find(e).Value}AreInSameSet(e,t){return this._find(e)===this._find(t)}Union(e,t){let r=this._find(e),i=this._find(t);return r===i?!1:(r.Rank<i.Rank?r.Parent=i:(i.Parent=r,r.Rank===i.Rank&&++r.Rank),--this.SetCount,!0)}},xt=class{constructor(){this.First=null,this._last=null}AddLast(e){e.Previous=this._last,e.Next=null,this._last?this._last.Next=e:this.First=e,this._last=e}Remove(e){e.Previous?e.Previous.Next=e.Next:this.First===e&&(this.First=e.Next),e.Next?e.Next.Previous=e.Previous:this._last===e&&(this._last=e.Previous),e.Previous=e.Next=null}MergeLists(e){e.First&&(this._last?this._last.Next=e.First:this.First=e.First,e.First.Previous=this._last,this._last=e._last,e.First=e._last=null)}*[Symbol.iterator](){let e=this.First;for(;e;)yield e,e=e.Next}},Yt=class{constructor(e,t){this.Priority=e,this.Value=t,this.Marked=!1,this.Degree=0,this.Removed=!1,this.Parent=null,this.Children=new xt,this.Previous=this.Next=null}ToKeyValuePair(){return Ht(this.Priority,this.Value)}},Zt=class{constructor(e=ur.Increasing,t=oe){if(e!==0&&e!==1)throw new RangeError("Invalid heap direction.");this.Direction=e,this.PriorityComparison=d(t),this._roots=new xt,this._top=null,this.Count=0,this._owner={parent:null}}get IsEmpty(){return this.Count===0}get Top(){return this._top}_compare(e,t){return this.PriorityComparison(e,t)*(this.Direction===0?1:-1)}_ownerRoot(e){for(;e.parent;)e=e.parent;return e}_check(e){if(d(e),e.Removed||!e._owner||this._ownerRoot(e._owner)!==this._ownerRoot(this._owner))throw new Y("Cell does not belong to this heap.")}Enqueue(e,t){d(e);let r=new Yt(e,t);return r._owner=this._owner,this._roots.AddLast(r),(!this._top||this._compare(e,this._top.Priority)<0)&&(this._top=r),++this.Count,r}_cut(e,t){t.Children.Remove(e),--t.Degree,e.Parent=null,e.Marked=!1,this._roots.AddLast(e)}_cascade(e){for(let t=e.Parent;t;t=e.Parent){if(!e.Marked){e.Marked=!0;break}this._cut(e,t),e=t}}ChangeKey(e,t){if(this._check(e),d(t),this._compare(t,e.Priority)>0){this.Delete(e),e.Priority=t,e.Removed=!1,e._owner=this._owner,this._roots.AddLast(e),++this.Count,(!this._top||this._compare(t,this._top.Priority)<0)&&(this._top=e);return}e.Priority=t;let i=e.Parent;i&&this._compare(e.Priority,i.Priority)<0&&(this._cut(e,i),this._cascade(i)),(!this._top||this._compare(e.Priority,this._top.Priority)<0)&&(this._top=e)}Delete(e){this._check(e);let t=e.Parent;t&&(this._cut(e,t),this._cascade(t)),this._top=e,this.Dequeue()}Dequeue(){let e=this._top;if(!e)throw new Y("Heap is empty.");for(let t of Array.from(e.Children))e.Children.Remove(t),t.Parent=null,t.Marked=!1,this._roots.AddLast(t);return this._roots.Remove(e),e.Removed=!0,e.Parent=null,e.Degree=0,--this.Count,this._top=null,this.Count&&this._consolidate(),e.ToKeyValuePair()}_consolidate(){let e=[];for(let t of Array.from(this._roots)){if(t.Parent)continue;let r=t;for(;e[r.Degree];){let i=e[r.Degree];e[r.Degree]=void 0,this._compare(i.Priority,r.Priority)<0&&([r,i]=[i,r]),this._roots.Remove(i),i.Parent=r,i.Marked=!1,r.Children.AddLast(i),++r.Degree}e[r.Degree]=r}for(let t of this._roots)(!this._top||this._compare(t.Priority,this._top.Priority)<0)&&(this._top=t)}Merge(e){if(d(e),e===this)throw new TypeError("Cannot merge a heap with itself.");if(e.Direction!==this.Direction||e.PriorityComparison!==this.PriorityComparison)throw new TypeError("Heaps must use identical ordering.");e.Count&&((!this._top||this._compare(e._top.Priority,this._top.Priority)<0)&&(this._top=e._top),this._roots.MergeLists(e._roots),this.Count+=e.Count,this._ownerRoot(e._owner).parent=this._ownerRoot(this._owner),e.Count=0,e._top=null,e._owner={parent:null})}*[Symbol.iterator](){let e=Array.from(this._roots).reverse();for(;e.length;){let t=e.pop();yield t.ToKeyValuePair();let r=Array.from(t.Children);for(let i=r.length-1;i>=0;--i)e.push(r[i])}}*GetDestructiveEnumerator(){for(;this.Count;)yield this.Dequeue()}DrawHeap(){let e=[],t=0,r=Array.from(this._roots,i=>({c:i,level:0})).reverse();for(;r.length;){let{c:i,level:s}=r.pop(),l=`${i.Priority}${i.Marked?"*":""} `;e[s]=(e[s]??"").padEnd(t," ")+l;let a=Array.from(i.Children);if(a.length)for(let h=a.length-1;h>=0;--h)r.push({c:a[h],level:s+1});else t+=l.length}return e.join(`
`)}},hr=class{constructor(...e){let t,r=oe;if(typeof e[0]=="number"){if(e[0]<0)throw new RangeError("Negative capacity.");t=e[2],r=e.length>3?e[3]:oe}else if(e[0]instanceof globalThis.Map){let i=e[0];t=s=>{if(!i.has(s))throw new TypeError("Key not found.");return i.get(s)},r=e.length>1?e[1]:oe}else t=e[0],r=e.length>1?e[1]:oe;this._distance=d(t),this._heap=new Zt(ur.Increasing,d(r)),this._cells=new D}get Count(){return this._heap.Count}Contains(e){return this._cells.has(e)&&!this._cells.get(e).Removed}Enqueue(e){d(e),this._cells.set(e,this._heap.Enqueue(this._distance(e),e))}Dequeue(){return this._heap.Dequeue().Value}Peek(){if(!this.Count)throw new Y("Queue is empty.");return this._heap.Top.Value}Update(e){d(e);let t=this._cells.get(e);if(t&&!t.Removed)this._heap.ChangeKey(t,this._distance(e));else throw new Y("Vertex has not been enqueued or was removed.")}ToArray(){return Array.from(this._heap,e=>e.Value)}},dr=class{constructor(e,t,r=oe){if(this.KeyMaxValue=d(t),!(e>0&&e<=.5))throw new RangeError("Error rate must be in (0, 0.5].");this.KeyComparison=d(r),this.ErrorRate=e,this.MinRank=2+2*Math.ceil(Math.log2(1/e)),this.Count=0,this._header={},this._tail={Rank:1/0,Prev:this._header},this._header.Next=this._tail}Add(e,t){if(d(e),this.KeyComparison(e,this.KeyMaxValue)>=0)throw new RangeError("Key must be below the maximum sentinel.");let r={Key:e,Value:t,Next:null};this._meld({CKey:e,Rank:0,Next:null,Child:null,IL:r,ILTail:r}),++this.Count}_meld(e){let t=this._header.Next;for(;e.Rank>t.Rank;)t=t.Next;let r=t.Prev;for(;e.Rank===t.Rank;){let s,l;this.KeyComparison(t.Queue.CKey,e.CKey)>0?(s=e,l=t.Queue):(s=t.Queue,l=e),e={CKey:s.CKey,Rank:s.Rank+1,Next:s,Child:l,IL:s.IL,ILTail:s.ILTail},t=t.Next}let i=r===t.Prev?{}:r.Next;Object.assign(i,{Queue:e,Rank:e.Rank,Prev:r,Next:t}),r.Next=i,t.Prev=i,this._fixMin(i)}_fixMin(e){if(e===this._header)return;let t=e.Next===this._tail?e:e.Next.SuffixMin;for(;e!==this._header;)this.KeyComparison(t.Queue.CKey,e.Queue.CKey)>0&&(t=e),e.SuffixMin=t,e=e.Prev}_shift(e){return e.IL=e.ILTail=null,!e.Next&&!e.Child?(e.CKey=this.KeyMaxValue,e):(e.Next=this._shift(e.Next),this.KeyComparison(e.Next.CKey,e.Child.CKey)>0&&([e.Child,e.Next]=[e.Next,e.Child]),e.IL=e.Next.IL,e.ILTail=e.Next.ILTail,e.CKey=e.Next.CKey,e.Rank>this.MinRank&&(e.Rank%2===1||e.Child.Rank<e.Rank-1)&&(e.Next=this._shift(e.Next),this.KeyComparison(e.Next.CKey,e.Child.CKey)>0&&([e.Child,e.Next]=[e.Next,e.Child]),this.KeyComparison(e.Next.CKey,this.KeyMaxValue)!==0&&e.Next.IL&&(e.Next.ILTail.Next=e.IL,e.IL=e.Next.IL,e.ILTail||(e.ILTail=e.Next.ILTail),e.CKey=e.Next.CKey)),this.KeyComparison(e.Child.CKey,this.KeyMaxValue)===0&&(this.KeyComparison(e.Next.CKey,this.KeyMaxValue)===0?e.Child=e.Next=null:(e.Child=e.Next.Child,e.Next=e.Next.Next)),e)}RemoveMinimum(){if(!this.Count)throw new Y("Heap is empty.");let e=this._header.Next.SuffixMin;for(;!e.Queue.IL;){let r=e.Queue,i=0;for(;r.Next;)r=r.Next,++i;if(i<Math.trunc(e.Rank/2))for(e.Prev.Next=e.Next,e.Next.Prev=e.Prev,this._fixMin(e.Prev),r=e.Queue;r.Next;)this._meld(r.Child),r=r.Next;else e.Queue=this._shift(e.Queue),this.KeyComparison(e.Queue.CKey,this.KeyMaxValue)===0&&(e.Prev.Next=e.Next,e.Next.Prev=e.Prev,e=e.Prev),this._fixMin(e);e=this._header.Next.SuffixMin}let t=e.Queue.IL;return e.Queue.IL=t.Next,e.Queue.IL||(e.Queue.ILTail=null),--this.Count,Ht(t.Key,t.Value)}*[Symbol.iterator](){}};var P=(n,e="value")=>{if(n==null)throw new TypeError(`${e} cannot be null`);return n},wr=(n,e="value")=>{if(P(n,e),String(n).length===0)throw new TypeError(`${e} cannot be empty`);return n},_e=(n,e)=>n?.Equals?n.Equals(e):n===e,eo=Object.freeze({None:"none",Left:"left",Right:"right"}),to=Object.freeze({Close:"close",Open:"open"}),no=Object.freeze({Box:"box",Crow:"crow",Diamond:"diamond",Dot:"dot",Inv:"inv",None:"none",Normal:"normal",Tee:"tee",Vee:"vee",Curve:"curve",ICurve:"icurve"}),bi=Object.freeze({Local:"local",Global:"global",None:"none"}),wi=Object.freeze({None:"none",Forward:"forward",Back:"back",Both:"both"}),Ei=Object.freeze({Unspecified:"unspecified",Invis:"invis",Dashed:"dashed",Dotted:"dotted",Bold:"bold",Solid:"solid"}),Gi=Object.freeze({Cmap:"cmap",Fig:"fig",Gd:"gd",Gd2:"gd2",Gif:"gif",Hpgl:"hpgl",Imap:"imap",Jpeg:"jpeg",Mif:"mif",Mp:"mp",Pcl:"pcl",Pic:"pic",PlainText:"plaintext",Png:"png",Ps:"ps",Ps2:"ps2",Svg:"svg",Svgz:"svgz",Vrml:"vrml",Vtx:"vtx",Wbmp:"wbmp"}),Si=Object.freeze({L:"l",R:"r",C:"c"}),Ti=Object.freeze({T:"t",B:"b"}),Ci=Object.freeze({BreadthFirst:"breadthfirst",NodesFirst:"nodesfirst",EdgesFirst:"edgesfirst"}),_i=Object.freeze({BL:"BL",BR:"BR",TL:"TL",TR:"TR",RB:"RB",RT:"RT",LB:"LB",LT:"LT"}),Ii=Object.freeze({LR:"LR",TB:"TB"}),ki=Object.freeze({Fill:"fill",Compress:"compress",Auto:"auto"}),Fi=Object.freeze({Spline:"spline",None:"none",Line:"line",Polyline:"polyline",Curved:"curved",Ortho:"ortho"}),yt=Object.freeze({Unspecified:"unspecified",Box:"box",Polygon:"polygon",Ellipse:"ellipse",Circle:"circle",Point:"point",Egg:"egg",Triangle:"triangle",Plaintext:"plaintext",Diamond:"diamond",Trapezium:"trapezium",Parallelogram:"parallelogram",House:"house",Pentagon:"pentagon",Hexagon:"hexagon",Septagon:"septagon",Octagon:"octagon",DoubleCircle:"doublecircle",DoubleOctagon:"doubleoctagon",TripleOctagon:"tripleoctagon",InvTriangle:"invtriangle",InvTrapezium:"invtrapezium",InvHouse:"invhouse",MDiamond:"mdiamond",MSquare:"msquare",MCircle:"mcircle",Rect:"rect",Rectangle:"rectangle",Record:"record"}),Ai=Object.freeze({Unspecified:"unspecified",Filled:"filled",Diagonals:"diagonals",Rounded:"rounded",Invis:"invis",Dashed:"dashed",Dotted:"dotted",Bold:"bold",Solid:"solid"}),Qe=Object.freeze({Escape(n){return String(P(n)).replace(/\r\n|\r|\n|["\\]/g,e=>/[\r\n]/.test(e)?"\\n":"\\"+e)},EscapeRecord(n){return String(P(n)).replace(/\r\n|\r|\n|[|<>" \\{}]/g,e=>/[\r\n]/.test(e)?"\\n":"\\"+e)},EscapePort(n){return String(P(n)).replace(/\r\n|\r|\n|[|<>" \\{}]/g,"_")}}),Oe=class{constructor(e){this.String=P(e)}toString(){return this.String}},en=class{constructor(e){this.value=e}},Ie=n=>new en(n),bt=n=>`"${Qe.Escape(n)}"`,Di=n=>n instanceof en?String(n.value):n instanceof Oe?`<${n.String}>`:n instanceof rn?`"${n.ToDot()}"`:n instanceof o?bt(n.ToDot()):typeof n=="string"?bt(n):String(n).toLowerCase(),ie=(n,e,t)=>n instanceof globalThis.Map?n.set(e,t):P(n)[e]=t,ms=(n,e=", ")=>[...n instanceof globalThis.Map?n:Object.entries(n)].map(([t,r])=>`${t}=${Di(r)}`).join(e),o=class n{constructor(e=0,t=0,r=0,i=0){for(let s of[e,t,r,i])if(!Number.isInteger(s)||s<0||s>255)throw new RangeError("Color channels must be bytes");this.A=e,this.R=t,this.G=r,this.B=i,Object.freeze(this)}Equals(e){return e instanceof n&&this.A===e.A&&this.R===e.R&&this.G===e.G&&this.B===e.B}GetHashCode(){return this.A<<24|this.R<<16|this.G<<8|this.B}ToDot(){return"#"+[this.R,this.G,this.B,this.A].map(e=>e.toString(16).padStart(2,"0").toUpperCase()).join("")}toString(){return this.ToDot()}};o.AliceBlue=new o(255,240,248,255);o.AntiqueWhite=new o(255,250,235,215);o.Aqua=new o(255,0,255,255);o.Aquamarine=new o(255,127,255,212);o.Azure=new o(255,240,255,255);o.Beige=new o(255,245,245,220);o.Bisque=new o(255,255,228,196);o.Black=new o(255,0,0,0);o.BlanchedAlmond=new o(255,255,235,205);o.Blue=new o(255,0,0,255);o.BlueViolet=new o(255,138,43,226);o.Brown=new o(255,165,42,42);o.BurlyWood=new o(255,222,184,135);o.CadetBlue=new o(255,95,158,160);o.Chartreuse=new o(255,127,255,0);o.Chocolate=new o(255,210,105,30);o.Coral=new o(255,255,127,80);o.CornflowerBlue=new o(255,100,149,237);o.Cornsilk=new o(255,255,248,220);o.Crimson=new o(255,220,20,60);o.Cyan=new o(255,0,255,255);o.DarkBlue=new o(255,0,0,139);o.DarkCyan=new o(255,0,139,139);o.DarkGoldenrod=new o(255,184,134,11);o.DarkGray=new o(255,169,169,169);o.DarkGreen=new o(255,0,100,0);o.DarkKhaki=new o(255,189,183,107);o.DarkMagenta=new o(255,139,0,139);o.DarkOliveGreen=new o(255,85,107,47);o.DarkOrange=new o(255,255,140,0);o.DarkOrchid=new o(255,153,50,204);o.DarkRed=new o(255,139,0,0);o.DarkSalmon=new o(255,233,150,122);o.DarkSeaGreen=new o(255,143,188,139);o.DarkSlateBlue=new o(255,72,61,139);o.DarkSlateGray=new o(255,47,79,79);o.DarkTurquoise=new o(255,0,206,209);o.DarkViolet=new o(255,148,0,211);o.DeepPink=new o(255,255,20,147);o.DeepSkyBlue=new o(255,0,191,255);o.DimGray=new o(255,105,105,105);o.DodgerBlue=new o(255,30,144,255);o.Firebrick=new o(255,178,34,34);o.FloralWhite=new o(255,255,250,240);o.ForestGreen=new o(255,34,139,34);o.Fuchsia=new o(255,255,0,255);o.Gainsboro=new o(255,220,220,220);o.GhostWhite=new o(255,248,248,255);o.Gold=new o(255,255,215,0);o.Goldenrod=new o(255,218,165,32);o.Gray=new o(255,128,128,128);o.Green=new o(255,0,128,0);o.GreenYellow=new o(255,173,255,47);o.Honeydew=new o(255,240,255,240);o.HotPink=new o(255,255,105,180);o.IndianRed=new o(255,205,92,92);o.Indigo=new o(255,75,0,130);o.Ivory=new o(255,255,255,240);o.Khaki=new o(255,240,230,140);o.Lavender=new o(255,230,230,250);o.LavenderBlush=new o(255,255,240,245);o.LawnGreen=new o(255,124,252,0);o.LemonChiffon=new o(255,255,250,205);o.LightBlue=new o(255,173,216,230);o.LightCoral=new o(255,240,128,128);o.LightCyan=new o(255,224,255,255);o.LightGoldenrodYellow=new o(255,250,250,210);o.LightGray=new o(255,211,211,211);o.LightGreen=new o(255,144,238,144);o.LightPink=new o(255,255,182,193);o.LightSalmon=new o(255,255,160,122);o.LightSeaGreen=new o(255,32,178,170);o.LightSkyBlue=new o(255,135,206,250);o.LightSlateGray=new o(255,119,136,153);o.LightSteelBlue=new o(255,176,196,222);o.LightYellow=new o(255,255,255,224);o.Lime=new o(255,0,255,0);o.LimeGreen=new o(255,50,205,50);o.Linen=new o(255,250,240,230);o.Magenta=new o(255,255,0,255);o.Maroon=new o(255,128,0,0);o.MediumAquamarine=new o(255,102,205,170);o.MediumBlue=new o(255,0,0,205);o.MediumOrchid=new o(255,186,85,211);o.MediumPurple=new o(255,147,112,219);o.MediumSeaGreen=new o(255,60,179,113);o.MediumSlateBlue=new o(255,123,104,238);o.MediumSpringGreen=new o(255,0,250,154);o.MediumTurquoise=new o(255,72,209,204);o.MediumVioletRed=new o(255,199,21,133);o.MidnightBlue=new o(255,25,25,112);o.MintCream=new o(255,245,255,250);o.MistyRose=new o(255,255,228,225);o.Moccasin=new o(255,255,228,225);o.NavajoWhite=new o(255,255,222,173);o.Navy=new o(255,0,0,128);o.OldLace=new o(255,253,245,230);o.Olive=new o(255,128,128,0);o.OliveDrab=new o(255,107,142,35);o.Orange=new o(255,255,165,0);o.OrangeRed=new o(255,255,69,0);o.Orchid=new o(255,218,112,214);o.PaleGoldenrod=new o(255,238,232,170);o.PaleGreen=new o(255,152,251,152);o.PaleTurquoise=new o(255,175,238,238);o.PaleVioletRed=new o(255,219,112,147);o.PapayaWhip=new o(255,255,239,213);o.PeachPuff=new o(255,255,218,185);o.Peru=new o(255,205,133,63);o.Pink=new o(255,255,192,203);o.Plum=new o(255,221,160,221);o.PowderBlue=new o(255,176,224,230);o.Purple=new o(255,128,0,128);o.Red=new o(255,255,0,0);o.RosyBrown=new o(255,188,143,143);o.RoyalBlue=new o(255,65,105,225);o.SaddleBrown=new o(255,139,69,19);o.Salmon=new o(255,250,128,114);o.SandyBrown=new o(255,244,164,96);o.SeaGreen=new o(255,46,139,87);o.SeaShell=new o(255,255,245,238);o.Sienna=new o(255,160,82,45);o.Silver=new o(255,192,192,192);o.SkyBlue=new o(255,135,206,235);o.SlateBlue=new o(255,106,90,205);o.SlateGray=new o(255,112,128,144);o.Snow=new o(255,255,250,250);o.SpringGreen=new o(255,0,255,127);o.SteelBlue=new o(255,70,130,180);o.Tan=new o(255,210,180,140);o.Teal=new o(255,0,128,128);o.Thistle=new o(255,216,191,216);o.Tomato=new o(255,255,99,71);o.Transparent=new o(0,255,255,255);o.Turquoise=new o(255,64,224,208);o.Violet=new o(255,238,130,238);o.Wheat=new o(255,245,222,179);o.White=new o(255,255,255,255);o.WhiteSmoke=new o(255,245,245,245);o.Yellow=new o(255,255,255,0);o.YellowGreen=new o(255,154,205,50);var cr=class{constructor(e,t){if(this.Name=wr(e,"name"),!(t>0))throw new RangeError("Size must be positive");this.SizeInPoints=t}},pr=class{constructor(e,t){this.X=e,this.Y=t}},ae=class{constructor(e=0,t=0){if(!(e>=0&&t>=0))throw new RangeError("Width and height must be nonnegative");this.Width=e,this.Height=t}get IsEmpty(){return this.Width===0||this.Height===0}ToString(){return`${this.Width}x${this.Height}`}toString(){return this.ToString()}},ke=class extends ae{},tn=class extends Array{static get[Symbol.species](){return Array}constructor(e=[]){super(),this.push(...P(e))}get Count(){return this.length}Add(e){this.push(P(e))}AddRange(e){for(let t of e)this.Add(t)}Clear(){this.length=0}Contains(e){return this.includes(e)}Remove(e){let t=this.indexOf(e);return t<0?!1:(this.splice(t,1),!0)}Insert(e,t){this.splice(e,0,P(t))}RemoveAt(e){if(e<0||e>=this.length)throw new RangeError("Index out of range");this.splice(e,1)}};var nn=class extends tn{constructor(e=[]){super(e),this.Separators=":"}get Separators(){return this._separators}set Separators(e){this._separators=wr(e,"Separators")}ToDot(){return this.length?`layers=${bt(this.map(e=>e.Name).join(this.Separators))}; layersep=${bt(this.Separators)}`:""}},gr=class extends tn{},rn=class{constructor(){this.Cells=new gr}get Cells(){return this._cells}set Cells(e){this._cells=P(e,"Cells")}ToDot(){return Array.from(this.Cells,e=>e.ToDot()).join(" | ")}ToString(){return this.ToDot()}toString(){return this.ToDot()}};var wt=class{GenerateDot(e){return ms(P(e))}ToString(){return this.ToDot()}toString(){return this.ToDot()}},sn=class extends wt{constructor(){super(),this.Position=null,this.Comment=null,this.IsHtmlLabel=!1,this.Label=null,this.ToolTip=null,this.Url=null,this.Distortion=0,this.FillColor=o.White,this.Font=null,this.FontColor=o.Black,this.PenWidth=1,this.Group=null,this.Layer=null,this.Orientation=0,this.Peripheries=-1,this.Regular=!1,this.Record=new rn,this.Shape=yt.Unspecified,this.Sides=4,this.Size=new ae,this.FixedSize=!1,this.Skew=0,this.StrokeColor=o.Black,this.Style=Ai.Unspecified,this.Z=-1}InternalToDot(e=null){let t=new D;this.Font&&(t.set("fontname",this.Font.Name),t.set("fontsize",this.Font.SizeInPoints)),_e(this.FontColor,o.Black)||t.set("fontcolor",this.FontColor),this.PenWidth!==1&&t.set("penwidth",this.PenWidth);for(let[i,s]of[["ToolTip","tooltip"],["Comment","comment"],["Url","URL"]])this[i]!=null&&t.set(s,this[i]);this.Shape!==yt.Unspecified&&t.set("shape",Ie(this.Shape));let r=this.Shape===yt.Unspecified&&e?e.Shape:this.Shape;if(r===yt.Record?this.Label?t.set("label",Ie(`"${this.Label}"`)):this.Record?.Cells.length&&t.set("label",this.Record):this.Label&&t.set("label",this.IsHtmlLabel?new Oe(this.Label):this.Label),r===yt.Polygon)for(let[i,s]of[["Sides","sides"],["Skew","skew"],["Distortion","distortion"]])this[i]!==0&&t.set(s,this[i]);return this.FixedSize&&(t.set("fixedsize",!0),this.Size.Height>0&&t.set("height",this.Size.Height),this.Size.Width>0&&t.set("width",this.Size.Width)),this.Style!==Ai.Unspecified&&t.set("style",Ie(this.Style)),_e(this.StrokeColor,o.Black)||t.set("color",this.StrokeColor),_e(this.FillColor,o.White)||t.set("fillcolor",this.FillColor),this.Orientation>0&&t.set("orientation",this.Orientation),this.Regular&&t.set("regular",!0),this.Group!=null&&t.set("group",this.Group),this.Layer&&t.set("layer",this.Layer.Name),this.Peripheries>=0&&t.set("peripheries",this.Peripheries),this.Z>0&&t.set("z",this.Z),this.Position&&t.set("pos",`${this.Position.X},${this.Position.Y}!`),this.GenerateDot(t)}ToDot(){return this.InternalToDot()}},mr=class{constructor(){this.Angle=-25,this.Distance=1,this.Float=!0,this.Font=null,this.FontColor=o.Black,this.IsHtmlLabel=!1,this.Value=null}AddParameters(e,t=!0){P(e),this.Value!=null&&(ie(e,"label",this.IsHtmlLabel?new Oe(this.Value):t?Qe.Escape(this.Value):this.Value),this.Angle!==-25&&ie(e,"labelangle",this.Angle),this.Distance!==1&&ie(e,"labeldistance",this.Distance),this.Float||ie(e,"labelfloat",!1),this.Font&&(ie(e,"labelfontname",this.Font.Name),ie(e,"labelfontsize",this.Font.SizeInPoints)),_e(this.FontColor,o.Black)||ie(e,"labelfontcolor",this.FontColor))}},on=class{constructor(e){this.IsHead=!!e,this.IsClipped=!0,this.IsHtmlLabel=!1,this.Label=null,this.ToolTip=null,this.Url=null,this.Logical=null,this.Same=null}AddParameters(e,t=!0){P(e);let r=this.IsHead?"head":"tail";this.Url!=null&&ie(e,r+"URL",this.Url),this.IsClipped||ie(e,r+"clip",!1),this.Label!=null&&ie(e,r+"label",this.IsHtmlLabel?new Oe(this.Label):t?Qe.Escape(this.Label):this.Label),this.ToolTip!=null&&ie(e,r+"tooltip",t?Qe.Escape(this.ToolTip):this.ToolTip),this.Logical!=null&&ie(e,"l"+r,this.Logical),this.Same!=null&&ie(e,"same"+r,this.Same)}},an=class extends wt{constructor(){super(),this.Comment=null,this.Label=new mr,this.ToolTip=null,this.Url=null,this.Direction=wi.Forward,this.Font=null,this.FontColor=o.Black,this.PenWidth=1,this.Head=new on(!0),this.HeadArrow=null,this.HeadPort=null,this.Tail=new on(!1),this.TailArrow=null,this.TailPort=null,this.IsConstrained=!0,this.IsDecorated=!1,this.Layer=null,this.StrokeColor=o.Black,this.Style=Ei.Unspecified,this.Weight=1,this.Length=1,this.MinLength=1}get Label(){return this._label}set Label(e){this._label=P(e,"Label")}get Head(){return this._head}set Head(e){if(!P(e,"Head").IsHead)throw new TypeError("Head must be a head extremity");this._head=e}get Tail(){return this._tail}set Tail(e){if(P(e,"Tail").IsHead)throw new TypeError("Tail must be a tail extremity");this._tail=e}ToDot(){let e=new D;this.Direction!==wi.Forward&&e.set("dir",Ie(this.Direction)),this.Font&&(e.set("fontname",this.Font.Name),e.set("fontsize",this.Font.SizeInPoints)),_e(this.FontColor,o.Black)||e.set("fontcolor",this.FontColor),this.PenWidth!==1&&e.set("penwidth",this.PenWidth),this.Head.AddParameters(e,!1),this.HeadArrow&&e.set("arrowhead",this.HeadArrow.ToDot()),this.HeadPort!=null&&e.set("headport",Qe.EscapePort(this.HeadPort)),this.IsConstrained||e.set("constraint",!1),this.IsDecorated&&e.set("decorate",!0),this.Label.AddParameters(e,!1),this.Layer&&e.set("layer",this.Layer.Name),this.MinLength!==1&&e.set("minlen",this.MinLength),this.Length!==1&&e.set("len",this.Length),_e(this.StrokeColor,o.Black)||e.set("color",this.StrokeColor),this.Style!==Ei.Unspecified&&e.set("style",Ie(this.Style)),this.Tail.AddParameters(e,!1),this.TailArrow&&e.set("arrowtail",this.TailArrow.ToDot()),this.TailPort!=null&&e.set("tailport",Qe.EscapePort(this.TailPort));for(let[t,r]of[["ToolTip","tooltip"],["Comment","comment"],["Url","URL"]])this[t]!=null&&e.set(r,this[t]);return this.Weight!==1&&e.set("weight",this.Weight),this.GenerateDot(e)}},ln=class extends wt{constructor(){super(),this.Name="G",this.Comment=null,this.Url=null,this.BackgroundColor=o.White,this.ClusterRank=bi.Local,this.Font=null,this.FontColor=o.Black,this.PenWidth=1,this.IsCentered=!1,this.IsCompounded=!1,this.IsConcentrated=!1,this.IsLandscape=!1,this.IsNormalized=!1,this.IsReMinCross=!1,this.IsHtmlLabel=!1,this.Label=null,this.LabelJustification=Si.C,this.LabelLocation=Ti.B,this.Layers=new nn,this.McLimit=1,this.NodeSeparation=.25,this.RankDirection=Ii.TB,this.RankSeparation=.5,this.NsLimit=-1,this.NsLimit1=-1,this.OutputOrder=Ci.BreadthFirst,this.PageDirection=_i.BL,this.PageSize=new ae,this.Quantum=0,this.Ratio=ki.Auto,this.Resolution=.96,this.Rotate=0,this.SamplePoints=8,this.SearchSize=30,this.Size=new ae,this.Splines=Fi.Spline,this.StyleSheet=null}get Name(){return this._name}set Name(e){this._name=P(e,"Name")}GenerateDot(e){let t=[...e instanceof globalThis.Map?e:Object.entries(e)].map(([r,i])=>i instanceof nn?i.ToDot():`${r}=${Di(i)}`);return t.join("; ")+(t.length>1?";":"")}ToDot(){let e=new D;this.Url!=null&&e.set("URL",this.Url),_e(this.BackgroundColor,o.White)||e.set("bgcolor",this.BackgroundColor),this.IsCentered&&e.set("center",!0),this.ClusterRank!==bi.Local&&e.set("clusterrank",this.ClusterRank),this.Comment!=null&&e.set("comment",this.Comment),this.IsCompounded&&e.set("compound",!0),this.IsConcentrated&&e.set("concentrate",!0),this.Font&&(e.set("fontname",this.Font.Name),e.set("fontsize",this.Font.SizeInPoints)),_e(this.FontColor,o.Black)||e.set("fontcolor",this.FontColor),this.PenWidth!==1&&e.set("penwidth",this.PenWidth),this.Label!=null&&e.set("label",this.IsHtmlLabel?new Oe(this.Label):this.Label),this.LabelJustification!==Si.C&&e.set("labeljust",this.LabelJustification),this.LabelLocation!==Ti.B&&e.set("labelloc",this.LabelLocation),this.Layers.length&&e.set("layers",this.Layers);for(let[t,r,i]of[["McLimit","mclimit",1],["NodeSeparation","nodesep",.25]])this[t]!==i&&e.set(r,this[t]);return this.RankDirection!==Ii.TB&&e.set("rankdir",Ie(this.RankDirection)),this.RankSeparation!==.5&&e.set("ranksep",this.RankSeparation),this.IsNormalized&&e.set("normalize",!0),this.NsLimit>0&&e.set("nslimit",this.NsLimit),this.NsLimit1>0&&e.set("nslimit1",this.NsLimit1),this.OutputOrder!==Ci.BreadthFirst&&e.set("outputorder",this.OutputOrder),this.PageSize.IsEmpty||e.set("page",`${this.PageSize.Width},${this.PageSize.Height}`),this.PageDirection!==_i.BL&&e.set("pagedir",Ie(this.PageDirection)),this.Quantum>0&&e.set("quantum",this.Quantum),this.Ratio!==ki.Auto&&e.set("ratio",this.Ratio),this.IsReMinCross&&e.set("remincross",!0),this.Resolution!==.96&&e.set("resolution",this.Resolution),this.Rotate?e.set("rotate",this.Rotate):this.IsLandscape&&e.set("orientation","[1L]*"),this.SamplePoints!==8&&e.set("samplepoints",this.SamplePoints),this.SearchSize!==30&&e.set("searchsize",this.SearchSize),this.Size.IsEmpty||e.set("size",`${this.Size.Width},${this.Size.Height}`),this.Splines!==Fi.Spline&&e.set("splines",Ie(this.Splines)),this.StyleSheet!=null&&e.set("stylesheet",this.StyleSheet),this.GenerateDot(e)}},fr=class{constructor(e,t){this.Vertex=P(e,"vertex"),this.VertexFormat=P(t,"vertexFormat")}},xr=class{constructor(e,t){this.Edge=P(e,"edge"),this.EdgeFormat=P(t,"edgeFormat")}},yr=class{constructor(e,t){this.Cluster=P(e,"cluster"),this.GraphFormat=P(t,"graphFormat")}},br=class{constructor(e,t=Gi.Png){this.VisitedGraph=e,this.ImageType=t,this.GraphFormat=new ln,this.CommonVertexFormat=new sn,this.CommonEdgeFormat=new an,this.FormatVertex=new O,this.FormatEdge=new O,this.FormatCluster=new O,this.Output=null,this.ClusterCount=0}get VisitedGraph(){return this._graph}set VisitedGraph(e){this._graph=P(e,"graph")}Generate(e,t){if(arguments.length&&e==null)throw new TypeError("engine cannot be null");e&&wr(t,"outputFilePath"),this.ClusterCount=0;let r=new D(Array.from(this.VisitedGraph.Vertices,(E,S)=>[E,S])),i=new R(r.keys()),s=new R(this.VisitedGraph.Edges),l=String(this.GraphFormat.Name),a=[`${this.VisitedGraph.IsDirected?"digraph":"graph"} ${/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(l)?l:bt(l)} {`],h=this.GraphFormat.ToDot(),c=this.CommonVertexFormat.ToDot(),p=this.CommonEdgeFormat.ToDot();h&&a.push(h),c&&a.push(`node [${c}];`),p&&a.push(`edge [${p}];`);let u=E=>{let S=new sn;this.FormatVertex.emit(this,new fr(E,S));let x=S.InternalToDot(this.CommonVertexFormat);a.push(`${r.get(E)}${x?` [${x}]`:""};`),i.delete(E)},g=E=>{if(!r.has(E.Source)||!r.has(E.Target))throw new Error("Edge references vertex outside graph");let S=new an;this.FormatEdge.emit(this,new xr(E,S));let x=S.ToDot();a.push(`${r.get(E.Source)} ${this.VisitedGraph.IsDirected?"->":"--"} ${r.get(E.Target)}${x?` [${x}]`:""};`),s.delete(E)},b=E=>{for(let S of E.Clusters??[]){a.push(`subgraph cluster${++this.ClusterCount} {`);let x=new ln;this.FormatCluster.emit(this,new yr(S,x));let k=x.ToDot();if(k&&a.push(k),b(S),E.Collapsed){for(let f of S.Vertices)i.delete(f);for(let f of S.Edges)s.delete(f)}else{for(let f of S.Vertices)i.has(f)&&u(f);for(let f of S.Edges)s.has(f)&&g(f)}a.push("}")}};b(this.VisitedGraph);for(let E of i)u(E);for(let E of s)g(E);return a.push("}"),this.Output=a.join(`
`),e?e.Run(this.ImageType,this.Output,t):this.Output}};function Pi(n,e){if(arguments.length>1&&e===null)throw new TypeError("initAlgorithm cannot be null");let t=new br(n);return e&&e(t),t.Generate()}var fs="https://rise4fun.com/rest/ask/Agl/";function xs(n,e,t){P(n,"graphOrDot"),P(e,"SVG rendering engine");let r=typeof n=="string"?n:Pi(n,t),i;if(typeof e=="function")i=e(r);else if(typeof e.renderString=="function")i=e.renderString(r,{format:"svg"});else if(typeof e.Run=="function")i=e.Run(Gi.Svg,r,"graph.svg");else throw new TypeError("SVG engine must expose renderString, Run or be a callback");return i?.then?i.then(s=>s??""):i??""}var ro=Object.freeze({ToGraphviz:Pi,ToSvg:xs,DotToSvgApiEndpoint:fs});var io=Object.freeze({ParseSize(n){P(n,"svg");let e=String(n).match(/<svg\b[^>]*>/i)?.[0]??"",t=e.match(/\bwidth\s*=\s*["'](\d+(?:\.\d+)?)\s*(?:px)?["']/i),r=e.match(/\bheight\s*=\s*["'](\d+(?:\.\d+)?)\s*(?:px)?["']/i);return t&&r?new ke(+t[1],+r[1]):new ke(400,400)},DumpHtml(n,e,t){P(n),P(e);let i=`<!doctype html>
<html><body><object data="${(a=>String(a).replace(/[&<>"']/g,h=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"})[h]))(e)}" type="image/svg+xml" width="${n.Width}" height="${n.Height}"></object></body></html>`;if(!t)return i;let s=e+".html",l=t(s,i);return l?.then?l.then(()=>s):s},WrapSvg(n,e="image.svg",t){return this.DumpHtml(this.ParseSize(n),e,t)}});var so=Object.freeze({ToGraphvizColor:n=>n instanceof o?n:new o(n.A??255,n.R,n.G,n.B),ToFont:(n,e)=>n==null?null:e?e(n.Name,n.SizeInPoints):{Name:n.Name,SizeInPoints:n.SizeInPoints},ToGraphvizFont:n=>n==null?null:new cr(n.Name,n.SizeInPoints),ToGraphvizPoint:n=>new pr(n.X,n.Y),ToGraphvizSize:n=>new ke(n.Width,n.Height),ToGraphvizSizeF:n=>new ae(n.Width,n.Height)});var _=Object.freeze({Boolean:1,Byte:2,Char:3,Decimal:5,Double:6,Int16:7,Int32:8,Int64:9,SByte:10,Single:11,TimeSpan:12,DateTime:13,UInt16:14,UInt32:15,UInt64:16,Null:17,String:18}),Me=Object.freeze({Primitive:0,String:1,Object:2,SystemClass:3,Class:4,ObjectArray:5,StringArray:6,PrimitiveArray:7}),y=_,N=Me,Ni=new TextEncoder,Li=new TextDecoder("utf-8",{fatal:!0});var Et=new Set(Object.values(y)),C=n=>{throw new z(n)};function Ri(n){for(let[e,t]of Object.entries(n))if(e.startsWith("max")&&(!Number.isSafeInteger(t)||t<0))throw new RangeError(`${e} must be a nonnegative safe integer`);return n}var se=class{constructor(e,t){if(!Et.has(e)||e>=y.Null)throw new TypeError("Invalid boxed primitive type");this.Type=e,this.Value=t}valueOf(){return this.Value}toString(){return String(this.Value)}},z=class extends Error{constructor(e){super(e),this.name="NrbfFormatError"}},H=class{constructor(e){let t=String(e);if(!/^-?\d+(?:\.\d+)?$/.test(t))throw new TypeError("Invalid decimal");let r=t.startsWith("-"),[i,s=""]=t.replace(/^-/,"").split(".");i=i.replace(/^0+(?=\d)/,"");let l=()=>{throw new RangeError("Decimal is outside the CLR 96-bit coefficient and 28-digit scale")};i.length>29&&l(),s.length>28&&(/^0*$/.test(s.slice(28))||l(),s=s.slice(0,28));let a=(i+s).replace(/^0+/,"")||"0";a.length>29&&(s=s.replace(/0+$/,""),a=(i+s).replace(/^0+/,"")||"0"),a.length>29&&l();let h=BigInt(a);h>0xffffffffffffffffffffffffn&&s.endsWith("0")&&(s=s.replace(/0+$/,""),h=BigInt(i+s)),h>0xffffffffffffffffffffffffn&&l(),this.Value=(r?"-":"")+i+(s?"."+s:"")}toString(){return this.Value}},K=class{constructor(e){if(this.Data=BigInt(e),this.Data<0n||this.Data>0xffffffffffffffffn)throw new RangeError("DateTime data")}get Ticks(){return this.Data&0x3fffffffffffffffn}get Kind(){return Number(this.Data>>62n)}},G=class{constructor(e,t={},r={},i=null){if(typeof e!="string"||!e)throw new TypeError("typeName");this.TypeName=e,this.LibraryName=i,this.Members=Object.assign(Object.create(null),t),this.MemberTypes=Object.assign(Object.create(null),r)}},v=class{constructor(e=[],t={}){if(this.Values=Array.from(e),this.Lengths=t.lengths?Array.from(t.lengths):[this.Values.length],this.LowerBounds=t.lowerBounds?Array.from(t.lowerBounds):this.Lengths.map(()=>0),this.ArrayType=t.arrayType??(this.Lengths.length>1?2:0),this.ElementType=t.elementType??{type:N.Object},this.Lengths.length<1||this.Lengths.length!==this.LowerBounds.length||this.Lengths.some(r=>!Number.isSafeInteger(r)||r<0)||this.LowerBounds.some(r=>!Number.isInteger(r))||this.Lengths.reduce((r,i)=>r*i,1)!==this.Values.length)throw new RangeError("Invalid array shape")}GetValue(...e){if(e.length!==this.Lengths.length)throw new RangeError("Array rank");let t=0;for(let r=0;r<e.length;r++){let i=e[r]-this.LowerBounds[r];if(!Number.isInteger(i)||i<0||i>=this.Lengths[r])throw new RangeError("Array index");t=t*this.Lengths[r]+i}return this.Values[t]}[Symbol.iterator](){return this.Values[Symbol.iterator]()}},Xe=class{constructor(e,t=new Map,r=new Map){this.Root=e,this.Objects=t,this.Libraries=r}},hn=class{constructor(e){this.id=e}},Be=class{constructor(e){this.count=e}},Sr=class{constructor(e,t){if(e instanceof ArrayBuffer&&(e=new Uint8Array(e)),!ArrayBuffer.isView(e))throw new TypeError("Expected binary bytes");this.bytes=new Uint8Array(e.buffer,e.byteOffset,e.byteLength),this.view=new DataView(e.buffer,e.byteOffset,e.byteLength),this.pos=0,this.options=Ri({maxBytes:64*1024*1024,maxObjects:1e6,maxArrayLength:1e7,maxTotalArrayLength:1e7,maxStringBytes:16*1024*1024,maxMembers:1e5,maxDepth:256,...t}),this.bytes.length>this.options.maxBytes&&C("Byte limit exceeded"),this.objects=new Map,this.libraries=new Map,this.metadata=new Map,this.refs=[],this.depth=0,this.records=0,this.totalArrayLength=0}need(e){(!Number.isSafeInteger(e)||e<0||this.pos+e>this.bytes.length)&&C(`Truncated NRBF record at byte ${this.pos}`)}u8(){return this.need(1),this.bytes[this.pos++]}num(e,t){this.need(t);let r=this.view[e](this.pos,!0);return this.pos+=t,r}i32(){return this.num("getInt32",4)}string(){let e=0,t=0;for(let r=0;r<5;r++){let i=this.u8();if(r===4&&i>7&&C("Invalid string length"),e+=(i&127)*2**t,!(i&128)){e>this.options.maxStringBytes&&C("String limit exceeded"),this.need(e);let s;try{s=Li.decode(this.bytes.subarray(this.pos,this.pos+e))}catch{C("Invalid UTF-8")}return this.pos+=e,s}t+=7}C("Invalid string length")}count(e,t=this.options.maxArrayLength){return(e<0||e>t)&&C("Count limit exceeded"),e}register(e,t){return(!Number.isInteger(e)||e===0||this.objects.has(e))&&C(`Duplicate or invalid object ID ${e}`),this.objects.size>=this.options.maxObjects&&C("Object limit exceeded"),this.objects.set(e,t),t}primitive(e){switch(Et.has(e)||C(`Unknown primitive type ${e}`),e){case y.Boolean:{let t=this.u8();return t>1&&C("Invalid Boolean"),t===1}case y.Byte:return this.u8();case y.Char:{let t=this.pos,r=this.u8(),i=r<128?1:r>=194&&r<=223?2:r>=224&&r<=239?3:0;i||C("Invalid UTF-8 Char"),this.need(i-1),this.pos+=i-1;try{let s=Li.decode(this.bytes.subarray(t,this.pos));return s.length!==1&&C("Invalid Char"),s}catch{C("Invalid UTF-8 Char")}break}case y.Decimal:{let t=this.string();try{return new H(t)}catch{C("Invalid Decimal value")}break}case y.Double:return this.num("getFloat64",8);case y.Int16:return this.num("getInt16",2);case y.Int32:return this.i32();case y.Int64:case y.TimeSpan:return this.num("getBigInt64",8);case y.SByte:return this.num("getInt8",1);case y.Single:return this.num("getFloat32",4);case y.DateTime:return new K(this.num("getBigUint64",8));case y.UInt16:return this.num("getUint16",2);case y.UInt32:return this.num("getUint32",4);case y.UInt64:return this.num("getBigUint64",8);case y.Null:return null;case y.String:return this.string()}}type(e){if((e<0||e>7)&&C(`Unknown binary type ${e}`),e===N.Primitive||e===N.PrimitiveArray){let t=this.u8();return(!Et.has(t)||t>=y.Null)&&C("Invalid primitive metadata"),{type:e,primitive:t}}if(e===N.SystemClass)return{type:e,name:this.string()};if(e===N.Class){let t=this.string(),r=this.i32();return this.libraries.has(r)||C("Unknown library reference"),{type:e,name:t,library:this.libraries.get(r)}}return{type:e}}value(){for(;;){let e=this.record();if(e!==void 0)return e}}record(){++this.records>this.options.maxObjects*8&&C("Record limit exceeded"),++this.depth>this.options.maxDepth&&C("Nesting limit exceeded");try{let e=this.u8();switch(e){case 1:{let t=this.i32(),r=this.i32(),i=this.metadata.get(r);return i||C("Unknown class metadata reference"),this.classValue(t,i)}case 2:case 3:case 4:case 5:{let t=this.i32(),r=this.string(),i=this.count(this.i32(),this.options.maxMembers),s=[];for(let c=0;c<i;c++)s.push(this.string());new Set(s).size!==s.length&&C("Duplicate member names");let l;if(e>=4)l=Array.from({length:i},()=>this.u8()).map(p=>this.type(p));else{let c=this.options.resolveMemberTypes;c||C("Untyped class metadata requires resolveMemberTypes"),l=c(r,s),(!Array.isArray(l)||l.length!==i)&&C("Invalid resolved member metadata")}let a=null;if(e===3||e===5){let c=this.i32();this.libraries.has(c)||C("Unknown class library"),a=this.libraries.get(c)}let h={name:r,names:s,types:l,library:a};return this.metadata.set(t,h),this.classValue(t,h)}case 6:{let t=this.i32();return this.register(t,this.string())}case 7:{let t=this.i32(),r=this.u8();r>5&&C("Invalid BinaryArray type");let i=this.count(this.i32(),32);(i<1||r%3!==2&&i!==1)&&C("Invalid BinaryArray rank");let s=Array.from({length:i},()=>this.count(this.i32())),l=1;for(let c of s)l*=c,this.count(l);let a=r>=3?Array.from({length:i},()=>this.i32()):s.map(()=>0),h=this.type(this.u8());return this.arrayValue(t,l,{lengths:s,lowerBounds:a,arrayType:r,elementType:h})}case 8:{let t=this.u8();return t>=y.Null&&C("Invalid boxed primitive type"),new se(t,this.primitive(t))}case 9:{let t=new hn(this.i32());return this.refs.push(t),t}case 10:return null;case 12:{let t=this.i32(),r=this.string();(t<=0||this.libraries.has(t))&&C("Duplicate or invalid library ID"),this.libraries.set(t,r);return}case 13:return new Be(this.count(this.u8()));case 14:return new Be(this.count(this.i32()));case 15:{let t=this.i32(),r=this.count(this.i32()),i=this.u8();return(!Et.has(i)||i>=y.Null)&&C("Invalid array primitive"),this.arrayValue(t,r,{elementType:{type:N.Primitive,primitive:i}})}case 16:case 17:{let t=this.i32(),r=this.count(this.i32());return this.arrayValue(t,r,{elementType:{type:e===16?N.Object:N.String}})}case 21:case 22:C("Remoting method invocation records are not object graph data");default:C(`Unexpected record type ${e} at byte ${this.pos-1}`)}}finally{this.depth--}}classValue(e,t){let r=this.register(e,new G(t.name,{},Object.fromEntries(t.names.map((i,s)=>[i,t.types[s]])),t.library));r.IsValueType=e<0;for(let i=0;i<t.names.length;i++){let s=t.types[i].type===N.Primitive?this.primitive(t.types[i].primitive):this.value();s instanceof Be&&C("Null run outside an array"),r.Members[t.names[i]]=s}return r}arrayValue(e,t,r){t>this.options.maxTotalArrayLength-this.totalArrayLength&&C("Total array length limit exceeded"),this.totalArrayLength+=t;let i=this.register(e,Object.create(v.prototype));for(i.Values=[],i.Lengths=r.lengths??[t],i.LowerBounds=r.lowerBounds??[0],i.ArrayType=r.arrayType??0,i.ElementType=r.elementType;i.Values.length<t;){let s=i.ElementType.type===N.Primitive?this.primitive(i.ElementType.primitive):this.value();if(s instanceof Be){(s.count===0||s.count>t-i.Values.length)&&C("Invalid null run length");for(let l=0;l<s.count;l++)i.Values.push(null)}else i.Values.push(s)}return i}read(){this.u8()!==0&&C("Missing SerializationHeaderRecord");let e=this.i32();for(this.i32(),(this.i32()!==1||this.i32()!==0)&&C("Unsupported NRBF version");this.pos<this.bytes.length&&this.bytes[this.pos]!==11;)this.record()instanceof Be&&C("Null run outside an array");this.u8()!==11&&C("Missing MessageEnd"),this.pos!==this.bytes.length&&!this.options.allowTrailingBytes&&C("Trailing bytes after MessageEnd"),this.objects.has(e)||C("Root object not found");for(let t of this.refs)this.objects.has(t.id)||C(`Unresolved object reference ${t.id}`);for(let t of this.objects.values()){let r=t instanceof G?t.Members:t instanceof v?t.Values:null;if(r)for(let i of Object.keys(r))r[i]instanceof hn&&(r[i]=this.objects.get(r[i].id))}return new Xe(this.objects.get(e),this.objects,this.libraries)}};function Vi(n,e={}){return new Sr(n,e).read()}var Tr=class{constructor(e={}){this.bytes=new Uint8Array(1024),this.pos=0,this.objects=new Map,this.libraries=new Map,this.metadata=new Map,this.pending=[],this.options=Ri({maxBytes:64*1024*1024,maxDepth:256,...e}),this.depth=0,this.nextId=1}need(e){if(this.pos+e>this.options.maxBytes)throw new RangeError("NRBF output byte limit exceeded");if(this.pos+e>this.bytes.length){let t=new Uint8Array(Math.max(this.pos+e,this.bytes.length*2));t.set(this.bytes),this.bytes=t}}u8(e){this.need(1),this.bytes[this.pos++]=e}num(e,t,r){this.need(t),new DataView(this.bytes.buffer)[e](this.pos,r,!0),this.pos+=t}i32(e){this.num("setInt32",4,e)}string(e){let t=Ni.encode(String(e)),r=t.length;for(;r>=128;)this.u8(r&127|128),r>>>=7;this.u8(r),this.need(t.length),this.bytes.set(t,this.pos),this.pos+=t.length}primitive(e,t){switch(e){case y.Boolean:if(typeof t!="boolean")throw new TypeError("Boolean primitive");this.u8(t?1:0);break;case y.Byte:this.integer("setUint8",1,t,0,255);break;case y.Char:{if(typeof t!="string"||t.length!==1||/^[\uD800-\uDFFF]$/.test(t))throw new TypeError("Char primitive");let r=Ni.encode(t);this.need(r.length),this.bytes.set(r,this.pos),this.pos+=r.length;break}case y.Decimal:this.string(t instanceof H?t.Value:new H(t).Value);break;case y.Double:this.num("setFloat64",8,Number(t));break;case y.Int16:this.integer("setInt16",2,t,-32768,32767);break;case y.Int32:this.integer("setInt32",4,t,-2147483648,2147483647);break;case y.Int64:case y.TimeSpan:{let r=BigInt(t);if(r<-(1n<<63n)||r>=1n<<63n)throw new RangeError("Int64 primitive");this.num("setBigInt64",8,r);break}case y.SByte:this.integer("setInt8",1,t,-128,127);break;case y.Single:this.num("setFloat32",4,Number(t));break;case y.DateTime:this.num("setBigUint64",8,t instanceof K?t.Data:new K(t).Data);break;case y.UInt16:this.integer("setUint16",2,t,0,65535);break;case y.UInt32:this.integer("setUint32",4,t,0,4294967295);break;case y.UInt64:{let r=BigInt(t);if(r<0n||r>=1n<<64n)throw new RangeError("UInt64 primitive");this.num("setBigUint64",8,r);break}default:throw new TypeError(`Unsupported primitive ${e}`)}}integer(e,t,r,i,s){if(!Number.isInteger(r)||r<i||r>s)throw new RangeError("Integer primitive");this.num(e,t,r)}type(e){if(e.type===N.Primitive||e.type===N.PrimitiveArray){if(!Et.has(e.primitive)||e.primitive>=y.Null)throw new TypeError("Invalid primitive metadata");this.u8(e.primitive)}else if(e.type===N.SystemClass)this.string(e.name);else if(e.type===N.Class){if(this.string(e.name),!this.libraries.has(e.library))throw new TypeError("Unknown library");this.i32(this.libraries.get(e.library))}else if(e.type<0||e.type>7)throw new TypeError("Invalid member type")}collect(e){let t=[e],r=new Set;for(;t.length;){let i=t.pop();if(!i||typeof i!="object"||r.has(i))continue;r.add(i);let s=l=>{l&&!this.libraries.has(l)&&this.libraries.set(l,this.libraries.size+1)};if(i instanceof G){s(i.LibraryName);for(let l of Object.values(i.MemberTypes))s(l.library);for(let l of Object.values(i.Members))t.push(l)}else if(i instanceof v){s(i.ElementType.library);for(let l of i.Values)t.push(l)}else if(Array.isArray(i))for(let l of i)t.push(l);else if(!(i instanceof se)&&!(i instanceof H)&&!(i instanceof K)&&!ArrayBuffer.isView(i))throw new TypeError("Unregistered object: encode an NrbfClass or register a CLR schema")}}value(e,t=!1){if(++this.depth>this.options.maxDepth)throw new RangeError("NRBF output nesting limit exceeded");try{if(e instanceof se){this.u8(8),this.u8(e.Type),this.primitive(e.Type,e.Value);return}if(e==null){this.u8(10);return}if(typeof e=="number"||typeof e=="boolean"||typeof e=="bigint"||e instanceof H||e instanceof K){let p=Cr(e);this.u8(8),this.u8(p),this.primitive(p,e);return}if(this.objects.has(e)&&!t){this.u8(9),this.i32(this.objects.get(e));return}let r=this.objects.get(e);if(r===void 0&&(r=this.nextId++,e instanceof G&&e.IsValueType&&this.depth>1&&(r=-r),this.objects.set(e,r)),!t&&typeof e!="string"&&!(e instanceof G&&e.IsValueType)){this.pending.push(e),this.u8(9),this.i32(r);return}if(typeof e=="string"){this.u8(6),this.i32(r),this.string(e);return}if(e instanceof G){let p=Object.keys(e.Members),u=p.map(b=>e.MemberTypes[b]??ys(e.Members[b])),g=JSON.stringify([e.TypeName,e.LibraryName,p,u]);if(this.metadata.has(g))this.u8(1),this.i32(r),this.i32(this.metadata.get(g));else{this.metadata.set(g,r),this.u8(e.LibraryName?5:4),this.i32(r),this.string(e.TypeName),this.i32(p.length);for(let b of p)this.string(b);for(let b of u)this.u8(b.type);for(let b of u)this.type(b);e.LibraryName&&this.i32(this.libraries.get(e.LibraryName))}for(let b=0;b<p.length;b++)u[b].type===N.Primitive?this.primitive(u[b].primitive,e.Members[p[b]]):this.value(e.Members[p[b]]);return}let i=e;if(ArrayBuffer.isView(e)?i=bs(e):Array.isArray(e)&&(i=new v(e)),!(i instanceof v))throw new TypeError("Unsupported NRBF value");let{Values:s,ElementType:l,Lengths:a,LowerBounds:h}=i,c=a.length===1&&h[0]===0&&i.ArrayType===0;if(c&&[N.Primitive,N.Object,N.String].includes(l.type))this.u8(l.type===N.Primitive?15:l.type===N.Object?16:17),this.i32(r),this.i32(s.length),l.type===N.Primitive&&this.u8(l.primitive);else{this.u8(7),this.i32(r);let p=h.some(u=>u!==0)?i.ArrayType%3+3:i.ArrayType;this.u8(p),this.i32(a.length);for(let u of a)this.i32(u);if(p>=3)for(let u of h)this.i32(u);this.u8(l.type),this.type(l)}for(let p=0;p<s.length;p++)if(l.type===N.Primitive)this.primitive(l.primitive,s[p]);else if(s[p]==null){let u=p+1;for(;c&&u<s.length&&s[u]==null;)u++;let g=u-p;g===1?this.u8(10):g<=255?(this.u8(13),this.u8(g)):(this.u8(14),this.i32(g)),p=u-1}else this.value(s[p])}finally{this.depth--}}write(e){if(e instanceof Xe&&(e=e.Root),e==null)throw new TypeError("NRBF root cannot be null");if(e instanceof se?e=Er(e.Type,e.Value):e instanceof H?e=Er(y.Decimal,e):e instanceof K&&(e=Er(y.DateTime,e)),["number","boolean","bigint"].includes(typeof e)){let t=Cr(e),r=Object.keys(y).find(i=>y[i]===t);e=new G("System."+r,{m_value:e},{m_value:{type:N.Primitive,primitive:t}})}this.collect(e),this.u8(0),this.i32(1),this.i32(-1),this.i32(1),this.i32(0);for(let[t,r]of this.libraries)this.u8(12),this.i32(r),this.string(t);this.value(e,!0);for(let t=0;t<this.pending.length;t++)this.value(this.pending[t],!0);return this.u8(11),this.bytes.slice(0,this.pos)}};function Er(n,e){let t=i=>({type:N.Primitive,primitive:i});if(n===y.Decimal){let i=e instanceof H?e:new H(e),s=i.Value.startsWith("-"),[l,a=""]=i.Value.replace(/^-/,"").split("."),h=BigInt(l+a),c={flags:(s?2147483648:0)|a.length<<16|0,hi:Number(h>>64n)|0,lo:Number(h&0xffffffffn)|0,mid:Number(h>>32n&0xffffffffn)|0};return new G("System.Decimal",c,Object.fromEntries(Object.keys(c).map(p=>[p,t(y.Int32)])))}if(n===y.DateTime){let i=e instanceof K?e:new K(e);return new G("System.DateTime",{ticks:i.Ticks,dateData:i.Data},{ticks:t(y.Int64),dateData:t(y.UInt64)})}if(n===y.TimeSpan)return new G("System.TimeSpan",{_ticks:BigInt(e)},{_ticks:t(y.Int64)});let r=Object.keys(y).find(i=>y[i]===n);if(!r||n>=y.Null)throw new TypeError("Invalid root primitive");return new G("System."+r,{m_value:e},{m_value:t(n)})}function Cr(n){return typeof n=="boolean"?y.Boolean:typeof n=="bigint"?n<0n?y.Int64:n>(1n<<63n)-1n?y.UInt64:y.Int64:n instanceof H?y.Decimal:n instanceof K?y.DateTime:Number.isInteger(n)&&n>=-2147483648&&n<=2147483647?y.Int32:y.Double}function ys(n){return typeof n=="number"||typeof n=="boolean"||typeof n=="bigint"||n instanceof H||n instanceof K?{type:N.Primitive,primitive:Cr(n)}:typeof n=="string"?{type:N.String}:{type:N.Object}}function bs(n){let t={Int8Array:y.SByte,Uint8Array:y.Byte,Uint8ClampedArray:y.Byte,Int16Array:y.Int16,Uint16Array:y.UInt16,Int32Array:y.Int32,Uint32Array:y.UInt32,Float32Array:y.Single,Float64Array:y.Double,BigInt64Array:y.Int64,BigUint64Array:y.UInt64}[n.constructor.name];if(!t)throw new TypeError("Unsupported typed array");return new v(n,{elementType:{type:N.Primitive,primitive:t}})}function Oi(n,e={}){return new Tr(e).write(n)}var ne="mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",Tt="QuikGraph, Version=2.5.0.0, Culture=neutral, PublicKeyToken=46bd58b0789759cb",Bi=new Set(["QuikGraphException","VertexNotFoundException","NegativeCycleGraphException","NegativeWeightException","ParallelEdgeNotAllowedException","NegativeCapacityException","NoPathFoundException","NonStronglyConnectedGraphException","NonAcyclicGraphException"]),Mi="QuikGraph.Graphviz, Version=2.5.0.0, Culture=neutral, PublicKeyToken=46bd58b0789759cb",q=n=>({type:Me.Primitive,primitive:n}),vi=new Set(["AdjacencyGraph","BidirectionalGraph","UndirectedGraph","EdgeListGraph","ArrayAdjacencyGraph","ArrayBidirectionalGraph","ArrayUndirectedGraph","BidirectionalAdapterGraph","ReversedBidirectionalGraph","UndirectedBidirectionalGraph","BidirectionalMatrixGraph","CompressedSparseRowGraph","ClusteredAdjacencyGraph"]),Ir=new Set(["Edge","EquatableEdge","SEdge","SEquatableEdge","UndirectedEdge","EquatableUndirectedEdge","SUndirectedEdge","TaggedEdge","EquatableTaggedEdge","STaggedEdge","SEquatableTaggedEdge","TaggedUndirectedEdge","STaggedUndirectedEdge","TermEdge","EquatableTermEdge","SReversedEdge"]),Ye=n=>n.TypeName.split("`")[0].split(".").at(-1),zi=n=>n.TypeName.split("[[")[0],M=n=>`<${n}>k__BackingField`;function w(n,...e){for(let t of e){if(Object.hasOwn(n.Members,t))return n.Members[t];let r=M(t);for(let i of Object.keys(n.Members))if(i===r||i.endsWith("+"+r)||i.endsWith("+"+t))return n.Members[i]}}function xe(n){if(n==null)return[];if(n instanceof v)return n.Values;if(!(n instanceof G))throw new z("Expected CLR list");let e=w(n,"_items","_array"),t=w(n,"_size");if(!(e instanceof v)||!Number.isInteger(t)||t<0||t>e.Values.length)throw new z("Invalid CLR list state");if(Ye(n)==="Queue"){let r=w(n,"_head");if(!Number.isInteger(r)||r<0||t>0&&r>=e.Values.length)throw new z("Invalid CLR queue head");return Array.from({length:t},(i,s)=>e.Values[(r+s)%e.Values.length])}return e.Values.slice(0,t)}function dn(n){if(!(n instanceof G))throw new z("Expected CLR dictionary");return xe(w(n,"KeyValuePairs")).map(e=>[w(e,"key","Key"),w(e,"value","Value")])}function un(n){return n instanceof G&&n.TypeName.startsWith("QuikGraph.")&&vi.has(Ye(n))&&!zi(n).includes("+")}var ve=new WeakMap;function qi(n,e=new Set){if(e.has(n))return"[Cyclic inner exception]";e.add(n);let r=(n.ClrTypeName??n.name)+(n.message?": "+n.message:"");n.cause&&(r+=" ---> "+(n.cause.ClrTypeName?qi(n.cause,e):String(n.cause))+`
   --- End of inner exception stack trace ---`);let i=n.ClrStackTrace;return i&&(r+=`
`+i),r}var kr=class{constructor(e={}){this.options=e,this.memo=new Map,this.activeGraphs=new Set,this.depth=0,this.totalVertices=0,this.totalEdges=0}read(e){if(this.memo.has(e))return this.memo.get(e);if(++this.depth>(this.options.maxDepth??256))throw new z("NRBF materialization nesting limit exceeded");try{return this.readValue(e)}finally{this.depth--}}account(e,t){if(this.totalVertices+=e,this.totalEdges+=t,this.totalVertices>(this.options.maxGraphVertices??1e6)||this.totalEdges>(this.options.maxGraphEdges??1e7))throw new z("Graph allocation limit exceeded")}readValue(e){if(e instanceof se)return e.Type===_.TimeSpan?e:e.Value;if(e==null||typeof e!="object"||e instanceof K||e instanceof H)return e;if(this.memo.has(e))return this.memo.get(e);if(e instanceof v){let s=[];this.memo.set(e,s);for(let l of e.Values)s.push(this.read(l));return Object.defineProperty(s,"NrbfShape",{value:{lengths:e.Lengths,lowerBounds:e.LowerBounds,arrayType:e.ArrayType},enumerable:!1}),ve.set(s,e),s}if(!(e instanceof G))throw new TypeError("Invalid NRBF object");if(un(e))return this.graph(e);let t=Ye(e),r=zi(e),i;if(e.TypeName.startsWith("QuikGraph.")&&Ir.has(t))if(i=Object.create(de[t].prototype),this.memo.set(e,i),t==="SReversedEdge"){let s=this.read(w(e,"OriginalEdge"));Object.defineProperties(i,{OriginalEdge:{value:s,enumerable:!0},Source:{value:s?.Target??null,enumerable:!0},Target:{value:s?.Source??null,enumerable:!0}})}else{let s=this.read(w(e,"Source")),l=this.read(w(e,"Target"));Object.defineProperties(i,{Source:{value:s,enumerable:!0},Target:{value:l,enumerable:!0}}),t.includes("Tagged")&&(i._tag=this.read(w(e,"_tag","Tag")),i.TagChanged=new O),t.includes("Term")&&Object.defineProperties(i,{SourceTerminal:{value:w(e,"SourceTerminal"),enumerable:!0},TargetTerminal:{value:w(e,"TargetTerminal"),enumerable:!0}})}else if(e.TypeName==="QuikGraph.Graphviz.Dot.GraphvizColor")i=new o(w(e,"a"),w(e,"r"),w(e,"g"),w(e,"b"));else if(e.TypeName==="QuikGraph.Graphviz.Dot.GraphvizSize")i=new ke(w(e,"w"),w(e,"h"));else if(e.TypeName==="QuikGraph.Graphviz.Dot.GraphvizSizeF")i=new ae(w(e,"w"),w(e,"h"));else if(/^(?:QuikGraph\.[\w]+Exception|System\.[\w]+Exception)$/.test(r)){let s=de[t]??Error;i=new s(w(e,"Message")??""),this.memo.set(e,i),i.ClrTypeName=w(e,"ClassName")??e.TypeName,i.ClrStackTrace=(w(e,"RemoteStackTraceString")??"")+(w(e,"StackTraceString")??""),i.cause=this.read(w(e,"InnerException")),i.HResult=w(e,"HResult"),i.Source=w(e,"Source"),i.Data=this.read(w(e,"Data")),i.ToString=()=>qi(i)}else if(/^(?:QuikGraph\.Collections\.(?:VertexList|EdgeList)|System\.Collections\.Generic\.List)`/.test(r)){let s=Jt[t];i=s?new s:[],this.memo.set(e,i);for(let l of xe(e))typeof i.Add=="function"?i.Add(this.read(l)):i.push(this.read(l))}else if(/^(?:QuikGraph\.Collections\.Queue|System\.Collections\.Generic\.Queue)`/.test(r)){i=new Ve,this.memo.set(e,i);for(let s of xe(e))i.Enqueue(this.read(s))}else if(/^(?:QuikGraph\.Collections\.(?:VertexEdgeDictionary|EdgeEdgeDictionary)|System\.Collections\.Generic\.Dictionary)`/.test(r)){let s=Jt[t];i=s?new s:new D,this.memo.set(e,i);for(let[l,a]of dn(e))i.set(this.read(l),this.read(a))}else if(r==="System.Decimal"){let s=w(e,"flags"),l=s>>>16&255,a=BigInt(w(e,"hi")>>>0)<<64n|BigInt(w(e,"mid")>>>0)<<32n|BigInt(w(e,"lo")>>>0),h=String(a).padStart(l+1,"0");return l&&(h=h.slice(0,-l)+"."+h.slice(-l)),new H((s<0?"-":"")+h)}else{if(r==="System.DateTime")return new K(w(e,"dateData")??w(e,"ticks"));if(r==="System.TimeSpan")return new se(_.TimeSpan,w(e,"_ticks"));if(/^System\.(Boolean|Byte|SByte|Char|Int16|Int32|Int64|UInt16|UInt32|UInt64|Single|Double)$/.test(r))return w(e,"m_value");{let s=this.options.registry?.Types?.get(e.TypeName)??this.options.resolveType?.(e.TypeName,e.LibraryName);if(s){if(i=s.create(e),!i||typeof i!="object")throw new TypeError("Registered create must return an object");this.memo.set(e,i);let l=Object.fromEntries(Object.entries(e.Members).map(([a,h])=>[a,this.read(h)]));s.populate(i,l,e)}else if(this.options.allowUnknownTypes){i=new G(e.TypeName,{},e.MemberTypes,e.LibraryName),this.memo.set(e,i);for(let[l,a]of Object.entries(e.Members))i.Members[l]=this.read(a)}else throw new TypeError(`Register an explicit schema for CLR type ${e.TypeName}`)}}return this.memo.set(e,i),ve.set(i,e),i}graph(e){this.activeGraphs.add(e);try{return this.graphValue(e)}finally{this.activeGraphs.delete(e)}}graphValue(e){let t=Ye(e),r=w(e,"AllowParallelEdges")??!0,i=Object.create(de[t].prototype);this.memo.set(e,i);let s;if(t==="ClusteredAdjacencyGraph"){let l=w(e,"Wrapped");if(!un(l)||Ye(l)!=="AdjacencyGraph"||this.activeGraphs.has(l))throw new z("Invalid clustered wrapped graph");s=new ht(this.read(l)),Object.assign(i,s),i.Parent=this.read(w(e,"Parent")),i.Collapsed=w(e,"Collapsed")??!1,i._clusters=xe(w(e,"_clusters")).map(a=>{if(!un(a)||Ye(a)!=="ClusteredAdjacencyGraph"||this.activeGraphs.has(a))throw new z("Cyclic or invalid cluster hierarchy");return this.read(a)}),s=i}else if(["ReversedBidirectionalGraph","UndirectedBidirectionalGraph","BidirectionalAdapterGraph"].includes(t)){let l=w(e,"OriginalGraph","_baseGraph");if(!un(l)||this.activeGraphs.has(l))throw new z("Cyclic or invalid wrapped graph");let a=this.read(l);s=new de[t](a)}else{if(t==="BidirectionalMatrixGraph"){let u=w(e,"VertexCount"),g=w(e,"_edges");if(!Number.isInteger(u)||u<0||!(g instanceof v)||g.Lengths.length!==2||g.Lengths[0]!==u||g.Lengths[1]!==u||g.Values.length!==u*u||g.LowerBounds.some(b=>b!==0))throw new z("Invalid matrix graph shape");this.account(u,0)}let l=t==="UndirectedGraph"||t==="ArrayUndirectedGraph",a=t==="BidirectionalMatrixGraph"?new ot(w(e,"VertexCount")):l?new ge(r):new ce(r),h=[],c=[];if(t==="BidirectionalMatrixGraph"){let u=w(e,"_edges");if(!(u instanceof v)||u.Lengths.length!==2||u.Lengths[0]!==a.VertexCount||u.Lengths[1]!==a.VertexCount)throw new z("Invalid matrix graph shape");c=u.Values.filter(g=>g!==null),this.account(0,c.length)}else if(t==="EdgeListGraph")c=dn(w(e,"_edges")).map(u=>u[0]),this.account(0,c.length);else if(t==="CompressedSparseRowGraph"){let u=xe(w(e,"_outEdges")),g=dn(w(e,"_outEdgeStartRanges")),b=g.map(([S,x])=>({v:S,start:w(x,"Start"),end:w(x,"End")}));for(let S of b)if(!Number.isInteger(S.start)||!Number.isInteger(S.end)||S.start<0||S.end<S.start||S.end>u.length)throw new z("Invalid CSR offsets");let E=0;for(let S of b.filter(x=>x.start!==x.end).sort((x,k)=>x.start-k.start)){if(S.start!==E)throw new z("Overlapping or incomplete CSR offsets");E=S.end}if(E!==u.length)throw new z("Incomplete CSR offsets");this.account(b.length,u.length);for(let{v:S,start:x,end:k}of b){h.push(S);for(let f=x;f<k;f++)c.push(new he(this.read(S),this.read(u[f])))}}else{let u=dn(w(e,"_vertexEdges","_vertexOutEdges","AdjacentEdges","VertexEdges"));if(h=u.map(g=>g[0]),this.account(h.length,0),l)c=xe(w(e,"Edges","_edges")),this.account(0,c.length);else for(let[,g]of u){let b=xe(t==="ArrayBidirectionalGraph"?w(g,"OutEdges"):g);this.account(0,b.length);for(let E of b)c.push(E)}}if(t==="EdgeListGraph"){s=new rt(w(e,"IsDirected")??!0,r);for(let u of c)s.AddEdge(this.read(u))}else{for(let u of h)a.AddVertex(this.read(u));for(let u of c){let g=u instanceof $?u:this.read(u);if(!a.ContainsVertex(g.Source)||!a.ContainsVertex(g.Target))throw new z("Graph edge references an absent vertex");a.AddEdge(g)}a.EdgeCapacity=w(e,"EdgeCapacity")??0,s=["ArrayAdjacencyGraph","ArrayBidirectionalGraph","ArrayUndirectedGraph","CompressedSparseRowGraph"].includes(t)?new de[t](a):t==="AdjacencyGraph"?Object.assign(new Z(r),a):a}let p=w(e,"EdgeCount");if(p!==void 0&&s.EdgeCount!==p)throw new z("Graph edge count does not match its records")}return Object.assign(i,s),ve.set(i,e),i}};function ws(n,e={}){let t=n instanceof Xe?n.Root:n instanceof G||n instanceof v?n:Vi(n,e).Root;return new kr(e).read(t)}var F=(n,e=ne)=>({name:n,library:e}),Es=n=>`${n.name}, ${n.library}`;function L(n,e,t=Tt){return F(n+"[["+e.map(Es).join("],[")+"]]",t)}function Q(n){return typeof n=="string"?F(n,n.startsWith("QuikGraph.")?Tt:ne):n}function W(n){if(n instanceof G)return F(n.TypeName,n.LibraryName??ne);if(n instanceof v){let e=n.ElementType;return F((e.name??"System.Object")+"[]",e.library??ne)}if(typeof n=="string")return F("System.String");if(typeof n=="boolean")return F("System.Boolean");if(typeof n=="bigint")return F(n>=0n&&n>=1n<<63n?"System.UInt64":"System.Int64");if(typeof n=="number")return F(Number.isInteger(n)&&n>=-2147483648&&n<=2147483647?"System.Int32":"System.Double");if(n instanceof H)return F("System.Decimal");if(n instanceof K)return F("System.DateTime");throw new TypeError("Cannot infer a CLR type; provide a registered record schema")}function _r(n){let e=n.indexOf("[[");if(e<0)return[];let t=n.slice(e+2,-2),r=[],i=0,s=0;for(let l=0;l<t.length;l++)t[l]==="["?i++:t[l]==="]"&&(i===0&&t.slice(l,l+3)==="],["?(r.push(t.slice(s,l)),s=l+3,l+=2):i--);return r.push(t.slice(s)),r.map(l=>{let a=0;for(let h=0;h<l.length;h++)if(l[h]==="[")a++;else if(l[h]==="]")a--;else if(l[h]===","&&a===0)return F(l.slice(0,h),l.slice(h+1).trim());return F(l)})}function je(n){let e=n.name.replace(/^System\./,"");return _[e]&&_[e]<_.Null?q(_[e]):n.name==="System.String"?{type:Me.String}:n.name==="System.Object"?{type:Me.Object}:n.library===ne?{type:Me.SystemClass,name:n.name}:{type:Me.Class,name:n.name,library:n.library}}function J(n,e,t={}){let r=new G(n.name,e,t,n.library===ne?null:n.library);return r.IsValueType=/^(?:System.Collections.Generic.KeyValuePair`|QuikGraph.CompressedSparseRowGraph`1\+Range|QuikGraph.Graphviz.Dot.Graphviz(?:Color|Size)|QuikGraph.S(?:Edge|EquatableEdge|UndirectedEdge|TaggedEdge|EquatableTaggedEdge|TaggedUndirectedEdge|ReversedEdge)`)/.test(n.name),r}function St(n,e){return new v(n,{elementType:je(e)})}function ji(n){return F(n.name+"[]",n.library)}var Fr=class{constructor(e={}){this.options=e,this.memo=new Map,this.depth=0}value(e){if(this.memo.has(e))return this.memo.get(e);if(++this.depth>(this.options.maxDepth??256))throw new z("NRBF serialization nesting limit exceeded");try{return this.writeValue(e)}finally{this.depth--}}writeValue(e){if(e==null||typeof e!="object"||e instanceof H||e instanceof K||e instanceof se)return e;if(this.memo.has(e))return this.memo.get(e);if(e instanceof G||e instanceof v)return e;if(vi.has(e.constructor?.name))return this.graph(e);if(Ir.has(e.constructor?.name))return this.edge(e);if(e instanceof Error)return this.exception(e);if(e instanceof Ce||e instanceof Ke||e instanceof Ve||e instanceof mt||e instanceof ft||e instanceof D)return this.collection(e);if(e instanceof o)return J(F("QuikGraph.Graphviz.Dot.GraphvizColor",Mi),{a:e.A,r:e.R,g:e.G,b:e.B},{a:q(_.Byte),r:q(_.Byte),g:q(_.Byte),b:q(_.Byte)});if(e instanceof ke||e instanceof ae)return J(F("QuikGraph.Graphviz.Dot."+e.constructor.name,Mi),{w:e.Width,h:e.Height},{w:q(e.constructor===ae?_.Single:_.Int32),h:q(e.constructor===ae?_.Single:_.Int32)});let t=ve.get(e);if(!t&&this.options.registry){for(let[r,i]of this.options.registry.Types)if(i.matches?.(e)){if(typeof i.serialize!="function")throw new TypeError("Registered fresh values need a serialize callback");let s=new G(r,{},i.memberTypes??{},i.library??null);this.memo.set(e,s);let l=i.serialize(e,a=>this.value(a),s);if(!(l instanceof G))throw new TypeError("Registered serialize must return NrbfClass");return Object.assign(s,l),s}}if(t instanceof G&&t.TypeName.startsWith("System.Collections.Generic.List`")){let r=_r(t.TypeName)[0],i=J(F(t.TypeName,t.LibraryName??ne),{});return this.memo.set(e,i),Object.assign(i,this.list(Array.from(e,s=>this.value(s)),r,F(t.TypeName,t.LibraryName??ne))),i}if(t instanceof v){let r=new v([]);return this.memo.set(e,r),r.Values=Array.from(e,(i,s)=>t.Values[s]instanceof se?new se(t.Values[s].Type,i instanceof se?i.Value:i):this.value(i)),r.ElementType=t.ElementType,r.Lengths=t.Lengths,r.LowerBounds=t.LowerBounds,r.ArrayType=t.ArrayType,r}if(t instanceof G){let r=this.options.registry?.Types?.get(t.TypeName)??this.options.resolveType?.(t.TypeName,t.LibraryName);if(r?.serialize){let s=r.serialize(e,l=>this.value(l),t);return this.memo.set(e,s),s}let i=new G(t.TypeName,{},t.MemberTypes,t.LibraryName);this.memo.set(e,i);for(let[s,l]of Object.entries(t.Members)){let a=s.match(/<([^>]+)>k__BackingField$/)?.[1]??s;i.Members[s]=Object.hasOwn(e,a)?this.value(e[a]):l}return i}if(typeof this.options.toRecord=="function"){let r=this.options.toRecord(e,i=>this.value(i),i=>{if(!(i instanceof G))throw new TypeError("Reserve an NrbfClass");return this.memo.set(e,i),i});if(!(r instanceof G))throw new TypeError("toRecord must return NrbfClass");return this.memo.set(e,r),r}if(Array.isArray(e)||ArrayBuffer.isView(e)){let r=new v;return this.memo.set(e,r),r.Values=Array.from(e,i=>this.value(i)),r.Lengths=[r.Values.length],r}throw new TypeError("Custom data requires toRecord or a registered CLR schema")}collection(e){let t=ve.get(e),r=e.constructor.name,i=t?F(t.TypeName,t.LibraryName??ne):null,s=t?_r(t.TypeName):[],l=i?J(i,{}):new G("pending");this.memo.set(e,l);let a;if(e instanceof Ve||e instanceof Ke||e instanceof Ce){let h=Array.from(e,p=>this.value(p)),c=s.at(-1)??Q(this.options.valueType??(r==="EdgeList"?this.options.edgeType??(h.length?W(h[0]):L("QuikGraph.Edge`1",[Q(this.options.vertexType??F("System.Int32"))])):h.length?W(h[0]):F("System.Int32")));if(r==="EdgeList"&&!i){let p=Q(this.options.vertexType??(e.length?W(this.value(e[0].Source)):F("System.Int32")));a=this.list(h,c,L("QuikGraph.Collections.EdgeList`2",[p,c]))}else if(r==="Queue"){let p=i??L("QuikGraph.Collections.Queue`1",[c]),u=St(h,c);a=J(p,{"Queue`1+_array":u,"Queue`1+_head":0,"Queue`1+_tail":0,"Queue`1+_size":h.length,"Queue`1+_version":h.length},{"Queue`1+_head":q(_.Int32),"Queue`1+_tail":q(_.Int32),"Queue`1+_size":q(_.Int32),"Queue`1+_version":q(_.Int32)})}else a=this.list(h,c,i??L("QuikGraph.Collections.VertexList`1",[c]))}else{let h=s[1]??this.options.edgeType;if(r==="VertexEdgeDictionary"&&!h)for(let p of e.values()){let u=Array.from(p)[0];if(u){h=W(this.value(u));break}}let c=Array.from(e,([p,u])=>{if(r==="VertexEdgeDictionary"&&u instanceof Ce&&u.length===0&&h){let g=s[0]??Q(this.options.vertexType??W(this.value(p)));return[this.value(p),this.list([],Q(h),L("QuikGraph.Collections.EdgeList`2",[g,Q(h)]))]}return[this.value(p),this.value(u)]});if(r==="VertexEdgeDictionary"){let p=s[0]??Q(this.options.vertexType??(c.length?W(c[0][0]):F("System.Int32"))),u=s[1]??Q(h??(c.length&&xe(c[0][1]).length?W(xe(c[0][1])[0]):L("QuikGraph.Edge`1",[p])));a=this.dictionary(c,p,L("QuikGraph.Collections.IEdgeList`2",[p,u]),i??L("QuikGraph.Collections.VertexEdgeDictionary`2",[p,u]))}else if(r==="EdgeEdgeDictionary"){let p=s[1]??(c.length?W(c[0][0]):Q(this.options.edgeType??L("QuikGraph.Edge`1",[F("System.Int32")]))),u=s[0]??Q(this.options.vertexType??(e.size?W(this.value(e.keys().next().value.Source)):F("System.Int32")));a=this.dictionary(c,p,p,i??L("QuikGraph.Collections.EdgeEdgeDictionary`2",[u,p]))}else{let p=s[0]??Q(this.options.keyType??(c.length?W(c[0][0]):F("System.Int32"))),u=s[1]??Q(this.options.valueType??(c.length?W(c[0][1]):F("System.Int32")));a=this.dictionary(c,p,u,i??void 0)}}return Object.assign(l,a),l}edge(e,t,r){let i=e.constructor.name;if(i==="SReversedEdge"){let E=this.value(e.OriginalEdge),S=t??this.options.vertexType??W(this.value(e.Source)),x=L("QuikGraph.SReversedEdge`2",[Q(S),W(E)]),k=J(x,{[M("OriginalEdge")]:E});return this.memo.set(e,k),k}let s=this.value(e.Source),l=this.value(e.Target),a=Q(t??this.options.vertexType??W(s)),h=[a];i.includes("Tagged")&&h.push(Q(r??this.options.tagType??W(this.value(e.Tag))));let c=L("QuikGraph."+i+"`"+h.length,h),p="";["EquatableEdge","TaggedEdge","TaggedUndirectedEdge"].includes(i)&&(p="Edge`1+"),i==="EquatableUndirectedEdge"&&(p="UndirectedEdge`1+"),i==="EquatableTaggedEdge"&&(p="Edge`1+"),i==="TaggedUndirectedEdge"&&(p="UndirectedEdge`1+"),i==="EquatableTermEdge"&&(p="TermEdge`1+");let u={[p+M("Source")]:s,[p+M("Target")]:l},g={[p+M("Source")]:je(a),[p+M("Target")]:je(a)};i.includes("Tagged")&&(u.TagChanged=null,u._tag=this.value(e.Tag),g._tag=je(h[1])),i.includes("Term")&&(u[p+M("SourceTerminal")]=e.SourceTerminal,u[p+M("TargetTerminal")]=e.TargetTerminal,g[p+M("SourceTerminal")]=q(_.Int32),g[p+M("TargetTerminal")]=q(_.Int32));let b=J(c,u,g);return this.memo.set(e,b),b}list(e,t,r=L("System.Collections.Generic.List`1",[t],ne)){let i=St(e,t),s={_items:i,_size:e.length,_version:e.length},l={_size:q(_.Int32),_version:q(_.Int32)};if(r.library===Tt)for(let a of["_items","_size","_version"])s["List`1+"+a]=s[a],l[a]&&(l["List`1+"+a]=l[a]);return J(r,s,l)}dictionary(e,t,r,i=L("System.Collections.Generic.Dictionary`2",[t,r],ne)){let s=L("System.Collections.Generic.KeyValuePair`2",[t,r],ne),l=e.map(([c,p])=>J(s,{key:c,value:p},{key:je(t),value:je(r)})),a=t.name.startsWith("System.")||t.name.includes(".Equatable")||t.name.includes(".SEquatable"),h=J(L("System.Collections.Generic."+(a?"GenericEqualityComparer":"ObjectEqualityComparer")+"`1",[t],ne),{});return J(i,{Version:e.length,Comparer:h,HashSize:e.length?Math.max(3,e.length*2+1):0,KeyValuePairs:St(l,s)},{Version:q(_.Int32),HashSize:q(_.Int32)})}graph(e){let t=e.constructor.name,r=Array.from(e.Vertices),i=Array.from(e.Edges),s=r.map(m=>this.value(m)),l=ve.get(e),a=l?_r(l.TypeName):[],h=Q(this.options.vertexType??(t==="BidirectionalMatrixGraph"?F("System.Int32"):a[0])??(s.length?s.every(m=>typeof m=="number")?F(s.some(m=>!Number.isInteger(m)||m<-2147483648||m>2147483647)?"System.Double":"System.Int32"):W(s[0]):F("System.Int32")));for(let m of s)if(h.name!=="System.Object"&&!(h.name==="System.Double"&&typeof m=="number")&&W(m).name!==h.name)throw new TypeError("All vertices must match vertexType");let c=i.filter(m=>m.constructor.name.includes("Tagged")).map(m=>m.Tag),p=c.length&&c.every(m=>typeof m=="number")?F(c.some(m=>!Number.isInteger(m)||m<-2147483648||m>2147483647)?"System.Double":"System.Int32"):void 0,u=m=>Ir.has(m.constructor?.name)?this.edge(m,h,p):this.value(m),g=Q(this.options.edgeType??(t==="BidirectionalMatrixGraph"?a[0]:a[1])??(i.length?W(u(t==="ReversedBidirectionalGraph"?i[0].OriginalEdge:i[0])):L("QuikGraph.EquatableEdge`1",[h])));!this.options.edgeType&&!a[1]&&new Set(i.map(m=>m.constructor.name)).size>1&&(g=L("QuikGraph.IEdge`1",[h]));let b=t==="CompressedSparseRowGraph"?[h]:t==="BidirectionalMatrixGraph"?[g]:[h,g],E=L("QuikGraph."+t+"`"+b.length,b),S=J(E,{});this.memo.set(e,S);let x=S.Members,k=S.MemberTypes,f=(m,U,et)=>{x[m]=U,et&&(k[m]=q(et))},A=m=>this.memo.get(m)??u(m),B=i.map(A),X=m=>St(m.map(A),g),j=L("QuikGraph.Collections.EdgeList`2",[h,g]),Ae=m=>this.list(m.map(A),g,j),Je=L("QuikGraph.Collections.IEdgeList`2",[h,g]),Ge=m=>this.dictionary(m,h,Je,L("QuikGraph.Collections.VertexEdgeDictionary`2",[h,g])),qe=()=>{f(M("AllowParallelEdges"),e.AllowParallelEdges,_.Boolean),f(M("EdgeCount"),e.EdgeCount,_.Int32)};if(["ReversedBidirectionalGraph","UndirectedBidirectionalGraph"].includes(t))f(t==="UndirectedBidirectionalGraph"?"OriginalGraph":M("OriginalGraph"),this.value(e.OriginalGraph));else if(t==="BidirectionalAdapterGraph")f("_baseGraph",this.value(e.OriginalGraph)),f("_inEdges",this.dictionary(r.map(m=>[this.value(m),Ae(e.InEdges(m))]),h,j));else if(t==="ClusteredAdjacencyGraph"){f(M("Parent"),e.Parent?this.value(e.Parent):null),f(M("Wrapped"),this.value(e.Wrapped)),f(M("Collapsed"),e.Collapsed,_.Boolean);let m=F("QuikGraph.IClusteredGraph",Tt);f("_clusters",this.list(e.Clusters.map(U=>this.value(U)),m))}else if(t==="CompressedSparseRowGraph"){let m=L("QuikGraph.CompressedSparseRowGraph`1+Range",[h]),U=0,et=[],Zr=[];for(let Jr of r){let Cn=e.OutEdges(Jr);Zr.push([this.value(Jr),J(m,{Start:U,End:U+Cn.length},{Start:q(_.Int32),End:q(_.Int32)})]),U+=Cn.length,et.push(...Cn.map(ls=>this.value(ls.Target)))}f("_outEdges",St(et,h)),f("_outEdgeStartRanges",this.dictionary(Zr,h,m))}else if(t==="BidirectionalMatrixGraph"){f(M("VertexCount"),e.VertexCount,_.Int32),f(M("EdgeCount"),e.EdgeCount,_.Int32);let m=Array(e.VertexCount**2).fill(null);for(let U of i)m[U.Source*e.VertexCount+U.Target]=A(U);f("_edges",new v(m,{lengths:[e.VertexCount,e.VertexCount],arrayType:2,elementType:je(g)}));for(let U of["EdgeAdded","EdgeRemoved"])f(U,null)}else if(t==="EdgeListGraph"){f(M("IsDirected"),e.IsDirected,_.Boolean),f(M("AllowParallelEdges"),e.AllowParallelEdges,_.Boolean),f("_edges",this.dictionary(B.map(m=>[m,m]),g,g,L("QuikGraph.Collections.EdgeEdgeDictionary`2",[h,g])));for(let m of["EdgeAdded","EdgeRemoved"])f(m,null)}else if(t==="UndirectedGraph")f("AllowParallelEdges",e.AllowParallelEdges,_.Boolean),f("EdgeCapacity",e.EdgeCapacity??0,_.Int32),f("AdjacentEdges",Ge(r.map(m=>[this.value(m),Ae(e.AdjacentEdges(m))]))),f("Edges",this.list(B,g));else if(t==="ArrayUndirectedGraph")f("AllowParallelEdges",e.AllowParallelEdges,_.Boolean),f("VertexEdges",this.dictionary(r.map(m=>[this.value(m),X(e.AdjacentEdges(m))]),h,ji(g))),f("Edges",this.list(B,g));else if(t==="ArrayAdjacencyGraph")qe(),f("_vertexOutEdges",this.dictionary(r.map(m=>[this.value(m),X(e.OutEdges(m))]),h,ji(g)));else if(t==="ArrayBidirectionalGraph"){qe();let m=L("QuikGraph.ArrayBidirectionalGraph`2+InOutEdges",[h,g]);f("_vertexEdges",this.dictionary(r.map(U=>[this.value(U),J(m,{[M("OutEdges")]:X(e.OutEdges(U)),[M("InEdges")]:X(e.InEdges(U))})]),h,m))}else{qe(),f(M("EdgeCapacity"),e.EdgeCapacity??0,_.Int32),f(t==="AdjacencyGraph"?"_vertexEdges":"_vertexOutEdges",Ge(r.map(m=>[this.value(m),Ae(e.OutEdges(m))]))),t==="BidirectionalGraph"&&f("_vertexInEdges",Ge(r.map(m=>[this.value(m),Ae(e.InEdges(m))])));for(let m of["VertexAdded","VertexRemoved","EdgeAdded","EdgeRemoved"])f(m,null)}return S}exception(e){let t=e.constructor.name==="Error"?"Exception":e.constructor.name==="TypeError"?"ArgumentException":e.constructor.name==="RangeError"?"ArgumentOutOfRangeException":e.constructor.name==="SyntaxError"?"FormatException":e.constructor.name,r=ve.get(e),i=F(r?.TypeName??(Bi.has(e.constructor.name)?"QuikGraph.":"System.")+t,r?.LibraryName??(Bi.has(e.constructor.name)?Tt:ne)),s=J(i,{});return this.memo.set(e,s),Object.assign(s.Members,r?.Members??{ClassName:i.name,Message:e.message,Data:null,InnerException:null,HelpURL:null,StackTraceString:null,RemoteStackTraceString:null,RemoteStackIndex:0,ExceptionMethod:null,HResult:-2146233088,Source:null,WatsonBuckets:null}),Object.assign(s.MemberTypes,r?.MemberTypes??{RemoteStackIndex:q(_.Int32),HResult:q(_.Int32)}),s.Members.Message=e.message,s.Members.InnerException=e.cause?this.value(e.cause):null,s}};function Ss(n,e={}){return new Fr(e).value(n)}function Ts(n,e={}){return Oi(Ss(n,e),e)}var Ct=class{constructor(e={}){this.Options=e}Serialize(e,t){let r=Ts(e,this.Options);if(t===void 0)return r;if(t?.CanWrite===!1)throw new TypeError("Stream must be writable");if(typeof t?.Write=="function")t.Write(r,0,r.length);else if(typeof t?.write=="function")t.write(r);else throw new TypeError("Stream needs Write or write");return r}Deserialize(e){if(e?.CanRead===!1)throw new TypeError("Stream must be readable");return ws(Cs(e,this.Options),this.Options)}};function Cs(n,e){if(typeof n?.Read=="function"){let t=e.maxBytes??67108864,r=[],i=0;for(;;){let a=new Uint8Array(Math.min(65536,t-i+1)),h=n.Read(a,0,a.length);if(!Number.isInteger(h)||h<0||h>a.length)throw new TypeError("Read must synchronously return a valid byte count");if(h===0)break;if(i+=h,i>t)throw new z("Byte limit exceeded");r.push(a.subarray(0,h))}let s=new Uint8Array(i),l=0;for(let a of r)s.set(a,l),l+=a.length;return s}return typeof n?.ToArray=="function"?n.ToArray():typeof n?.read=="function"?n.read():n}var I=(n,e="value")=>{if(n==null)throw new TypeError(`${e} cannot be null`);return n},Gr=n=>{if(typeof n!="string"||!/^[A-Za-z_][\w.:-]*$/.test(n))throw new TypeError(`Invalid XML name: ${n}`);return n},Xi=n=>n===9||n===10||n===13||n>=32&&n<=55295||n>=57344&&n<=65533||n>=65536&&n<=1114111;function Ur(n){for(let e of n)if(!Xi(e.codePointAt(0)))throw new TypeError("Invalid XML character");return n}function ee(n){return Ur(String(n)).replace(/[&<>"'\r\n\t]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;","\r":"&#13;","\n":"&#10;","	":"&#9;"})[e])}function Wi(n){return Ur(n.replace(/&([^;]*);|&/g,(e,t)=>{let r={amp:"&",lt:"<",gt:">",quot:'"',apos:"'"};if(Object.hasOwn(r,t))return r[t];if(/^#(?:x[0-9a-f]+|[0-9]+)$/i.test(t)){let i=t[1].toLowerCase()==="x"?parseInt(t.slice(2),16):parseInt(t.slice(1),10);if(Xi(i))return String.fromCodePoint(i)}throw new SyntaxError(`Invalid XML entity ${e}`)}))}var $r=n=>typeof n=="string"?n:n?.ReadToEnd?n.ReadToEnd():n?.documentElement?.outerHTML??n?.outerHTML??n?.textContent??String(I(n,"reader")),En=(n,e)=>{if(n==null)return e;if(typeof n=="function")n(e);else if(typeof n.Write=="function")n.Write(e);else if(typeof n.write=="function")n.write(e);else throw new TypeError("Writer must be a callback or expose Write/write");return e},_t=class{constructor(e,t={},r=[],i=""){this.Name=e,this.LocalName=e.split(":").at(-1),this.Attributes=t,this.Children=r,this.Text=i,this.Content=i?[i,...r]:[...r],this.NamespaceURI=""}get Value(){return this.Content.map(e=>typeof e=="string"?e:e.Value).join("")}get textContent(){return this.Value}GetAttribute(e,t){if(t===void 0)return this.Attributes[e]??"";for(let[r,i]of Object.entries(this.Attributes)){let s=r.split(":"),l=s.at(-1),a=s.length>1?this._namespaces?.[s[0]]??"":"";if(l===e&&a===t)return i}return""}getAttribute(e){return this.Attributes[e]??null}Select(e){return this.Children.filter(t=>t.LocalName===e||t.Name===e)}ReadElementContentAsString(e=this.LocalName,t=this.NamespaceURI){if(e!==this.LocalName||t!==this.NamespaceURI)throw new SyntaxError("XML element name or namespace mismatch");return this.Value}};function Sn(n){if(n instanceof _t)return n;let e=$r(n).replace(/^\uFEFF/,"").replace(/\r\n?/g,`
`);Ur(e);let t=new _t("#document"),r=[t],i=0,s=/<!--[^]*?-->|<\?[^]*?\?>|<!\[CDATA\[[^]*?\]\]>|<\/[A-Za-z_][\w.:-]*\s*>|<[A-Za-z_][\w.:-]*(?:\s+[A-Za-z_][\w.:-]*\s*=\s*(?:"[^"<]*"|'[^'<]*'))*\s*\/?>|[^<]+/gy;for(;i<e.length;){s.lastIndex=i;let l=s.exec(e);if(!l)throw new SyntaxError(`Malformed or unsupported XML at ${i}`);let a=l[0];i=s.lastIndex;let h=r.at(-1);if(a.startsWith("<!--")){if(a.slice(4,-3).includes("--"))throw new SyntaxError("Invalid XML comment");continue}if(!a.startsWith("<?")){if(a.startsWith("<![CDATA[")){if(r.length===1)throw new SyntaxError("CDATA outside document");h.Text+=a.slice(9,-3),h.Content.push(a.slice(9,-3));continue}if(a.startsWith("</")){if(r.length===1||r.at(-1).Name!==a.slice(2,-1).trim())throw new SyntaxError("Mismatched XML closing tag");r.pop();continue}if(a.startsWith("<")){let c=a.match(/^<([\w.:-]+)/)[1],p=Object.create(null);for(let b of a.matchAll(/([\w.:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)){if(Object.hasOwn(p,b[1]))throw new SyntaxError("Duplicate XML attribute");p[b[1]]=Wi((b[2]??b[3]).replace(/[\n\t]/g," "))}let u=new _t(c,p);u.IsEmptyElement=a.endsWith("/>"),u._namespaces={...h._namespaces};for(let[b,E]of Object.entries(p))b==="xmlns"?u._namespaces[""]=E:b.startsWith("xmlns:")&&(u._namespaces[b.slice(6)]=E);let g=c.includes(":")?c.split(":")[0]:"";if(g&&!u._namespaces[g])throw new SyntaxError("Unbound XML namespace prefix");u.NamespaceURI=u._namespaces[g]??"",h.Children.push(u),h.Content.push(u),a.endsWith("/>")||r.push(u)}else{if(a.includes("]]>"))throw new SyntaxError("Invalid XML text");if(r.length===1&&a.trim())throw new SyntaxError("Text outside document");let c=Wi(a);h.Text+=c,h.Content.push(c)}}}if(r.length!==1||t.Children.length!==1)throw new SyntaxError("Expected one complete XML document");return t.Children[0]}var cn=class{constructor(){this._parts=[],this._stack=[],this._open=!1}_close(){this._open&&(this._parts.push(">"),this._open=!1)}Write(e){this._close(),this._parts.push(String(e))}write(e){this.Write(e)}WriteStartDocument(){if(this._parts.length)throw new Error("Document already started");this._parts.push('<?xml version="1.0" encoding="utf-8"?>')}WriteStartElement(e,t){this._close(),Gr(e),this._parts.push("<"+e),this._stack.push(e),this._open=!0,t&&this.WriteAttributeString("xmlns",t)}WriteAttributeString(e,...t){if(!this._open)throw new Error("Attributes require an open start tag");Gr(e),this._parts.push(` ${e}="${ee(t.at(-1))}"`)}WriteString(e){this._close(),this._parts.push(ee(e))}WriteValue(e){this.WriteString(e)}WriteEndElement(){if(!this._stack.length)throw new Error("No XML element to close");let e=this._stack.pop();this._open?(this._parts.push("/>"),this._open=!1):this._parts.push(`</${e}>`)}WriteEndDocument(){for(;this._stack.length;)this.WriteEndElement()}Flush(){}ToString(){return this._parts.join("")}toString(){return this.ToString()}},Yi="http://graphml.graphdrawing.org/xmlns",pn=class{constructor(){this.EmitDocumentDeclaration=!1}};function Hr(n,e,t){let r=[...n.Vertices],i=[...n.Edges],s=new D,l=new R,a=new R;r.forEach((c,p)=>{let u=String(e?e(c):p);if(l.has(u))throw new Error(`Duplicate vertex identity ${u}`);l.add(u),s.set(c,u)});let h=new D;return i.forEach((c,p)=>{let u=String(t?t(c):p);if(a.has(u))throw new Error(`Duplicate edge identity ${u}`);if(a.add(u),!s.has(c.Source)||!s.has(c.Target))throw new Error("Edge endpoint does not exist");h.set(c,u)}),{vertices:r,edges:i,ids:s,edgeIds:h}}var Ui=n=>typeof n=="boolean"?"boolean":typeof n=="bigint"?"long":typeof n=="number"?"double":typeof n=="string"||Array.isArray(n)?"string":null;function Ar(n,e,t){let r=n;if(r==null){r={};for(let i of e)if(i&&typeof i=="object")for(let[s,l]of Object.entries(i)){if(s==="Source"||s==="Target"||s.startsWith("_"))continue;let a=Ui(l);a&&(r[s]=a)}}return Object.entries(r).map(([i,s],l)=>{let a=typeof s=="string"?{type:s}:{...s};if(a.property=i,a.name=a.name??i,a.id=a.id??`${t}_${l}`,a.type=a.type??Ui(e.find(h=>h?.[i]!=null)?.[i])??"string",a.scope=t,Object.hasOwn(a,"default")&&(a.default===null||a.type.endsWith("[]")))throw new TypeError("Null and array GraphML defaults are unsupported");if(!["boolean","int","long","float","double","string"].includes(a.type.replace(/\[\]$/,"")))throw new TypeError(`Unsupported GraphML type ${a.type}`);return a})}function gn(n,e){if(e.endsWith("[]")){if(n==null)return"null";let t=Array.from(n,r=>gn(r,e.slice(0,-2)));return t.length?t.join(" ")+" ":""}if(e==="boolean"){if(typeof n!="boolean")throw new TypeError("Expected boolean");return n?"true":"false"}if(e==="long"){if(typeof n=="number"&&!Number.isSafeInteger(n))throw new RangeError("Use BigInt for GraphML long outside safe integer range");let t=BigInt(n);if(t<-(1n<<63n)||t>=1n<<63n)throw new RangeError("GraphML long is outside Int64");return String(t)}if(e==="int"){if(!Number.isInteger(n)||n<-2147483648||n>2147483647)throw new RangeError("GraphML int is outside Int32");return String(n)}if(e==="double"||e==="float"){if(typeof n!="number")throw new TypeError("Expected numeric value");return Number.isNaN(n)?"NaN":n===1/0?"INF":n===-1/0?"-INF":String(n)}if(typeof n!="string")throw new TypeError("Expected string");return n}var Kr=n=>n===""?[]:(n.endsWith(" ")?n.slice(0,-1):n).split(" ");function Fe(n,e){if(e.endsWith("[]"))return n==="null"?null:Kr(n).map(t=>Fe(t,e.slice(0,-2)));if(e==="string")return n;if(e==="boolean"){if(n==="true"||n==="1")return!0;if(n==="false"||n==="0")return!1;throw new SyntaxError("Invalid GraphML boolean")}if(e==="long"){if(!/^[+-]?\d+$/.test(n))throw new SyntaxError("Invalid GraphML long");let t=BigInt(n);if(t<-(1n<<63n)||t>=1n<<63n)throw new RangeError("GraphML long is outside Int64");return t}if(e==="int"){if(!/^[+-]?\d+$/.test(n))throw new SyntaxError("Invalid GraphML int");let t=Number(n);if(t<-2147483648||t>2147483647)throw new RangeError("GraphML int is outside Int32");return t}if(e==="float"||e==="double"){if(n==="NaN")return NaN;if(n==="INF")return 1/0;if(n==="-INF")return-1/0;if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?$/.test(n))throw new SyntaxError("Invalid GraphML number");return e==="float"?Math.fround(Number(n)):Number(n)}throw new TypeError(`Unsupported GraphML type ${e}`)}var Ze=class extends pn{constructor(e={}){super(),this.Options=e,this.EmitDocumentDeclaration=e.emitDocumentDeclaration??!1}Serialize(e,t,r,i){let s=e,l=t,a=this.Options;if(e?.Vertices!=null)l=e,s=null,a={...a,...t},r=a.vertexIdentity,i=a.edgeIdentity;else if(I(s,"writer"),r===null||i===null)throw new TypeError("Identity delegate cannot be null");I(l,"graph");let{vertices:h,edges:c,ids:p,edgeIds:u}=Hr(l,r,i),g=[...Ar(a.graphProperties??{},[l],"graph"),...Ar(a.vertexProperties,h,"node"),...Ar(a.edgeProperties,c,"edge")],b=new R;for(let x of g){if(b.has(x.id))throw new Error(`Duplicate GraphML key ${x.id}`);b.add(x.id)}let E=[];this.EmitDocumentDeclaration&&E.push('<?xml version="1.0" encoding="utf-8"?>'),E.push(`<graphml xmlns="${Yi}">`);for(let x of g){let k=`  <key id="${ee(x.id)}" for="${x.scope}" attr.name="${ee(x.name)}" attr.type="${x.type.endsWith("[]")?"string":x.type}">`;E.push(k+(Object.hasOwn(x,"default")?`<default>${ee(gn(x.default,x.type))}</default>`:"")+"</key>")}let S=(x,k)=>g.filter(f=>f.scope===k).flatMap(f=>{let A=f.get?f.get(x):x?.[f.property];return A===void 0||Object.hasOwn(f,"default")&&Object.is(A,f.default)?[]:A===null&&f.type==="string"?[`<data key="${ee(f.id)}"/>`]:[`<data key="${ee(f.id)}">${ee(gn(A,f.type))}</data>`]}).join("");E.push(`  <graph id="${ee(a.graphId??"G")}" edgedefault="${l.IsDirected?"directed":"undirected"}" parse.nodes="${h.length}" parse.edges="${c.length}" parse.order="nodesfirst" parse.nodeids="free" parse.edgeids="free">${S(l,"graph")}`);for(let x of h)E.push(`    <node id="${ee(p.get(x))}">${S(x,"node")}</node>`);for(let x of c)E.push(`    <edge id="${ee(u.get(x))}" source="${ee(p.get(x.Source))}" target="${ee(p.get(x.Target))}">${S(x,"edge")}</edge>`);return E.push("  </graph>","</graphml>"),En(s,E.join(`
`))}};function _s(n,e={}){let t=$r(n);e.allowLegacy&&(t=t.replace(/<!DOCTYPE\s+graphml\s+SYSTEM\s+(?:"[^"]*"|'[^']*')\s*>/i,""));let r=Sn(t);if(r.LocalName!=="graphml"||r.NamespaceURI!==Yi&&!(e.allowLegacy&&!r.NamespaceURI))throw new SyntaxError("GraphML root/namespace not found");let i=r.Select("graph");if(i.length!==1)throw new SyntaxError("Exactly one GraphML graph is required");let s=i[0];if(s.Children.some(l=>["graph","hyperedge","port"].includes(l.LocalName))||s.Select("node").some(l=>l.Children.some(a=>["graph","port"].includes(a.LocalName))))throw new Error("Nested graphs, hyperedges and ports are not supported by QuikGraph GraphML");if(e.allowLegacy&&!s.GetAttribute("edgedefault")&&(s.Attributes.edgedefault="directed"),!["directed","undirected"].includes(s.GetAttribute("edgedefault")))throw new SyntaxError("Invalid edgedefault");for(let l of[r,s,...s.Children])if(l.NamespaceURI!==r.NamespaceURI)throw new SyntaxError("Inconsistent GraphML namespace");for(let l of s.Children)if(!["node","edge","data","desc"].includes(l.LocalName))throw new SyntaxError("Unknown GraphML graph element");return{root:r,graph:s}}var ze=class extends pn{constructor(e={}){super(),this.Options=e}Deserialize(e,t,r=(s,l)=>Object.keys(l).length?{Id:s,...l}:s,i=(s,l,a,h)=>Object.assign(new $(s,l),h)){let{root:s,graph:l}=_s(e,this.Options),a=l.GetAttribute("edgedefault")==="directed";if(t=t??(a?new Z:new ge),I(r,"vertexFactory"),I(i,"edgeFactory"),t.IsDirected!==a)throw new Error("Graph direction does not match GraphML");let h=new D;for(let x of s.Select("key")){let k=x.GetAttribute("id");if(!k||h.has(k))throw new SyntaxError("Missing or duplicate GraphML key id");let f=x.GetAttribute("for")||"all",A=x.GetAttribute("attr.name"),B=x.GetAttribute("attr.type")||"string";if(!["all","graph","node","edge"].includes(f)||!A||!["boolean","int","long","float","double","string"].includes(B))throw new SyntaxError("Invalid GraphML key declaration");let X=this.Options[f==="node"?"vertexProperties":f==="edge"?"edgeProperties":"graphProperties"],j=Object.entries(X??{}).find(([qe,m])=>(typeof m=="object"?m.name??qe:qe)===A),Ae=j?typeof j[1]=="string"?{type:j[1]}:j[1]:{},Je={scope:f,name:A,property:j?.[0]??A,type:Ae.type??B,set:Ae.set},Ge=x.Select("default");if(Ge.length>1)throw new SyntaxError("Duplicate GraphML default");Ge.length&&(Je.default=Fe(Ge[0].Value,Je.type)),h.set(k,Je)}let c=(x,k)=>{let f=Object.create(null),A=new R;for(let B of h.values())(B.scope===k||B.scope==="all")&&Object.hasOwn(B,"default")&&(f[B.property]=B.default);for(let B of x.Select("data")){let X=B.GetAttribute("key"),j=h.get(X);if(!j||j.scope!==k&&j.scope!=="all")throw new SyntaxError("Unknown or wrongly scoped GraphML key");if(A.has(X))throw new SyntaxError("Duplicate GraphML data key");A.add(X),f[j.property]=B.IsEmptyElement&&j.type==="string"?null:Fe(B.Value,j.type)}return f},p=(x,k,f)=>{if(!(x===null||typeof x!="object"))for(let[A,B]of Object.entries(k)){let X=[...h.values()].find(j=>(j.scope===f||j.scope==="all")&&j.property===A);if(X?.set)X.set(x,B);else if(["__proto__","constructor","prototype"].includes(A))Object.defineProperty(x,A,{value:B,writable:!0,enumerable:!0,configurable:!0});else if(!Reflect.set(x,A,B))throw new TypeError(`Property ${A} is not writable`)}},u=new D,g=[],b=[],E=new R;for(let x of l.Select("node")){let k=x.GetAttribute("id");if(!k||u.has(k))throw new SyntaxError("Missing or duplicate node id");let f=c(x,"node"),A=I(r(k,f),"vertex factory result");p(A,f,"node"),u.set(k,A),g.push(A)}for(let x of l.Select("edge")){let k=u.get(x.GetAttribute("source")),f=u.get(x.GetAttribute("target"));if(k===void 0||f===void 0)throw new SyntaxError("Edge references missing node");let A=x.GetAttribute("id")||String(b.length);if(E.has(A))throw new SyntaxError("Duplicate edge id");E.add(A);let B=x.GetAttribute("directed");if(B&&Fe(B,"boolean")!==a)throw new Error("Mixed directed and undirected edges are unsupported");let X=c(x,"edge"),j=I(i(k,f,A,X),"edge factory result");p(j,X,"edge"),b.push(j)}let S=c(l,"graph");p(t,S,"graph"),t.AddVertexRange(g);for(let x of b)if(!t.AddEdge(x))throw new Error("Destination graph rejected GraphML edge");return t}};function Is(n,e={},t,r){if(I(n,"graph"),I(e,"optionsOrWriter"),typeof e=="string")throw new TypeError("File paths require a host writer callback");if(t===null||r===null)throw new TypeError("Identity delegate cannot be null");return typeof e=="function"||e?.Write||e?.write?new Ze().Serialize(e,n,t,r):new Ze(e).Serialize(n,e)}function ks(n,e,t,r){return arguments.length>=3&&I(n,"graph"),arguments.length>=3||n?.AddVertex?new ze().Deserialize(e,n,t,r):new ze(e).Deserialize(n,e?.graph,e?.vertexFactory,e?.edgeFactory)}function Fs(n,e,t,r,i={}){if(I(n,"graph"),t===null||r===null)throw new TypeError("Factory cannot be null");let s=$r(e),l=i.validateSchema;if(l!=null){if(typeof l!="function")throw new TypeError("validateSchema must be a synchronous function");let a=l.call(i,s);if(a!=null&&typeof a.then=="function"){try{Promise.prototype.then.call(a,void 0,()=>{})}catch{}throw new TypeError("validateSchema returned a Promise or thenable; use DeserializeAndValidateGraphML for asynchronous validation")}if(a===!1||a?.IsValid===!1){let h=new SyntaxError("GraphML schema validation failed");throw Array.isArray(a?.Errors)&&(h.Errors=a.Errors),h}}return new ze(i).Deserialize(s,n,t,r)}var xo=Object.freeze({SerializeToGraphML:Is,DeserializeFromGraphML:ks,DeserializeAndValidateFromGraphML:Fs}),$i={"graphml.dtd":`<!-- ====================================================================== -->
<!-- GRAPHML DTD (flat version) =========================================== -->
<!-- file: graphml.dtd 

            SYSTEM "http://graphml.graphdrawing.org/dtds/graphml.dtd"

            xmlns="http://graphml.graphdrawing.org/xmlns/graphml"
            (consider these urls as examples)

     ====================================================================== -->


<!--============================================================-->
<!-- elements of GRAPHML -->
<!--============================================================-->

<!ELEMENT graphml  ((desc)?,(key)*,((data)|(graph))*)>


<!ELEMENT locator EMPTY>
<!ATTLIST locator 
          xmlns:xlink   CDATA    #FIXED    "http://www.w3.org/TR/2000/PR-xlink-20001220/"
          xlink:href    CDATA    #REQUIRED
          xlink:type    (simple) #FIXED    "simple"
>


<!ELEMENT desc (#PCDATA)>


<!ELEMENT graph    ((desc)?,((((data)|(node)|(edge)|(hyperedge))*)|(locator)))>
<!ATTLIST graph    
          id          ID                    #IMPLIED
          edgedefault (directed|undirected) #REQUIRED
>


<!ELEMENT node   (desc?,(((data|port)*,graph?)|locator))>
<!ATTLIST node   
          id        ID      #REQUIRED
>


<!ELEMENT port ((desc)?,((data)|(port))*)>
<!ATTLIST port
          name    NMTOKEN  #REQUIRED
>


<!ELEMENT edge ((desc)?,(data)*,(graph)?)>
<!ATTLIST edge 
          id         ID           #IMPLIED
          source     IDREF        #REQUIRED
          sourceport NMTOKEN      #IMPLIED
          target     IDREF        #REQUIRED
          targetport NMTOKEN      #IMPLIED
          directed   (true|false) #IMPLIED
>


<!ELEMENT hyperedge  ((desc)?,((data)|(endpoint))*,(graph)?)>
<!ATTLIST hyperedge 
          id     ID      #IMPLIED
>


<!ELEMENT endpoint ((desc)?)>
<!ATTLIST endpoint 
          id    ID             #IMPLIED
          node  IDREF          #REQUIRED
          port  NMTOKEN        #IMPLIED
          type  (in|out|undir) "undir"
>


<!ELEMENT key (#PCDATA)>
<!ATTLIST key 
          id  ID                                            #REQUIRED
          for (graphml|graph|node|edge|hyperedge|port|endpoint|all) "all"
>


<!ELEMENT data  (#PCDATA)>
<!ATTLIST data 
          key      IDREF        #REQUIRED
          id       ID           #IMPLIED
>

<!--==============================================================
     end of graphml.dtd
=================================================================-->`,"graphml.xsd":`<?xml version="1.0"?>
<xs:schema
  targetNamespace="http://graphml.graphdrawing.org/xmlns"
  xmlns="http://graphml.graphdrawing.org/xmlns"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  elementFormDefault="qualified"
  attributeFormDefault="unqualified">

  <xs:annotation>
    <xs:documentation 
      source="http://graphml.graphdrawing.org/"
      xml:lang="en">
      This document defines the GraphML language including GraphML attributes and GraphML parseinfo.
    </xs:documentation>
  </xs:annotation>

  <xs:redefine schemaLocation="http://graphml.graphdrawing.org/xmlns/1.1/graphml-structure.xsd">

    <!-- redefinition as in graphml-attributes.xsd -->
    <xs:attributeGroup name="key.extra.attrib">
      <xs:attributeGroup ref="key.extra.attrib"/>
      <xs:attributeGroup ref="key.attributes.attrib"/>
    </xs:attributeGroup>

    <!-- redefinition as in graphml-parseinfo.xsd -->
    <xs:attributeGroup name="graph.extra.attrib">
      <xs:attributeGroup ref="graph.extra.attrib"/>
      <xs:attributeGroup ref="graph.parseinfo.attrib"/>
    </xs:attributeGroup>

    <xs:attributeGroup name="node.extra.attrib">
      <xs:attributeGroup ref="node.extra.attrib"/>
      <xs:attributeGroup ref="node.parseinfo.attrib"/>
    </xs:attributeGroup>

  </xs:redefine>

  <!-- types as in graphml-attributes.xsd -->
  <xs:simpleType name="key.name.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/(Dokumentation der Attributes Erweiterung; entsprechende Stelle.html)"
        xml:lang="en">
        Simple type for the attr.name attribute of &lt;key&gt;.
        key.name.type is final, that is, it may not be extended
        or restricted.
        key.name.type is a restriction of xs:NMTOKEN
        Allowed values: (no restriction)
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:NMTOKEN"/>

  </xs:simpleType>

  <xs:simpleType name="key.type.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/(Dokumentation der Attributes Erweiterung; entsprechende Stelle.html)"
        xml:lang="en">
        Simple type for the attr.type attribute of &lt;key&gt;.
        key.type.type is final, that is, it may not be extended
        or restricted.
        key.type.type is a restriction of xs:NMTOKEN
        Allowed values: boolean, int, long, float, double, string.
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:NMTOKEN">  
      <xs:enumeration value="boolean"/>
      <xs:enumeration value="int"/>
      <xs:enumeration value="long"/>
      <xs:enumeration value="float"/>
      <xs:enumeration value="double"/>
      <xs:enumeration value="string"/>
    </xs:restriction>

  </xs:simpleType>

  <xs:attributeGroup name="key.attributes.attrib">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Definition of the attribute group key.attributes.attrib.
        This group consists of the two optional attributes
            - attr.name (gives the name for the data function)
            - attr.type ((declares the range of values for the data function)
      </xs:documentation>
    </xs:annotation>

    <xs:attribute name="attr.name" type="key.name.type" use="optional"/>
    <xs:attribute name="attr.type" type="key.type.type" use="optional"/>

  </xs:attributeGroup>

  <!-- types as in graphml-parseinfo.xsd -->
  <xs:annotation>
    <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type definitions for the new graph attributes.
    </xs:documentation>
  </xs:annotation>

  <xs:simpleType name="graph.order.type"  final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.order attribute of &lt;graph&gt;.
        graph.order.type is final, that is, it may not be extended
        or restricted.
        graph.order.type is a restriction of xs:NMTOKEN
        Allowed values: free, nodesfirst, adjacencylist.
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:NMTOKEN">
      <xs:enumeration value="free"/>
      <xs:enumeration value="nodesfirst"/>
      <xs:enumeration value="adjacencylist"/>
    </xs:restriction>

  </xs:simpleType>

  <xs:simpleType name="graph.nodes.type"  final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.nodes attribute of &lt;graph&gt;.
        graph.nodes.type is final, that is, it may not be extended
        or restricted.
        graph.nodes.type is a restriction of xs:nonNegativeInteger
        Allowed values: (no restriction).
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:nonNegativeInteger"/>  

  </xs:simpleType>

  <xs:simpleType name="graph.edges.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.edges attribute of &lt;graph&gt;.
        graph.edges.type is final, that is, it may not be extended
        or restricted.
        graph.edges.type is a restriction of xs:nonNegativeInteger
        Allowed values: (no restriction).
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:nonNegativeInteger"/>  

  </xs:simpleType>

  <xs:simpleType name="graph.maxindegree.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.maxindegree attribute of &lt;graph&gt;.
        graph.maxindegree.type is final, that is, it may not be extended
        or restricted.
        graph.maxindegree.type is a restriction of xs:nonNegativeInteger
        Allowed values: (no restriction).
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:nonNegativeInteger"/>

  </xs:simpleType>

  <xs:simpleType name="graph.maxoutdegree.type" final="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.maxoutdegree attribute of &lt;graph&gt;.
        graph.maxoutdegree.type is final, that is, it may not be extended
        or restricted.
        graph.maxoutdegree.type is a restriction of xs:nonNegativeInteger
        Allowed values: (no restriction).
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:nonNegativeInteger"/>

  </xs:simpleType>

  <xs:simpleType name="graph.nodeids.type"  final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.nodeids attribute of &lt;graph&gt;.
        graph.nodeids.type is final, that is, it may not be extended
        or restricted.
        graph.nodeids.type is a restriction of xs:string
        Allowed values: (no restriction).
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:NMTOKEN">
      <xs:enumeration value="canonical"/>
      <xs:enumeration value="free"/>
    </xs:restriction>

  </xs:simpleType>

  <xs:simpleType name="graph.edgeids.type"  final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.edgeids attribute of &lt;graph&gt;.
        graph.edgeids.type is final, that is, it may not be extended
        or restricted.
        graph.edgeids.type is a restriction of xs:string
        Allowed values: (no restriction).
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:NMTOKEN">
      <xs:enumeration value="canonical"/>
      <xs:enumeration value="free"/>
    </xs:restriction>

  </xs:simpleType>

  <xs:attributeGroup name="graph.parseinfo.attrib">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Definition of the attribute group graph.parseinfo.attrib.
        This group consists of the seven attributes
            - parse.nodeids (fixed to 'canonical' meaning that the id attribute
              of &lt;node&gt; follows the pattern 'n[number]),
            - parse.edgeids (fixed to 'canonical' meaning that the id attribute
              of &lt;edge&gt; follows the pattern 'e[number]),
            - parse.order (required; one of the values 'nodesfirst',
              'adjacencylist' or 'free'),
            - parse.nodes (required; number of nodes in this graph),
            - parse.edges (required; number of edges in this graph),
            - parse.maxindegree (optional; maximal indegree of a node in this graph),
            - parse.maxoutdegree (optional; maximal outdegree of a node in this graph)
      </xs:documentation>
    </xs:annotation>

    <xs:attribute name="parse.nodeids" type="graph.nodeids.type"/>
    <xs:attribute name="parse.edgeids" type="graph.edgeids.type"/>
    <xs:attribute name="parse.order" type="graph.order.type"/>
    <xs:attribute name="parse.nodes" type="graph.nodes.type"/>
    <xs:attribute name="parse.edges" type="graph.edges.type"/>
    <xs:attribute name="parse.maxindegree" type="graph.maxindegree.type" use="optional"/>
    <xs:attribute name="parse.maxoutdegree" type="graph.maxoutdegree.type" use="optional"/>

  </xs:attributeGroup>

  <xs:annotation>
    <xs:documentation 
      source="http://graphml.graphdrawing.org/"
      xml:lang="en">
      Simple type definitions for the new node attributes.
    </xs:documentation>
  </xs:annotation>

  <xs:simpleType name="node.indegree.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.indegree attribute of &lt;node&gt;.
        node.indegree.type is final, that is, it may not be extended
        or restricted.
        node.indegree.type is a restriction of xs:nonNegativeInteger
        Allowed values: (no restriction).
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:nonNegativeInteger"/>  

  </xs:simpleType>

  <xs:simpleType name="node.outdegree.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.outdegree attribute of &lt;node&gt;.
        node.outdegree.type is final, that is, it may not be extended
        or restricted.
        node.outdegree.type is a restriction of xs:nonNegativeInteger
        Allowed values: (no restriction).
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:nonNegativeInteger"/>  

  </xs:simpleType>

  <xs:attributeGroup name="node.parseinfo.attrib">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Definition of the attribute group node.parseinfo.attrib.
        This group consists of two attributes
            - parse.indegree (optional; indegree of this node),
            - parse.outdegree (optional; outdegree of this node).
      </xs:documentation>
    </xs:annotation>

    <xs:attribute name="parse.indegree" type="node.indegree.type" use="optional"/>
    <xs:attribute name="parse.outdegree" type="node.outdegree.type" use="optional"/>

  </xs:attributeGroup>

</xs:schema>`,"graphml-structure.xsd":`<?xml version="1.0"?>
<xs:schema
  targetNamespace="http://graphml.graphdrawing.org/xmlns"
  xmlns="http://graphml.graphdrawing.org/xmlns"
  xmlns:g="http://graphml.graphdrawing.org/xmlns"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  elementFormDefault="qualified"
  attributeFormDefault="unqualified">

  <xs:annotation>
    <xs:documentation
      source="http://graphml.graphdrawing.org/"
      xml:lang="en">
      The schema corresponding to this document defines the structural
      layer of the Graph Markup Language (GraphML).
      Although a DTD is provided, this schema is, together with its extensions
      http://graphml.graphdrawing.org/xmlns/1.1/graphml-attributes.xsd
      and
      http://graphml.graphdrawing.org/xmlns/1.1/graphml-parseinfo.xsd,
      the only normative reference.
    </xs:documentation>
  </xs:annotation>

  <xs:import namespace="http://www.w3.org/1999/xlink" schemaLocation="http://graphml.graphdrawing.org/xmlns/1.1/xlink.xsd">
    <xs:annotation>
      <xs:documentation
        source="???"
        xml:lang="en">
        Get access to the xlink attribute groups for the attributes
        xlink:href and xlink:type of locator.type.
      </xs:documentation>
    </xs:annotation>
  </xs:import>

  <xs:annotation>
    <xs:documentation
      source="http://graphml.graphdrawing.org/"
      xml:lang="en">
      The attribute groups &lt;element_name&gt;.extra.attrib may be used
      for adding user defined attributes to the elements
      &lt;element_name&gt;.
      The attribute group common.extra.attrib may be used for adding
      user defined attributes to all elements.
    </xs:documentation>
  </xs:annotation>

  <xs:attributeGroup name="common.extra.attrib"/>

  <xs:attributeGroup name="graphml.extra.attrib">
    <xs:attributeGroup ref="common.extra.attrib"/>
  </xs:attributeGroup>

  <xs:attributeGroup name="data.extra.attrib">
    <xs:attributeGroup ref="common.extra.attrib"/>
  </xs:attributeGroup>

  <xs:attributeGroup name="key.extra.attrib">
    <xs:attributeGroup ref="common.extra.attrib"/>
  </xs:attributeGroup>

  <xs:attributeGroup name="default.extra.attrib">
    <xs:attributeGroup ref="common.extra.attrib"/>
  </xs:attributeGroup>

  <xs:attributeGroup name="graph.extra.attrib">
    <xs:attributeGroup ref="common.extra.attrib"/>
  </xs:attributeGroup>

  <xs:attributeGroup name="node.extra.attrib">
    <xs:attributeGroup ref="common.extra.attrib"/>
  </xs:attributeGroup>

  <xs:attributeGroup name="edge.extra.attrib">
    <xs:attributeGroup ref="common.extra.attrib"/>
  </xs:attributeGroup>

  <xs:attributeGroup name="port.extra.attrib">
    <xs:attributeGroup ref="common.extra.attrib"/>
  </xs:attributeGroup>

  <xs:attributeGroup name="hyperedge.extra.attrib">
    <xs:attributeGroup ref="common.extra.attrib"/>
  </xs:attributeGroup>

  <xs:attributeGroup name="endpoint.extra.attrib">
    <xs:attributeGroup ref="common.extra.attrib"/>
  </xs:attributeGroup>

  <xs:attributeGroup name="locator.extra.attrib">
    <xs:attributeGroup ref="common.extra.attrib"/>
  </xs:attributeGroup>

  <xs:annotation>
    <xs:documentation
      source="http://graphml.graphdrawing.org/"
      xml:lang="en">
      Complex type definitions for the GraphML structural layer elements:
      &lt;data&gt;, &lt;default&gt;, &lt;key&gt;, &lt;graphml&gt;, &lt;graph&gt;,
      &lt;node&gt;, &lt;port&gt;,
      &lt;edge&gt;, &lt;hyperedge&gt;, &lt;endpoint&gt; and &lt;locator&gt;.
      The names of the complex types are constructed corresponding
      to the pattern element_name.type.
      (The only remaining GraphML structural layer element
      &lt;desc&gt; is of simple type xs:string.)
    </xs:documentation>
  </xs:annotation>

  <xs:complexType name="data-extension.type" mixed="true">
    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Extension mechanism for the content of &lt;data&gt; and &lt;default&gt;.
        The complex type data-extension.type is empty per default.
        Users may redefine this type in order to add content to
        the complex types data.type and default.type which are
        extensions of data-extension.type.
      </xs:documentation>
    </xs:annotation>
  </xs:complexType>

  <xs:complexType name="data.type" final="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Complex type for the &lt;data&gt; element.
        data.type is mixed, that is, &lt;data&gt; may contain #PCDATA.
        Content type: extension of data-extension.type which is empty
        per default.
      </xs:documentation>
    </xs:annotation>

    <xs:complexContent mixed="true">
      <xs:extension base="data-extension.type">
        <xs:attribute name="key" type="xs:NMTOKEN" use="required">
          <xs:annotation>
            <xs:documentation
              source="http://graphml.graphdrawing.org/"
              xml:lang="en">refers to the id attribute of a &lt;key&gt;.
            </xs:documentation>
          </xs:annotation>
        </xs:attribute>
        <xs:attribute name="time" type="xs:long" default="0">
          <xs:annotation>
            <xs:documentation
              source="http://graphml.graphdrawing.org/"
              xml:lang="en">
            </xs:documentation>
          </xs:annotation>
        </xs:attribute>
        <xs:attribute name="id" type="xs:NMTOKEN" use="optional">
          <xs:annotation>
            <xs:documentation
              source="http://graphml.graphdrawing.org/"
              xml:lang="en">identifies this &lt;data&gt;.
            </xs:documentation>
          </xs:annotation>
        </xs:attribute>
        <xs:attributeGroup ref="data.extra.attrib">
          <xs:annotation>
            <xs:documentation
              source="http://graphml.graphdrawing.org/"
              xml:lang="en">user defined extra attributes for &lt;data&gt; elements.
            </xs:documentation>
          </xs:annotation>
        </xs:attributeGroup>
      </xs:extension>
    </xs:complexContent>

  </xs:complexType>

  <xs:complexType name="default.type" final="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Complex type for the &lt;default&gt; element.
        default.type is mixed, that is, data may contain #PCDATA.
        Content type: extension of data-extension.type which is empty
        per default.
      </xs:documentation>
    </xs:annotation>

    <xs:complexContent mixed="true">
      <xs:extension base="data-extension.type">
        <xs:attributeGroup ref="default.extra.attrib">
          <xs:annotation>
            <xs:documentation
              source="http://graphml.graphdrawing.org/"
              xml:lang="en">user defined extra attributes for &lt;default&gt; elements.
            </xs:documentation>
          </xs:annotation>
        </xs:attributeGroup>
      </xs:extension>
    </xs:complexContent>

  </xs:complexType>

  <xs:simpleType name="key.for.type" final="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the for attribute of &lt;key&gt;.
        key.for.type is a restriction of xs:NMTOKEN
        Allowed values: all, graphml, graph, node, edge, hyperedge, port and endpoint.
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:NMTOKEN">
      <xs:enumeration value="all"/>
      <xs:enumeration value="graphml"/>
      <xs:enumeration value="graph"/>
      <xs:enumeration value="node"/>
      <xs:enumeration value="edge"/>
      <xs:enumeration value="hyperedge"/>
      <xs:enumeration value="port"/>
      <xs:enumeration value="endpoint"/>
    </xs:restriction>

  </xs:simpleType>

  <xs:complexType name="key.type" final="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Complex type for the &lt;key&gt; element.
      </xs:documentation>
    </xs:annotation>

    <xs:sequence>
      <xs:element ref="desc" minOccurs="0"/>
      <xs:element ref="default" minOccurs="0"/>
    </xs:sequence>

    <xs:attribute name="id" type="xs:NMTOKEN" use="required">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">identifies this &lt;key&gt;.
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

    <xs:attribute name="dynamic" type="xs:boolean" default="false">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

    <xs:attribute name="for" type="key.for.type" default="all">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Describes the domain of definition for
          the corresponding graph attribute.
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

    <xs:attributeGroup ref="key.extra.attrib">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          user defined extra attributes for &lt;key&gt; elements.
        </xs:documentation>
      </xs:annotation>
    </xs:attributeGroup>

  </xs:complexType>

  <xs:complexType name="graphml.type" final="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Complex type for the &lt;graphml&gt; element.
      </xs:documentation>
    </xs:annotation>

    <xs:sequence>
      <xs:element ref="desc" minOccurs="0"/>
      <xs:element ref="key" minOccurs="0" maxOccurs="unbounded"/>
      <xs:sequence>
        <xs:choice minOccurs="0" maxOccurs="unbounded">
          <xs:element ref="graph"/>
          <xs:element ref="data"/>
        </xs:choice>
      </xs:sequence>
    </xs:sequence>

    <xs:attributeGroup ref="graphml.extra.attrib">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          user defined extra attributes for &lt;graphml&gt; elements.
        </xs:documentation>
      </xs:annotation>
    </xs:attributeGroup>

  </xs:complexType>

  <xs:simpleType name="graph.edgedefault.type" final="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the edgedefault attribute of &lt;graph&gt;.
        graph.edgedefault.type is a restriction of xs:NMTOKEN
        Allowed values: directed, undirected.
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:NMTOKEN">
      <xs:enumeration value="directed"/>
      <xs:enumeration value="undirected"/>
    </xs:restriction>

  </xs:simpleType>

  <xs:complexType name="graph.type" final="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Complex type for the &lt;graph&gt; element.
      </xs:documentation>
    </xs:annotation>

    <xs:sequence>
      <xs:element ref="desc" minOccurs="0"/>
      <xs:choice>
        <xs:sequence>
          <xs:choice minOccurs="0" maxOccurs="unbounded">
            <xs:element ref="data"/>
            <xs:element ref="node"/>
            <xs:element ref="edge"/>
            <xs:element ref="hyperedge"/>
          </xs:choice>
        </xs:sequence>
        <xs:element ref="locator"/>
      </xs:choice>
    </xs:sequence>

    <xs:attributeGroup ref="graph.extra.attrib">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          user defined extra attributes for &lt;graph&gt; elements.
        </xs:documentation>
      </xs:annotation>
    </xs:attributeGroup>

    <xs:attribute name="id" type="xs:NMTOKEN" >
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          identifies this graph.
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

    <xs:attribute name="edgedefault" type="graph.edgedefault.type" use="required">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          describes whether edges of this graph are considered
          as directed or undirected per default (unless
          specified by the attribute directed of &lt;edge&gt;).
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

  </xs:complexType>

  <xs:complexType name="node.type" final="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Complex type for the &lt;node&gt; element.
      </xs:documentation>
    </xs:annotation>

    <xs:sequence>
      <xs:element ref="desc" minOccurs="0"/>
      <xs:choice>
        <xs:sequence>
          <xs:choice minOccurs="0" maxOccurs="unbounded">
            <xs:element ref="data"/>
            <xs:element ref="port"/>
          </xs:choice>
          <xs:element ref="graph" minOccurs="0"/>
        </xs:sequence>
        <xs:element ref="locator"/>
      </xs:choice>
    </xs:sequence>

    <xs:attributeGroup ref="node.extra.attrib">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          user defined extra attributes for &lt;node&gt; elements.
        </xs:documentation>
      </xs:annotation>
    </xs:attributeGroup>

    <xs:attribute name="id" type="xs:NMTOKEN" use="required">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          identifies this node.
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

  </xs:complexType>

  <xs:complexType name="port.type" final="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Complex type for the &lt;port&gt; element.
      </xs:documentation>
    </xs:annotation>

    <xs:sequence>
      <xs:element ref="desc" minOccurs="0" />
      <xs:choice minOccurs="0" maxOccurs="unbounded">
        <xs:element ref="data" />
        <xs:element ref="port" />
      </xs:choice>
    </xs:sequence>

    <xs:attributeGroup ref="port.extra.attrib"> 
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          user defined extra attributes for &lt;port&gt; elements.
        </xs:documentation>
      </xs:annotation>
    </xs:attributeGroup>

    <xs:attribute name="name" type="xs:NMTOKEN" use="required">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          identifies this port, within the node it is contained in.
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

  </xs:complexType>

  <xs:complexType name="edge.type" final="#all">
    <xs:annotation>
      <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
        Complex type for the &lt;edge> element.
      </xs:documentation>
    </xs:annotation>

    <xs:sequence>
      <xs:element ref="desc" minOccurs="0"/>
      <xs:element ref="data" minOccurs="0" maxOccurs="unbounded"/>
      <xs:element ref="graph" minOccurs="0"/>
    </xs:sequence>

    <xs:attributeGroup ref="edge.extra.attrib">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          user defined extra attributes for &lt;edge&gt; elements.
        </xs:documentation>
      </xs:annotation>
    </xs:attributeGroup>

    <xs:attribute name="id" type="xs:NMTOKEN" >
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          identifies this edge.
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

    <xs:attribute name="directed" type="xs:boolean">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          overwrites the edgedefault attribute of &lt;graph&gt;.
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

    <xs:attribute name="source" type="xs:NMTOKEN" use="required">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          points to the id attribute of the source &lt;node&gt;.
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

    <xs:attribute name="target" type="xs:NMTOKEN" use="required">
      <xs:annotation>
        <xs:documentation
           source="http://graphml.graphdrawing.org/"
           xml:lang="en">
           points to the id attribute of the target &lt;node&gt;.
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

    <xs:attribute name="sourceport" type="xs:NMTOKEN">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          points to the name attribute of the source &lt;port&gt;.
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

    <xs:attribute name="targetport" type="xs:NMTOKEN">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          points to the name attribute of the target &lt;port&gt;.
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

  </xs:complexType>

  <xs:complexType name="hyperedge.type" final="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Complex type for the &lt;hyperedge&gt; element.
      </xs:documentation>
    </xs:annotation>

    <xs:sequence>
      <xs:element ref="desc" minOccurs="0" />
      <xs:choice minOccurs="0" maxOccurs="unbounded">
        <xs:element ref="data" />
        <xs:element ref="endpoint" />
      </xs:choice>
      <xs:element ref="graph" minOccurs="0" />
    </xs:sequence>

    <xs:attributeGroup ref="hyperedge.extra.attrib"> 
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          user defined extra attributes for &lt;hyperedge&gt; elements.
        </xs:documentation>
      </xs:annotation>
    </xs:attributeGroup>

    <xs:attribute name="id" type="xs:NMTOKEN" >
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          identifies this &lt;hyperedge&gt;.
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

  </xs:complexType>

  <xs:simpleType name="endpoint.type.type" final="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the type attribute of &lt;endpoint&gt;.
        endpoint.type.type is a restriction of xs:NMTOKEN
        Allowed values: in, out, undir.
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:NMTOKEN">
      <xs:enumeration value="in"/>
      <xs:enumeration value="out"/>
      <xs:enumeration value="undir"/>
    </xs:restriction>

  </xs:simpleType>

  <xs:complexType name="endpoint.type" final="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Complex type for the &lt;endpoint&gt; element.
      </xs:documentation>
    </xs:annotation>

    <xs:sequence>
      <xs:element ref="desc" minOccurs="0" />
    </xs:sequence>

    <xs:attributeGroup ref="endpoint.extra.attrib"> 
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          user defined extra attributes for &lt;endpoint&gt; elements.
        </xs:documentation>
      </xs:annotation>
    </xs:attributeGroup>

    <xs:attribute name="id" type="xs:NMTOKEN">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          identifies this &lt;endpoint&gt;.
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

    <xs:attribute name="port" type="xs:NMTOKEN">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          points to the name of the port, to which this endpoint is connected.
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

    <xs:attribute name="node" type="xs:NMTOKEN" use="required">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en"> 
          points to the id of the node, to which this endpoint is connected.
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

    <xs:attribute name="type" type="endpoint.type.type" default="undir">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          defines the direction on this endpoint (undirected per default).
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

  </xs:complexType>

  <xs:complexType name="locator.type" final="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Complex type for the &lt;locator&gt; element.
        Content type: (empty)
      </xs:documentation>
    </xs:annotation>

    <xs:attributeGroup ref="locator.extra.attrib">
       <xs:annotation>
         <xs:documentation
           source="http://graphml.graphdrawing.org/"
           xml:lang="en">
           user defined extra attributes for &lt;locator&gt; elements.
         </xs:documentation>
       </xs:annotation>
    </xs:attributeGroup>

    <xs:attribute ref="xlink:href" use="required">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          points to the resource of this locator.
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

    <!-- xs:attribute ref="xlink:type" fixed="simple"-->
    <xs:attribute ref="xlink:type">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          type of the hyperlink (fixed as simple).
        </xs:documentation>
      </xs:annotation>
    </xs:attribute>

  </xs:complexType>

<!-- ======================================================== -->

  <xs:element name="desc" type="xs:string" block="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Description: Provides human-readable descriptions for the GraphML
        element containing this &lt;desc&gt; as its first child.
        Occurrence: &lt;key&gt;, &lt;graphml&gt;, &lt;graph&gt;,
        &lt;node&gt;, &lt;port&gt;, &lt;edge&gt;, &lt;hyperedge&gt;, and
        &lt;endpoint&gt;.
      </xs:documentation>
    </xs:annotation>

  </xs:element>

  <xs:element name="locator" type="locator.type" block="#all">
    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Description: Graphs and nodes are declared by the elements
        &lt;graph&gt; and &lt;node&gt;, respectively. The optional
        &lt;locator&gt;-child of these elements point to
        their definition. (If there is no &lt;locator&gt;-child
        the graphs/nodes are defined by their content).
        Occurrence: &lt;graph&gt;, and &lt;node&gt;.
      </xs:documentation>
    </xs:annotation>
  </xs:element>

  <xs:element name="data" type="data.type" block="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Description: In GraphML there may be data-functions attached
        to graphs, nodes, ports, edges, hyperedges and
        endpoint and to the whole collection of
        graphs described by the content of &lt;graphml&gt;.
        These functions are declared by &lt;key> elements
        (children of &lt;graphml&gt;) and defined by &lt;data&gt;
        elements.
        Occurrence: &lt;graphml&gt;, &lt;graph&gt;, &lt;node&gt;, &lt;port&gt;,
        &lt;edge&gt;, &lt;hyperedge&gt;, and &lt;endpoint&gt;.
      </xs:documentation>
    </xs:annotation>

    <xs:unique name="data_data_key_unique">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: uniqueness of the key attributes of &lt;data&gt; children
          of this &lt;data&gt; element.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath="./g:data"/>
      <xs:field xpath="@key"/>
      <xs:field xpath="@time"/>
    </xs:unique>

  </xs:element>

  <xs:element name="key" type="key.type" block="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Description: In GraphML there may be data-functions attached
        to graphs, nodes, ports, edges, hyperedges and
        endpoint and to the whole collection of 
        graphs described by the content of &lt;graphml&gt;.
        These functions are declared by &lt;key&gt; elements
        (children of &lt;graphml&gt;) and defined by &lt;data&gt;
        elements.
        Occurrence: &lt;graphml&gt;.
      </xs:documentation>
    </xs:annotation>

  </xs:element>

  <xs:element name="default" type="default.type" block="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Description: In GraphML there may be data-functions attached
        to graphs, nodes, ports, edges, hyperedges and
        endpoint and to the whole collection of
        graphs described by the content of &lt;graphml&gt;.
        These functions are declared by &lt;key&gt; elements
        (children of &lt;graphml&gt;) and defined by &lt;data&gt;
        elements.
        The (optional) &lt;default&gt; child of &lt;key&gt; gives
        the default value for the corresponding function.
        Occurrence: &lt;key&gt;.
      </xs:documentation>
    </xs:annotation>

  </xs:element>

  <xs:element name="graphml" type="graphml.type" block="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Description: &lt;graphml&gt; is the root element of each GraphML
        document.
        Occurrence: root.
      </xs:documentation>
    </xs:annotation>

    <xs:unique name="graphml_data_key_unique">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: uniqueness of the key attributes of &lt;data&gt; children
          of this &lt;graphml&gt; element.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath="./g:data"/>
      <xs:field xpath="@key"/>
      <xs:field xpath="@time"/>
    </xs:unique>

    <xs:key name="key_id_key">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: existence and uniqueness of the id attributes of 
          each &lt;key&gt; element in this document.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath=".//g:key"/>
      <xs:field xpath="@id"/>
    </xs:key>

    <xs:unique name="graph_id_unique">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: uniqueness of the id attributes of
          each &lt;graph&gt; element in this document.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath=".//g:graph"/>
      <xs:field xpath="@id"/>
    </xs:unique>

    <xs:keyref name="data_key_ref" refer="key_id_key">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: for the key attribute of each &lt;data&gt; in this document,
          the existence of an id attribute of
          &lt;key&gt; which matches the value of it.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath="./g:data"/>
      <xs:field xpath="@key"/>
    </xs:keyref>

  </xs:element>

  <xs:element name="graph" type="graph.type" block="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Description: Describes one graph in this document.
        Occurrence: &lt;graphml&gt;, &lt;node&gt;, &lt;edge&gt;, &lt;hyperedge&gt;.
      </xs:documentation>
    </xs:annotation>

    <xs:unique name="graph_data_key_unique">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: uniqueness of the key attributes of &lt;data&gt; children
          of this &lt;graph&gt; element.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath="./g:data"/>
      <xs:field xpath="@key"/>
      <xs:field xpath="@time"/>
    </xs:unique>

    <xs:key name="node_id_key">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: existence and uniqueness of the id attributes of
          each &lt;node&gt; element in this graph.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath=".//g:node"/>
      <xs:field xpath="@id"/>
    </xs:key>

    <xs:unique name="edge_id_unique">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: uniqueness of the id attributes of
          each &lt;edge&gt; element in this graph.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath=".//g:edge"/>
      <xs:field xpath="@id"/>
    </xs:unique>

    <xs:unique name="hyperedge_id_unique">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: uniqueness of the id attributes of
          each &lt;hyperedge&gt; element in this graph.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath=".//g:hyperedge"/>
      <xs:field xpath="@id"/>
    </xs:unique>

    <xs:unique name="endpoint_id_unique">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: uniqueness of the id attributes of
          each &lt;endpoint&gt; element in this graph.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath=".//g:endpoint"/>
      <xs:field xpath="@id"/>
    </xs:unique>

    <xs:keyref name="edge_source_ref" refer="node_id_key">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: for the source attribute of each &lt;edge&gt; in this graph,
          the existence of an id attribute of
          &lt;node&gt; which matches the value of it.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath=".//g:edge"/>
      <xs:field xpath="@source"/>
    </xs:keyref> 

    <xs:keyref name="edge_target_ref" refer="node_id_key">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: for the target attribute of each &lt;edge&gt; in this graph,
          the existence of an id attribute of
          &lt;node&gt; which matches the value of it.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath=".//g:edge"/>
      <xs:field xpath="@target"/>
    </xs:keyref>

    <xs:keyref name="endpoint_node_ref" refer="node_id_key">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: for the node attribute of each &lt;endpoint&gt; in this graph,
          the existence of an id attribute of
          &lt;node&gt; which matches the value of it.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath=".//g:endpoint"/>
      <xs:field xpath="@node"/>
    </xs:keyref>

  </xs:element>

  <xs:element name="node" type="node.type" block="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Description: Describes one node in the &lt;graph&gt;
        containing this &lt;node&gt;.
        Occurrence: &lt;graph&gt;.
      </xs:documentation>
    </xs:annotation>

    <xs:key name="port_name_key">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: existence and uniqueness of the name attributes of
          each &lt;port&gt; element within this &lt;node&gt;.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath=".//g:port"/>
      <xs:field xpath="@name"/>
    </xs:key>

    <xs:unique name="node_data_key_unique">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: uniqueness of the key attributes of &lt;data&gt; children
          of this &lt;node&gt; element.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath=".//g:data"/>
      <xs:field xpath="@key"/>
      <xs:field xpath="@time"/>
    </xs:unique>

  </xs:element>

  <xs:element name="port" type="port.type" block="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Description: Nodes may be structured by ports; thus edges
        are not only attached to a node but to a certain
        port in this node.
        Occurrence: &lt;node&gt;, &lt;port&gt;.
      </xs:documentation>
    </xs:annotation>

    <xs:unique name="port_data_key_unique">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: uniqueness of the key attributes of &lt;data&gt; children
          of this &lt;port&gt; element.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath="./g:data"/>
      <xs:field xpath="@key"/>
      <xs:field xpath="@time"/>
    </xs:unique>

  </xs:element>

  <xs:element name="edge" type="edge.type" block="#all">
 
    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Description: Describes an edge in the &lt;graph&gt; which contains this
        &lt;edge&gt;.
        Occurrence: &lt;graph&gt;.
      </xs:documentation>
    </xs:annotation>

    <xs:unique name="edge_data_key_unique">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: uniqueness of the key attributes of &lt;data&gt; children
          of this &lt;edge&gt; element.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath="./g:data"/>
      <xs:field xpath="@key"/>
      <xs:field xpath="@time"/>
    </xs:unique>

  </xs:element>

  <xs:element name="hyperedge" type="hyperedge.type" block="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Description: While edges describe relations between two nodes,
        a hyperedge describes a relation between an arbitrary
        number of nodes.
        Occurrence: &lt;graph&gt;.
      </xs:documentation>
    </xs:annotation>

    <xs:unique name="hyperedge_data_key_unique">
      <xs:annotation>
        <xs:documentation
          source="http://graphml.graphdrawing.org/"
          xml:lang="en">
          Ensures: uniqueness of the key attributes of &lt;data&gt; children
          of this &lt;hyperedge&gt; element.
        </xs:documentation>
      </xs:annotation>
      <xs:selector xpath="./g:data"/>
      <xs:field xpath="@key"/>
      <xs:field xpath="@time"/>
    </xs:unique>

  </xs:element>

  <xs:element name="endpoint" type="endpoint.type" block="#all">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Description: The list of &lt;endpoints&gt; within a hyperedge
        points to the nodes contained in this hyperedge.
        Occurrence: &lt;hyperedge>.
      </xs:documentation>
    </xs:annotation>

  </xs:element>

</xs:schema>`,"graphml-attributes.xsd":`<?xml version="1.0"?>
<xs:schema
  targetNamespace="http://graphml.graphdrawing.org/xmlns"
  xmlns="http://graphml.graphdrawing.org/xmlns"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  elementFormDefault="qualified"
  attributeFormDefault="unqualified">

  <xs:annotation>
    <xs:documentation 
      source="http://graphml.graphdrawing.org/"
      xml:lang="en">
      This document defines the attributes extension of the GraphML language.
      It redefines the attribute list of &lt;key&gt; by adding two new 
      attributes:
          - attr.name (gives a name for the data function) and
          - attr.type (declares the range of values for the data function).
      The data values are defined in #PCDATA children of the corresponding
      &lt;data&gt; element.
    </xs:documentation>
  </xs:annotation>

  <xs:redefine schemaLocation="http://graphml.graphdrawing.org/xmlns/1.1/graphml-structure.xsd">

    <xs:annotation>
      <xs:documentation
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Redefinition of file graphml-structure.xsd.
        Extends the attribute group key.extra.attrib (which takes
        part in the attribute list of &lt;key&gt;) by adding the
        attribute group key.attributes.attrib which is defined below.
      </xs:documentation>
    </xs:annotation>

    <xs:attributeGroup name="key.extra.attrib">
      <xs:attributeGroup ref="key.extra.attrib"/>
      <xs:attributeGroup ref="key.attributes.attrib"/>
    </xs:attributeGroup>

  </xs:redefine>

  <xs:simpleType name="key.name.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/(Dokumentation der Attributes Erweiterung; entsprechende Stelle.html)"
        xml:lang="en">
        Simple type for the attr.name attribute of &lt;key&gt;.
        key.name.type is final, that is, it may not be extended
        or restricted.
        key.name.type is a restriction of xs:NMTOKEN
        Allowed values: (no restriction)
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:NMTOKEN"/>

  </xs:simpleType>

  <xs:simpleType name="key.type.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/(Dokumentation der Attributes Erweiterung; entsprechende Stelle.html)"
        xml:lang="en">
        Simple type for the attr.type attribute of &lt;key&gt;.
        key.type.type is final, that is, it may not be extended
        or restricted.
        key.type.type is a restriction of xs:NMTOKEN
        Allowed values: boolean, int, long, float, double, string.
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:NMTOKEN">  
      <xs:enumeration value="boolean"/>
      <xs:enumeration value="int"/>
      <xs:enumeration value="long"/>
      <xs:enumeration value="float"/>
      <xs:enumeration value="double"/>
      <xs:enumeration value="string"/>
    </xs:restriction>

  </xs:simpleType>

  <xs:attributeGroup name="key.attributes.attrib">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Definition of the attribute group key.attributes.attrib.
        This group consists of the two optional attributes
            - attr.name (gives the name for the data function)
            - attr.type ((declares the range of values for the data function)
      </xs:documentation>
    </xs:annotation>

    <xs:attribute name="attr.name" type="key.name.type" use="optional"/>
    <xs:attribute name="attr.type" type="key.type.type" use="optional"/>

  </xs:attributeGroup>

</xs:schema>`,"graphml-parseinfo.xsd":`<?xml version="1.0"?>
<xs:schema
  targetNamespace="http://graphml.graphdrawing.org/xmlns"
  xmlns="http://graphml.graphdrawing.org/xmlns"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  elementFormDefault="qualified"
  attributeFormDefault="unqualified">

  <xs:annotation>
    <xs:documentation 
      source="http://graphml.graphdrawing.org/"
      xml:lang="en">
      This document defines the parseinfo extension of the GraphML language.
      It redefines the attribut list of &lt;graph&gt; by adding 7 new
      attributes:
        - parse.nodeids (fixed to 'canonical' meaning that the id attribute
          of &lt;node> follows the pattern 'n[number]),
        - parse.edgeids (fixed to 'canonical' meaning that the id attribute
          of &lt;edge> follows the pattern 'e[number]),
        - parse.order (required; one of the values 'nodesfirst',
          'adjacencylist' or 'free'),
        - parse.nodes (required; number of nodes in this graph),
        - parse.edges (required; number of edges in this graph),
        - parse.maxindegree (optional; maximal indegree of a node in this graph),
        - parse.maxoutdegree (optional; maximal outdegree of a node in this graph).
          and it redefines the attribute list of node by adding 2 new attributes:
        - parse.indegree (optional; indegree of this node),
        - parse.outdegree (optional; outdegree of this node).
    </xs:documentation>
  </xs:annotation>

  <xs:redefine schemaLocation="http://graphml.graphdrawing.org/xmlns/1.1/graphml-structure.xsd">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Redefinition of file graphml-structure.xsd.
        Extends the attribute group graph.extra.attrib (which takes
        part in the attribute list of &lt;graph&gt;) by adding the
        attribute group graph.parseinfo.attrib which is defined below.
        Extends the attribute group node.extra.attrib (which takes
        part in the attribute list of &lt;node&gt;) by adding the
        attribute group node.parseinfo.attrib which is defined below.
      </xs:documentation>
    </xs:annotation>

    <xs:attributeGroup name="graph.extra.attrib">
      <xs:attributeGroup ref="graph.extra.attrib"/>
      <xs:attributeGroup ref="graph.parseinfo.attrib"/>
    </xs:attributeGroup>

    <xs:attributeGroup name="node.extra.attrib">
      <xs:attributeGroup ref="node.extra.attrib"/>
      <xs:attributeGroup ref="node.parseinfo.attrib"/>
    </xs:attributeGroup>

  </xs:redefine>

  <xs:annotation>
    <xs:documentation 
      source="http://graphml.graphdrawing.org/"
      xml:lang="en">
      Simple type definitions for the new graph attributes.
    </xs:documentation>
  </xs:annotation>

  <xs:simpleType name="graph.order.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.order attribute of &lt;graph&gt;.
        graph.order.type is final, that is, it may not be extended
        or restricted.
        graph.order.type is a restriction of xs:NMTOKEN
        Allowed values: free, nodesfirst, adjacencylist.
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:NMTOKEN">
      <xs:enumeration value="free"/>
      <xs:enumeration value="nodesfirst"/>
      <xs:enumeration value="adjacencylist"/>
    </xs:restriction>

  </xs:simpleType>

  <xs:simpleType name="graph.nodes.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.nodes attribute of &lt;graph&gt;.
        graph.nodes.type is final, that is, it may not be extended
        or restricted.
        graph.nodes.type is a restriction of xs:nonNegativeInteger
        Allowed values: (no restriction).
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:nonNegativeInteger"/>

  </xs:simpleType>

  <xs:simpleType name="graph.edges.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.edges attribute of &lt;graph&gt;.
        graph.edges.type is final, that is, it may not be extended
        or restricted.
        graph.edges.type is a restriction of xs:nonNegativeInteger
        Allowed values: (no restriction).
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:nonNegativeInteger"/>

  </xs:simpleType>

  <xs:simpleType name="graph.maxindegree.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.maxindegree attribute of &lt;graph&gt;.
        graph.maxindegree.type is final, that is, it may not be extended
        or restricted.
        graph.maxindegree.type is a restriction of xs:nonNegativeInteger
        Allowed values: (no restriction).
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:nonNegativeInteger"/>

  </xs:simpleType>

  <xs:simpleType name="graph.maxoutdegree.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.maxoutdegree attribute of &lt;graph&gt;.
        graph.maxoutdegree.type is final, that is, it may not be extended
        or restricted.
        graph.maxoutdegree.type is a restriction of xs:nonNegativeInteger
        Allowed values: (no restriction).
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:nonNegativeInteger"/>

  </xs:simpleType>

  <xs:simpleType name="graph.nodeids.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.nodeids attribute of &lt;graph&gt;.
        graph.nodeids.type is final, that is, it may not be extended
        or restricted.
        graph.nodeids.type is a restriction of xs:string
        Allowed values: (no restriction).
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:NMTOKEN">
      <xs:enumeration value="canonical"/>
      <xs:enumeration value="free"/>
    </xs:restriction>

  </xs:simpleType>

  <xs:simpleType name="graph.edgeids.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.edgeids attribute of &lt;graph&gt;.
        graph.edgeids.type is final, that is, it may not be extended
        or restricted.
        graph.edgeids.type is a restriction of xs:string
        Allowed values: (no restriction).
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:NMTOKEN">
      <xs:enumeration value="canonical"/>
      <xs:enumeration value="free"/>
    </xs:restriction>

  </xs:simpleType>

  <xs:attributeGroup name="graph.parseinfo.attrib">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Definition of the attribute group graph.parseinfo.attrib.
        This group consists of the seven attributes
            - parse.nodeids (fixed to 'canonical' meaning that the id attribute
              of &lt;node&gt; follows the pattern 'n[number]),
            - parse.edgeids (fixed to 'canonical' meaning that the id attribute
              of &lt;edge&gt; follows the pattern 'e[number]),
            - parse.order (required; one of the values 'nodesfirst',
              'adjacencylist' or 'free'),
            - parse.nodes (required; number of nodes in this graph),
            - parse.edges (required; number of edges in this graph),
            - parse.maxindegree (optional; maximal indegree of a node in this graph),
            - parse.maxoutdegree (optional; maximal outdegree of a node in this graph)
      </xs:documentation>
    </xs:annotation>

    <xs:attribute name="parse.nodeids" type="graph.nodeids.type"/>
    <xs:attribute name="parse.edgeids" type="graph.edgeids.type"/>
    <xs:attribute name="parse.order" type="graph.order.type"/>
    <xs:attribute name="parse.nodes" type="graph.nodes.type"/>
    <xs:attribute name="parse.edges" type="graph.edges.type"/>
    <xs:attribute name="parse.maxindegree" type="graph.maxindegree.type" use="optional"/>
    <xs:attribute name="parse.maxoutdegree" type="graph.maxoutdegree.type" use="optional"/>

  </xs:attributeGroup>

  <xs:annotation>
    <xs:documentation 
      source="http://graphml.graphdrawing.org/"
      xml:lang="en">
      Simple type definitions for the new node attributes.
    </xs:documentation>
  </xs:annotation>

  <xs:simpleType name="node.indegree.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.indegree attribute of &lt;node&gt;.
        node.indegree.type is final, that is, it may not be extended
        or restricted.
        node.indegree.type is a restriction of xs:nonNegativeInteger
        Allowed values: (no restriction).
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:nonNegativeInteger"/>

  </xs:simpleType>

  <xs:simpleType name="node.outdegree.type" final="#all">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Simple type for the parse.outdegree attribute of &lt;node&gt;.
        node.outdegree.type is final, that is, it may not be extended
        or restricted.
        node.outdegree.type is a restriction of xs:nonNegativeInteger
        Allowed values: (no restriction).
      </xs:documentation>
    </xs:annotation>

    <xs:restriction base="xs:nonNegativeInteger"/>

  </xs:simpleType>

  <xs:attributeGroup name="node.parseinfo.attrib">

    <xs:annotation>
      <xs:documentation 
        source="http://graphml.graphdrawing.org/"
        xml:lang="en">
        Definition of the attribute group node.parseinfo.attrib.
        This group consists of two attributes
            - parse.indegree (optional; indegree of this node),
            - parse.outdegree (optional; outdegree of this node).
      </xs:documentation>
    </xs:annotation>

    <xs:attribute name="parse.indegree" type="node.indegree.type" use="optional"/>
    <xs:attribute name="parse.outdegree" type="node.outdegree.type" use="optional"/>

  </xs:attributeGroup>

</xs:schema>`,"xlink.xsd":`<?xml version="1.0"?>
<xs:schema
  targetNamespace="http://www.w3.org/1999/xlink"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  elementFormDefault="qualified"
  attributeFormDefault="unqualified">

  <xs:attribute name="type" default="simple">
    <xs:simpleType>
      <xs:restriction base="xs:string">
        <xs:enumeration value="simple"/>
        <xs:enumeration value="extended"/>
        <xs:enumeration value="locator"/>
        <xs:enumeration value="arc"/>
      </xs:restriction>
    </xs:simpleType>
  </xs:attribute>

  <xs:attribute name="href" type="xs:anyURI" />

  <xs:attribute name="role" type="xs:string" />

  <xs:attribute name="arcrole" type="xs:string" />

  <xs:attribute name="title" type="xs:string" />

  <xs:attribute name="show" default="embed">
    <xs:simpleType>
      <xs:restriction base="xs:string">
        <xs:enumeration value="new"/>
        <xs:enumeration value="replace"/>
        <xs:enumeration value="embed"/>
        <xs:enumeration value="other"/>
        <xs:enumeration value="none"/>
      </xs:restriction>
    </xs:simpleType>
  </xs:attribute>

  <xs:attribute name="actuate" default="onLoad">
    <xs:simpleType>
      <xs:restriction base="xs:string">
        <xs:enumeration value="onLoad"/>
        <xs:enumeration value="onRequest"/>
        <xs:enumeration value="other"/>
        <xs:enumeration value="none"/>
      </xs:restriction>
    </xs:simpleType>
  </xs:attribute>

  <xs:attribute name="from" type="xs:string" />

  <xs:attribute name="to" type="xs:string" />

</xs:schema>`},Zi=Object.freeze({GetResource(n){if(!Object.hasOwn($i,n))throw new Error("GraphML schema resource not found");return new TextEncoder().encode($i[n])}});var mn=class{constructor(e){this.Graph=I(e)}Add(e){return this.Graph.AddVertex(I(e))}[Symbol.iterator](){return this.Graph.Vertices[Symbol.iterator]()}GetEnumerator(){return this[Symbol.iterator]()}},fn=class{constructor(e){this.Graph=I(e)}Add(e){return this.Graph.AddVerticesAndEdge(I(e))}[Symbol.iterator](){return this.Graph.Edges[Symbol.iterator]()}GetEnumerator(){return this[Symbol.iterator]()}},It=class{constructor(e=new Z){this.Graph=I(e,"graph"),this.Vertices=new mn(e),this.Edges=new fn(e)}};It.XmlVertexList=mn;It.XmlEdgeList=fn;function As(n,e=void 0,t,r,i="graph",s="node",l="edge",a="",h,c,p){if(I(n,"graph"),n instanceof It)return Gs(n,e);if(e===null)throw new TypeError("writer cannot be null");if(t===null||r===null)throw new TypeError("Identity delegate cannot be null");for(let b of[i,s,l])Gr(b);let u=Hr(n,t,r),g=new cn;g.WriteStartElement(i,I(a)),h&&h(g,n);for(let b of u.vertices)g.WriteStartElement(s),g.WriteAttributeString("id",u.ids.get(b)),c&&c(g,b),g.WriteEndElement();for(let b of u.edges)g.WriteStartElement(l),g.WriteAttributeString("id",u.edgeIds.get(b)),g.WriteAttributeString("source",u.ids.get(b.Source)),g.WriteAttributeString("target",u.ids.get(b.Target)),p&&p(g,b),g.WriteEndElement();return g.WriteEndElement(),En(e,g.ToString())}function Gs(n,e,t={}){if(I(n,"graph"),e===null)throw new TypeError("writer cannot be null");let r=new cn,i=new R;t.emitDocumentDeclaration!==!1&&r.WriteStartDocument(),r.WriteStartElement("graph"),r.WriteAttributeString("xmlns:xsi","http://www.w3.org/2001/XMLSchema-instance");let s=(l,a)=>{if(r.WriteStartElement(l),a==null)r.WriteAttributeString("xsi:nil","true");else if(typeof a=="object"&&!(a instanceof Date)){if(i.has(a))throw new TypeError("XML object graphs cannot contain cycles");if(i.add(a),Array.isArray(a))for(let h of a)s("item",h);else for(let[h,c]of Object.entries(a))!h.startsWith("_")&&typeof c!="function"&&s(h,c);i.delete(a)}else r.WriteString(a instanceof Date?a.toISOString():String(a));r.WriteEndElement()};r.WriteStartElement("vertices");for(let l of n.Vertices)s("vertex",l);r.WriteEndElement(),r.WriteStartElement("edges");for(let l of n.Edges)s("edge",l);return r.WriteEndElement(),r.WriteEndElement(),En(e,r.ToString())}function Dr(n){let e=[],t=[n];for(;t.length;){let r=t.pop();e.push(r),t.push(...r.Children.slice().reverse())}return e}function Hi(n,e,t=!1){if(I(e,"XPath"),!e)throw new TypeError("XPath cannot be empty");if(/[\[\]()@|]/.test(e))throw new TypeError("Complex XPath expressions require a host XPath adapter; use predicate callbacks");let r=e.startsWith("//"),i=e.replace(/^\.?\/+/,"").split("/").filter(Boolean);if(!i.length)return[n];let s=(a,h)=>h==="*"||a.Name===h||a.LocalName===h,l;r?l=Dr(n).filter(a=>s(a,i.shift())):t||e.startsWith("/")?l=s(n,i.shift())?[n]:[]:l=[n];for(let a of i)a!=="."&&(l=l.flatMap(h=>h.Children.filter(c=>s(c,a))));return l}function Ds(n,e=a=>a.LocalName==="graph",t=a=>a.LocalName==="node",r=a=>a.LocalName==="edge",i=()=>new Z,s=a=>a.GetAttribute("id"),l){if(arguments.length>=8){let g=I(i,"namespaceUri");i=s,s=l,l=arguments[7];for(let E of[e,t,r])if(I(E,"XML selector"),E==="")throw new TypeError("XML selector cannot be empty");let b=E=>S=>S.LocalName===E&&S.NamespaceURI===g;e=b(e),t=b(t),r=b(r)}if(l===null)throw new TypeError("edgeFactory cannot be null");let a=Sn(n);for(let g of[e,t,r,i,s])I(g,"XML selector or factory");let h=typeof e=="function"?Dr(a).find(e):Hi(a,e,!0)[0];if(!h)throw new Error("Graph XML element not found");let c=g=>typeof g=="function"?Dr(h).slice(1).filter(g):Hi(h,g),p=I(i(h),"graph factory result"),u=new D;for(let g of c(t)){let b=I(s(g),"vertex factory result");u.set(g.GetAttribute("id"),b),p.AddVertex(b)}for(let g of c(r)){let b=l?l(g):new $(I(u.get(g.GetAttribute("source")),"source vertex"),I(u.get(g.GetAttribute("target")),"target vertex"));p.AddEdge(I(b,"edge factory result"))}return p}function Ps(n,e,t=new Ct){if(I(n,"graph"),I(e,"stream"),e.CanWrite===!1)throw new TypeError("Stream must be writable");if(typeof t?.Serialize!="function")throw new TypeError("Binary adapter must implement Serialize");return t.Serialize(n,e)}function Ns(n,e=new Ct){if(I(n,"stream"),n.CanRead===!1)throw new TypeError("Stream must be readable");if(typeof e?.Deserialize!="function")throw new TypeError("Binary adapter must implement Deserialize");return e.Deserialize(n)}var yo=Object.freeze({SerializeToXml:As,DeserializeFromXml:Ds,SerializeToBinary:Ps,DeserializeFromBinary:Ns}),Ls=(n,e)=>{let t=e===null?null:Array.from(e,i=>typeof i=="boolean"?i?"True":"False":String(i)),r=t===null?"null":t.length?t.join(" ")+" ":"";return n?n.WriteString(r):r},Ki=(n,e)=>{let t=typeof n=="string"?n:n.ReadElementContentAsString();return t==="null"?null:Kr(t).map(r=>e==="string"?r:Fe(e==="boolean"?r.toLowerCase():r,e))},bo=Object.freeze(Object.fromEntries(["Boolean","Int32","Int64","Single","Double","String",""].map(n=>["Write"+n+"Array",Ls]))),Pr=(n,e,t)=>{if(I(n,"reader"),I(e,"localName"),I(t,"namespaceURI"),!e)throw new TypeError("localName cannot be empty");let r=typeof n=="string"?Sn(n):n;return{node:r,value:r.ReadElementContentAsString(e,t)}},Nr={ReadElementAsNullableString(n,e,t){let{node:r,value:i}=Pr(n,e,t);return r.IsEmptyElement?null:i},ReadElementContentAsArray(n,e,t,r=String){let{value:i}=Pr(n,e,t);return i==="null"?null:Kr(i).map(r)}};for(let[n,e]of[["Boolean","boolean"],["Int32","int"],["Int64","long"],["Single","float"],["Double","double"],["String","string"]])Nr["Read"+n+"Array"]=t=>Ki(t,e),Nr["ReadElementContentAs"+n+"Array"]=(t,r,i)=>Ki(Pr(t,r,i).value,e);var wo=Object.freeze(Nr),Eo=Object.freeze({Left:"Left",Center:"Center",Right:"Right"}),So=Object.freeze({Top:"Top",Center:"Center",Bottom:"Bottom"}),To=Object.freeze({Expanded:"Expanded",Collapsed:"Collapsed"}),Co=Object.freeze({True:"True",False:"False",true:"true",false:"false"}),_o=Object.freeze({Visible:"Visible",Hidden:"Hidden",Collapsed:"Collapsed"}),Io=Object.freeze({Normal:"Normal",Italic:"Italic",Oblique:"Oblique"}),ko=Object.freeze({Black:"Black",Bold:"Bold",DemiBold:"DemiBold",ExtraBlack:"ExtraBlack",ExtraBold:"ExtraBold",ExtraLight:"ExtraLight",Heavy:"Heavy",Light:"Light",Medium:"Medium",Normal:"Normal",Regular:"Regular",Semibold:"Semibold",Thin:"Thin",UltraBlack:"UltraBlack",UltraBold:"UltraBold",UltraLight:"UltraLight"}),Fo=Object.freeze({Conditional:"Conditional",Clause:"Clause",Loop:"Loop",Call:"Call"}),Ao=Object.freeze({ArrowHeadSize:"ArrowHeadSize",ArrowHeadWidth:"ArrowHeadWidth",Background:"Background",FontFamily:"FontFamily",FontSize:"FontSize",FontStyle:"FontStyle",FontWeight:"FontWeight",Foreground:"Foreground",HorizontalAlignment:"HorizontalAlignment",Icon:"Icon",Image:"Image",SelectedStroke:"SelectedStroke",ShadowDepth:"ShadowDepth",Shape:"Shape",Stroke:"Stroke",StrokeDashArray:"StrokeDashArray",StrokeThickness:"StrokeThickness",Style:"Style"}),Go=Object.freeze({Node:"Node",Link:"Link"}),Do=Object.freeze({TopToBottom:"TopToBottom",BottomToTop:"BottomToTop",LeftToRight:"LeftToRight",RightToLeft:"RightToLeft"}),Po=Object.freeze({None:"None",Sugiyama:"Sugiyama",ForceDirected:"ForceDirected",DependencyMatrix:"DependencyMatrix"}),xn=class{constructor(e={}){this.Nodes=null,this.Links=null,this.Categories=null,this.Properties=null,this.QualifiedNames=null,this.IdentifierAliases=null,this.Styles=null,this.Paths=null,this.Title=null,this.Background=null,this.BackgroundImage=null,this.GraphDirection="TopToBottom",this.GraphDirectionSpecified=!1,this.Layout="None",this.LayoutSpecified=!1,this.ButterflyMode="True",this.ButterflyModeSpecified=!1,this.NeighborhoodDistance=null,this.ZoomLevel=null,Object.assign(this,e)}WriteXml(e){return wn(this,e)}},yn=class{constructor(e={}){this.Category=null,this.Id=null,this.Category1=null,this.Icon=null,this.Shape=null,this.Style=null,this.HorizontalAlignment="Left",this.HorizontalAlignmentSpecified=!1,this.VerticalAlignment="Top",this.VerticalAlignmentSpecified=!1,this.Description=null,this.Group="Expanded",this.GroupSpecified=!1,this.IsVertical="True",this.IsVerticalSpecified=!1,this.Reference=null,this.Label=null,this.Visibility="Visible",this.VisibilitySpecified=!1,this.Background=null,this.FontSize=0,this.FontSizeSpecified=!1,this.FontFamily=null,this.FontStyle="Normal",this.FontStyleSpecified=!1,this.FontWeight="Black",this.FontWeightSpecified=!1,this.Access=null,this.Assembly=null,this.FilePath=null,this.FunctionTypeFlags=null,this.IsAbstract="True",this.IsAbstractSpecified=!1,this.IsCodeType="True",this.IsCodeTypeSpecified=!1,this.IsHub="True",this.IsHubSpecified=!1,this.IsOverloaded="True",this.IsOverloadedSpecified=!1,this.IsOverridable="True",this.IsOverridableSpecified=!1,this.Language=null,this.Location=null,this.LinesOfCode=0,this.LinesOfCodeSpecified=!1,this.Namespace=null,this.MustImplement=null,this.TypeName=null,this.IsDocumentation="True",this.IsDocumentationSpecified=!1,this.CodeGenSourceName=null,this.CodeGenTargetName=null,this.CodeGenIncoming="True",this.CodeGenIncomingSpecified=!1,this.CodeSchemaProperty_CallSequenceNumber=0,this.CodeSchemaProperty_CallSequenceNumberSpecified=!1,this.CodeSchemaProperty_DisableEnabledErrorHandler="True",this.CodeSchemaProperty_DisableEnabledErrorHandlerSpecified=!1,this.CodeSchemaProperty_DisableEnabledException="True",this.CodeSchemaProperty_DisableEnabledExceptionSpecified=!1,this.CodeSchemaProperty_EndColumn=0,this.CodeSchemaProperty_EndColumnSpecified=!1,this.CodeSchemaProperty_EndLine=0,this.CodeSchemaProperty_EndLineSpecified=!1,this.CodeSchemaProperty_FrameDepth=0,this.CodeSchemaProperty_FrameDepthSpecified=!1,this.CodeSchemaProperty_FrameKind="Conditional",this.CodeSchemaProperty_FrameKindSpecified=!1,this.CodeSchemaProperty_Icon=null,this.CodeSchemaProperty_InstanceTrackingInformation=null,this.CodeSchemaProperty_IsAbstract="True",this.CodeSchemaProperty_IsAbstractSpecified=!1,this.CodeSchemaProperty_IsAnonymous="True",this.CodeSchemaProperty_IsAnonymousSpecified=!1,this.CodeSchemaProperty_IsArray="True",this.CodeSchemaProperty_IsArraySpecified=!1,this.CodeSchemaProperty_IsByReference="True",this.CodeSchemaProperty_IsByReferenceSpecified=!1,this.CodeSchemaProperty_IsCallToThis="True",this.CodeSchemaProperty_IsCallToThisSpecified=!1,this.CodeSchemaProperty_IsConstructor="True",this.CodeSchemaProperty_IsConstructorSpecified=!1,this.CodeSchemaProperty_IsDo="True",this.CodeSchemaProperty_IsDoSpecified=!1,this.CodeSchemaProperty_IsFinal="True",this.CodeSchemaProperty_IsFinalSpecified=!1,this.CodeSchemaProperty_IsFor="True",this.CodeSchemaProperty_IsForSpecified=!1,this.CodeSchemaProperty_IsForEach="True",this.CodeSchemaProperty_IsForEachSpecified=!1,this.CodeSchemaProperty_IsGeneric="True",this.CodeSchemaProperty_IsGenericSpecified=!1,this.CodeSchemaProperty_IsGenericInstance="True",this.CodeSchemaProperty_IsGenericInstanceSpecified=!1,this.CodeSchemaProperty_IsInternal="True",this.CodeSchemaProperty_IsInternalSpecified=!1,this.CodeSchemaProperty_IsHideBySignature="True",this.CodeSchemaProperty_IsHideBySignatureSpecified=!1,this.CodeSchemaProperty_IsOperator="True",this.CodeSchemaProperty_IsOperatorSpecified=!1,this.CodeSchemaProperty_IsOut="True",this.CodeSchemaProperty_IsOutSpecified=!1,this.CodeSchemaProperty_IsParameterArray="True",this.CodeSchemaProperty_IsParameterArraySpecified=!1,this.CodeSchemaProperty_IsPrivate="True",this.CodeSchemaProperty_IsPrivateSpecified=!1,this.CodeSchemaProperty_IsProtected="True",this.CodeSchemaProperty_IsProtectedSpecified=!1,this.CodeSchemaProperty_IsProtectedOrInternal="True",this.CodeSchemaProperty_IsProtectedOrInternalSpecified=!1,this.CodeSchemaProperty_IsPropertyGet="True",this.CodeSchemaProperty_IsPropertyGetSpecified=!1,this.CodeSchemaProperty_IsPropertySet="True",this.CodeSchemaProperty_IsPropertySetSpecified=!1,this.CodeSchemaProperty_IsPrototype="True",this.CodeSchemaProperty_IsPrototypeSpecified=!1,this.CodeSchemaProperty_IsPublic="True",this.CodeSchemaProperty_IsPublicSpecified=!1,this.CodeSchemaProperty_IsSpecialName="True",this.CodeSchemaProperty_IsSpecialNameSpecified=!1,this.CodeSchemaProperty_IsStatic="True",this.CodeSchemaProperty_IsStaticSpecified=!1,this.CodeSchemaProperty_IsUntilLoop="True",this.CodeSchemaProperty_IsUntilLoopSpecified=!1,this.CodeSchemaProperty_IsVirtual="True",this.CodeSchemaProperty_IsVirtualSpecified=!1,this.CodeSchemaProperty_IsWhile="True",this.CodeSchemaProperty_IsWhileSpecified=!1,this.CodeSchemaProperty_PreserveData="True",this.CodeSchemaProperty_PreserveDataSpecified=!1,this.CodeSchemaProperty_SingleInstanceSourceLink="True",this.CodeSchemaProperty_SingleInstanceSourceLinkSpecified=!1,this.CodeSchemaProperty_SingleInstanceTargetLink="True",this.CodeSchemaProperty_SingleInstanceTargetLinkSpecified=!1,this.CodeSchemaProperty_SourceText=null,this.CodeSchemaProperty_StartColumn=0,this.CodeSchemaProperty_StartColumnSpecified=!1,this.CodeSchemaProperty_StartLine=0,this.CodeSchemaProperty_StartLineSpecified=!1,this.CodeSchemaProperty_StatementKind=null,this.CodeSchemaProperty_StatementNumber=0,this.CodeSchemaProperty_StatementNumberSpecified=!1,this.CodeSchemaProperty_StatementType=null,Object.assign(this,e)}},Lr=class{constructor(e={}){this.Ref=null,Object.assign(this,e)}},bn=class{constructor(e={}){this.Category=null,this.Label=null,this.Visibility="Visible",this.VisibilitySpecified=!1,this.Background=null,this.FontSize=0,this.FontSizeSpecified=!1,this.FontFamily=null,this.FontStyle="Normal",this.FontStyleSpecified=!1,this.FontWeight="Black",this.FontWeightSpecified=!1,this.Source=null,this.Target=null,this.Category1=null,this.Stroke=null,this.StrokeDashArray=null,this.Seeder="True",this.SeederSpecified=!1,this.AttractConsumers="True",this.AttractConsumersSpecified=!1,Object.assign(this,e)}},Rr=class{constructor(e={}){this.Ref=null,Object.assign(this,e)}},Vr=class{constructor(e={}){this.Id=null,this.BasedOn=null,this.Label=null,this.Visibility="Visible",this.VisibilitySpecified=!1,this.Background=null,this.FontSize=0,this.FontSizeSpecified=!1,this.FontFamily=null,this.FontStyle="Normal",this.FontStyleSpecified=!1,this.FontWeight="Black",this.FontWeightSpecified=!1,this.Icon=null,this.Shape=null,this.Style=null,this.HorizontalAlignment="Left",this.HorizontalAlignmentSpecified=!1,this.VerticalAlignment="Top",this.VerticalAlignmentSpecified=!1,this.Stroke=null,this.StrokeDashArray=null,this.CanLinkedNodesBeDataDriven=null,this.CanBeDataDriven=null,this.DefaultAction=null,this.IncomingActionLabel=null,this.IsProviderRoot="True",this.IsProviderRootSpecified=!1,this.IsContainment="True",this.IsContainmentSpecified=!1,this.IsTag="True",this.IsTagSpecified=!1,this.NavigationActionLabel=null,this.OutgoingActionLabel=null,this.SourceCategory=null,this.TargetCategory=null,this.Details=null,this.InboundName=null,this.OutboundName=null,Object.assign(this,e)}},Or=class{constructor(e={}){this.Id=null,this.IsReference="True",this.IsReferenceSpecified=!1,this.Label=null,this.DataType=null,this.Description=null,this.Group=null,this.ReferenceTemplate=null,Object.assign(this,e)}},Br=class{constructor(e={}){this.Id=null,this.Label=null,this.ValueType=null,this.Formatter=null,Object.assign(this,e)}},Mr=class{constructor(e={}){this.n=0,this.Uri=null,this.Id=null,Object.assign(this,e)}},jr=class{constructor(e={}){this.Condition=null,this.Setter=null,this.TargetType="Node",this.IsEnabled="True",this.IsEnabledSpecified=!1,this.GroupLabel=null,this.ValueLabel=null,this.ToolTip=null,Object.assign(this,e)}},vr=class{constructor(e={}){this.Expression=null,Object.assign(this,e)}},zr=class{constructor(e={}){this.Property="ArrowHeadSize",this.Value=null,this.Expression=null,Object.assign(this,e)}},qr=class{constructor(e={}){this.Id=null,this.Value=null,Object.assign(this,e)}},Ji={DirectedGraph:{Nodes:{type:"DirectedGraphNode[]",kind:"array",tag:"Node"},Links:{type:"DirectedGraphLink[]",kind:"array",tag:"Link"},Categories:{type:"DirectedGraphCategory[]",kind:"array",tag:"Category"},Properties:{type:"DirectedGraphProperty[]",kind:"array",tag:"Property"},QualifiedNames:{type:"DirectedGraphName[]",kind:"array",tag:"Name"},IdentifierAliases:{type:"DirectedGraphAlias[]",kind:"array",tag:"Alias"},Styles:{type:"DirectedGraphStyle[]",kind:"array",tag:"Style"},Paths:{type:"DirectedGraphPath[]",kind:"array",tag:"Path"},Title:{type:"string",kind:"attribute"},Background:{type:"string",kind:"attribute"},BackgroundImage:{type:"string",kind:"attribute"},GraphDirection:{type:"GraphDirectionEnum",kind:"attribute"},GraphDirectionSpecified:{type:"bool",kind:"ignore"},Layout:{type:"LayoutEnum",kind:"attribute"},LayoutSpecified:{type:"bool",kind:"ignore"},ButterflyMode:{type:"ClrBoolean",kind:"attribute"},ButterflyModeSpecified:{type:"bool",kind:"ignore"},NeighborhoodDistance:{type:"string",kind:"attribute"},ZoomLevel:{type:"string",kind:"attribute"}},DirectedGraphNode:{Category:{type:"DirectedGraphNodeCategory[]",kind:"elements",tag:"Category"},Id:{type:"string",kind:"attribute"},Category1:{type:"string",kind:"attribute",name:"Category"},Icon:{type:"string",kind:"attribute"},Shape:{type:"string",kind:"attribute"},Style:{type:"string",kind:"attribute"},HorizontalAlignment:{type:"HorizontalAlignmentEnum",kind:"attribute"},HorizontalAlignmentSpecified:{type:"bool",kind:"ignore"},VerticalAlignment:{type:"VerticalAlignmentEnum",kind:"attribute"},VerticalAlignmentSpecified:{type:"bool",kind:"ignore"},Description:{type:"string",kind:"attribute"},Group:{type:"GroupEnum",kind:"attribute"},GroupSpecified:{type:"bool",kind:"ignore"},IsVertical:{type:"ClrBoolean",kind:"attribute"},IsVerticalSpecified:{type:"bool",kind:"ignore"},Reference:{type:"string",kind:"attribute"},Label:{type:"string",kind:"attribute"},Visibility:{type:"VisibilityEnum",kind:"attribute"},VisibilitySpecified:{type:"bool",kind:"ignore"},Background:{type:"string",kind:"attribute"},FontSize:{type:"double",kind:"attribute"},FontSizeSpecified:{type:"bool",kind:"ignore"},FontFamily:{type:"string",kind:"attribute"},FontStyle:{type:"FontStyleEnum",kind:"attribute"},FontStyleSpecified:{type:"bool",kind:"ignore"},FontWeight:{type:"FontWeightEnum",kind:"attribute"},FontWeightSpecified:{type:"bool",kind:"ignore"},Access:{type:"string",kind:"attribute"},Assembly:{type:"string",kind:"attribute"},FilePath:{type:"string",kind:"attribute"},FunctionTypeFlags:{type:"string",kind:"attribute"},IsAbstract:{type:"ClrBoolean",kind:"attribute"},IsAbstractSpecified:{type:"bool",kind:"ignore"},IsCodeType:{type:"ClrBoolean",kind:"attribute"},IsCodeTypeSpecified:{type:"bool",kind:"ignore"},IsHub:{type:"ClrBoolean",kind:"attribute"},IsHubSpecified:{type:"bool",kind:"ignore"},IsOverloaded:{type:"ClrBoolean",kind:"attribute"},IsOverloadedSpecified:{type:"bool",kind:"ignore"},IsOverridable:{type:"ClrBoolean",kind:"attribute"},IsOverridableSpecified:{type:"bool",kind:"ignore"},Language:{type:"string",kind:"attribute"},Location:{type:"string",kind:"attribute"},LinesOfCode:{type:"int",kind:"attribute"},LinesOfCodeSpecified:{type:"bool",kind:"ignore"},Namespace:{type:"string",kind:"attribute"},MustImplement:{type:"string",kind:"attribute"},TypeName:{type:"string",kind:"attribute"},IsDocumentation:{type:"ClrBoolean",kind:"attribute"},IsDocumentationSpecified:{type:"bool",kind:"ignore"},CodeGenSourceName:{type:"string",kind:"attribute"},CodeGenTargetName:{type:"string",kind:"attribute"},CodeGenIncoming:{type:"ClrBoolean",kind:"attribute"},CodeGenIncomingSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_CallSequenceNumber:{type:"int",kind:"attribute"},CodeSchemaProperty_CallSequenceNumberSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_DisableEnabledErrorHandler:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_DisableEnabledErrorHandlerSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_DisableEnabledException:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_DisableEnabledExceptionSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_EndColumn:{type:"int",kind:"attribute"},CodeSchemaProperty_EndColumnSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_EndLine:{type:"int",kind:"attribute"},CodeSchemaProperty_EndLineSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_FrameDepth:{type:"int",kind:"attribute"},CodeSchemaProperty_FrameDepthSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_FrameKind:{type:"FrameKindEnum",kind:"attribute"},CodeSchemaProperty_FrameKindSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_Icon:{type:"string",kind:"attribute"},CodeSchemaProperty_InstanceTrackingInformation:{type:"string",kind:"attribute"},CodeSchemaProperty_IsAbstract:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsAbstractSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsAnonymous:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsAnonymousSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsArray:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsArraySpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsByReference:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsByReferenceSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsCallToThis:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsCallToThisSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsConstructor:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsConstructorSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsDo:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsDoSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsFinal:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsFinalSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsFor:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsForSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsForEach:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsForEachSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsGeneric:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsGenericSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsGenericInstance:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsGenericInstanceSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsInternal:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsInternalSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsHideBySignature:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsHideBySignatureSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsOperator:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsOperatorSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsOut:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsOutSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsParameterArray:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsParameterArraySpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsPrivate:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsPrivateSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsProtected:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsProtectedSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsProtectedOrInternal:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsProtectedOrInternalSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsPropertyGet:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsPropertyGetSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsPropertySet:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsPropertySetSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsPrototype:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsPrototypeSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsPublic:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsPublicSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsSpecialName:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsSpecialNameSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsStatic:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsStaticSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsUntilLoop:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsUntilLoopSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsVirtual:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsVirtualSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsWhile:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsWhileSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_PreserveData:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_PreserveDataSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_SingleInstanceSourceLink:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_SingleInstanceSourceLinkSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_SingleInstanceTargetLink:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_SingleInstanceTargetLinkSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_SourceText:{type:"string",kind:"attribute"},CodeSchemaProperty_StartColumn:{type:"int",kind:"attribute"},CodeSchemaProperty_StartColumnSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_StartLine:{type:"int",kind:"attribute"},CodeSchemaProperty_StartLineSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_StatementKind:{type:"string",kind:"attribute"},CodeSchemaProperty_StatementNumber:{type:"int",kind:"attribute"},CodeSchemaProperty_StatementNumberSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_StatementType:{type:"string",kind:"attribute"}},DirectedGraphNodeCategory:{Ref:{type:"string",kind:"attribute"}},DirectedGraphLink:{Category:{type:"DirectedGraphLinkCategory[]",kind:"elements",tag:"Category"},Label:{type:"string",kind:"attribute"},Visibility:{type:"VisibilityEnum",kind:"attribute"},VisibilitySpecified:{type:"bool",kind:"ignore"},Background:{type:"string",kind:"attribute"},FontSize:{type:"double",kind:"attribute"},FontSizeSpecified:{type:"bool",kind:"ignore"},FontFamily:{type:"string",kind:"attribute"},FontStyle:{type:"FontStyleEnum",kind:"attribute"},FontStyleSpecified:{type:"bool",kind:"ignore"},FontWeight:{type:"FontWeightEnum",kind:"attribute"},FontWeightSpecified:{type:"bool",kind:"ignore"},Source:{type:"string",kind:"attribute"},Target:{type:"string",kind:"attribute"},Category1:{type:"string",kind:"attribute",name:"Category"},Stroke:{type:"string",kind:"attribute"},StrokeDashArray:{type:"string",kind:"attribute"},Seeder:{type:"ClrBoolean",kind:"attribute"},SeederSpecified:{type:"bool",kind:"ignore"},AttractConsumers:{type:"ClrBoolean",kind:"attribute"},AttractConsumersSpecified:{type:"bool",kind:"ignore"}},DirectedGraphLinkCategory:{Ref:{type:"string",kind:"attribute"}},DirectedGraphCategory:{Id:{type:"string",kind:"attribute"},BasedOn:{type:"string",kind:"attribute"},Label:{type:"string",kind:"attribute"},Visibility:{type:"VisibilityEnum",kind:"attribute"},VisibilitySpecified:{type:"bool",kind:"ignore"},Background:{type:"string",kind:"attribute"},FontSize:{type:"double",kind:"attribute"},FontSizeSpecified:{type:"bool",kind:"ignore"},FontFamily:{type:"string",kind:"attribute"},FontStyle:{type:"FontStyleEnum",kind:"attribute"},FontStyleSpecified:{type:"bool",kind:"ignore"},FontWeight:{type:"FontWeightEnum",kind:"attribute"},FontWeightSpecified:{type:"bool",kind:"ignore"},Icon:{type:"string",kind:"attribute"},Shape:{type:"string",kind:"attribute"},Style:{type:"string",kind:"attribute"},HorizontalAlignment:{type:"HorizontalAlignmentEnum",kind:"attribute"},HorizontalAlignmentSpecified:{type:"bool",kind:"ignore"},VerticalAlignment:{type:"VerticalAlignmentEnum",kind:"attribute"},VerticalAlignmentSpecified:{type:"bool",kind:"ignore"},Stroke:{type:"string",kind:"attribute"},StrokeDashArray:{type:"string",kind:"attribute"},CanLinkedNodesBeDataDriven:{type:"string",kind:"attribute"},CanBeDataDriven:{type:"string",kind:"attribute"},DefaultAction:{type:"string",kind:"attribute"},IncomingActionLabel:{type:"string",kind:"attribute"},IsProviderRoot:{type:"ClrBoolean",kind:"attribute"},IsProviderRootSpecified:{type:"bool",kind:"ignore"},IsContainment:{type:"ClrBoolean",kind:"attribute"},IsContainmentSpecified:{type:"bool",kind:"ignore"},IsTag:{type:"ClrBoolean",kind:"attribute"},IsTagSpecified:{type:"bool",kind:"ignore"},NavigationActionLabel:{type:"string",kind:"attribute"},OutgoingActionLabel:{type:"string",kind:"attribute"},SourceCategory:{type:"string",kind:"attribute"},TargetCategory:{type:"string",kind:"attribute"},Details:{type:"string",kind:"attribute"},InboundName:{type:"string",kind:"attribute"},OutboundName:{type:"string",kind:"attribute"}},DirectedGraphProperty:{Id:{type:"string",kind:"attribute"},IsReference:{type:"ClrBoolean",kind:"attribute"},IsReferenceSpecified:{type:"bool",kind:"ignore"},Label:{type:"string",kind:"attribute"},DataType:{type:"string",kind:"attribute"},Description:{type:"string",kind:"attribute"},Group:{type:"string",kind:"attribute"},ReferenceTemplate:{type:"string",kind:"attribute"}},DirectedGraphName:{Id:{type:"string",kind:"attribute"},Label:{type:"string",kind:"attribute"},ValueType:{type:"string",kind:"attribute"},Formatter:{type:"string",kind:"attribute"}},DirectedGraphAlias:{n:{type:"byte",kind:"attribute"},Uri:{type:"string",kind:"attribute"},Id:{type:"string",kind:"attribute"}},DirectedGraphStyle:{Condition:{type:"DirectedGraphStyleCondition",kind:"element"},Setter:{type:"DirectedGraphStyleSetter[]",kind:"elements",tag:"Setter"},TargetType:{type:"TargetTypeEnum",kind:"attribute"},IsEnabled:{type:"ClrBoolean",kind:"attribute"},IsEnabledSpecified:{type:"bool",kind:"ignore"},GroupLabel:{type:"string",kind:"attribute"},ValueLabel:{type:"string",kind:"attribute"},ToolTip:{type:"string",kind:"attribute"}},DirectedGraphStyleCondition:{Expression:{type:"string",kind:"attribute"}},DirectedGraphStyleSetter:{Property:{type:"PropertyType",kind:"attribute"},Value:{type:"string",kind:"attribute"},Expression:{type:"string",kind:"attribute"}},DirectedGraphPath:{Id:{type:"string",kind:"attribute"},Value:{type:"string",kind:"attribute"}}},Qi={DirectedGraph:xn,DirectedGraphNode:yn,DirectedGraphNodeCategory:Lr,DirectedGraphLink:bn,DirectedGraphLinkCategory:Rr,DirectedGraphCategory:Vr,DirectedGraphProperty:Or,DirectedGraphName:Br,DirectedGraphAlias:Mr,DirectedGraphStyle:jr,DirectedGraphStyleCondition:vr,DirectedGraphStyleSetter:zr,DirectedGraphPath:qr};function Rs(n,e){if(["double","float","int"].includes(e))return gn(n,e);if(e==="byte"){if(!Number.isInteger(n)||n<0||n>255)throw new RangeError("Expected byte");return String(n)}return String(n)}function Vs(n,e){if(["double","float","int"].includes(e))return Fe(n,e);if(e==="byte"){let t=Fe(n,"int");if(t<0||t>255)throw new RangeError("Expected byte");return t}return n}function wn(n,e){if(I(n,"graph"),e===null)throw new TypeError("writer cannot be null");let t=(r,i,s)=>{let l=Ji[s]??{},a=[],h=[];for(let[c,p]of Object.entries(l)){let u=r[c];if(u!=null&&["array","elements"].includes(p.kind)&&(typeof u=="string"||typeof u[Symbol.iterator]!="function"))throw new TypeError(`DGML ${c} must be an iterable of schema objects`);u==null||p.kind==="ignore"||Object.hasOwn(l,c+"Specified")&&!r[c+"Specified"]||(p.kind==="attribute"?a.push(` ${p.name??c}="${ee(Rs(u,p.type))}"`):p.kind==="array"?h.push(`<${c}>${Array.from(u,g=>t(g,p.tag,p.type.replace("[]",""))).join("")}</${c}>`):p.kind==="elements"?h.push(...Array.from(u,g=>t(g,p.tag,p.type.replace("[]","")))):typeof u=="object"?h.push(t(u,c,p.type)):h.push(`<${c}>${ee(u)}</${c}>`))}return`<${i}${i==="DirectedGraph"?' xmlns="http://schemas.microsoft.com/vs/2009/dgml"':""}${a.join("")}>${h.join("")}</${i}>`};return En(e,t(n,"DirectedGraph","DirectedGraph"))}function Os(n){let e=Sn(n);if(e.LocalName!=="DirectedGraph"||e.NamespaceURI!=="http://schemas.microsoft.com/vs/2009/dgml")throw new SyntaxError("Invalid DGML document");let t=(r,i)=>{let s=new Qi[i],l=Ji[i];for(let[a,h]of Object.entries(l))if(h.kind==="attribute"&&Object.hasOwn(r.Attributes,h.name??a))s[a]=Vs(r.Attributes[h.name??a],h.type),Object.hasOwn(l,a+"Specified")&&(s[a+"Specified"]=!0);else if(h.kind==="array"){let c=r.Select(a)[0];c&&(s[a]=c.Select(h.tag).map(p=>t(p,h.type.replace("[]",""))))}else if(h.kind==="elements")s[a]=r.Select(h.tag).map(c=>t(c,h.type.replace("[]","")));else if(h.kind==="element"){let c=r.Select(a)[0];c&&(s[a]=Qi[h.type]?t(c,h.type):c.Value)}return s};return t(e,"DirectedGraph")}var Wr=class extends $t{constructor(e,t,r){super(e),this.VertexIdentity=I(t,"vertexIdentity"),this.EdgeIdentity=I(r,"edgeIdentity"),this.FormatNode=new O,this.FormatEdge=new O,this.FormatGraph=new O,this.DirectedGraph=null}InternalCompute(){let e=new xn;e.Nodes=Array.from(this.VisitedGraph.Vertices,t=>{this.ThrowIfCancellationRequested();let r=new yn({Id:String(this.VertexIdentity(t))});return this.FormatNode.emit(t,r),r}),e.Links=Array.from(this.VisitedGraph.Edges,t=>{this.ThrowIfCancellationRequested();let r=new bn({Label:String(this.EdgeIdentity(t)),Source:String(this.VertexIdentity(t.Source)),Target:String(this.VertexIdentity(t.Target))});return this.FormatEdge.emit(t,r),r}),this.DirectedGraph=e,this.FormatGraph.emit(this.VisitedGraph,e)}};function es(n,e,t,r,i){I(n,"graph");let s={};e&&typeof e=="object"?s=e:arguments.length===2?(I(e,"verticesColors"),s.vertexColors=e):(s={vertexIdentity:e,edgeIdentity:t,formatNode:r,formatEdge:i},arguments.length>=3&&(I(e,"vertexIdentity"),I(t,"edgeIdentity")));let l=Hr(n,s.vertexIdentity,s.edgeIdentity),a=new Wr(n,h=>l.ids.get(h),h=>l.edgeIds.get(h));return s.vertexColors&&a.FormatNode.add((h,c)=>{c.Background=["White","LightGray","Black"][s.vertexColors(h)]??null}),s.formatNode&&a.FormatNode.add(s.formatNode),s.formatEdge&&a.FormatEdge.add(s.formatEdge),s.formatGraph&&a.FormatGraph.add(s.formatGraph),a.Compute(),a.DirectedGraph}function Bs(n,e,t={}){if(typeof e!="function")throw new TypeError("OpenAsDGML requires a callback receiving (xml, filename)");let r=wn(es(n,t));return e(r,t.filename??"graph.dgml")}var No=Object.freeze({ToDirectedGraphML:es,WriteXml:wn,OpenAsDGML:Bs,DirectedGraphSerializer:Object.freeze({Serialize:wn,Deserialize:Os})});var Yr="quikgraphweb://schemas/graphml/1.1/",rs=["graphml.xsd","graphml-structure.xsd","graphml-attributes.xsd","graphml-parseinfo.xsd","xlink.xsd"],ts=new WeakMap,Ms=new TextEncoder,Qr=new TextDecoder("utf-8",{fatal:!0}),is=Symbol("GraphMLSchemaValidator");function ns(n){if(typeof n=="string")return n;if(n instanceof Uint8Array)return Qr.decode(n);if(n instanceof ArrayBuffer)return Qr.decode(new Uint8Array(n));if(n?.ReadToEnd){let t=n.ReadToEnd();if(typeof t=="string")return t}let e=n?.documentElement?.outerHTML??n?.outerHTML;if(typeof e=="string")return e;throw new TypeError("GraphML input must be XML text, UTF-8 bytes, an XML document, or a synchronous ReadToEnd reader")}function ss(n,e){return Object.freeze((n.details?.length?n.details:[{message:n.message}]).map(t=>Object.freeze({Message:String(t.message??"XML validation failed").trim(),FileName:String(t.file||e),LineNumber:Number(t.line)||0,ColumnNumber:Number(t.col)||0,Severity:t.level===1?"warning":t.level===3?"fatal":"error",Path:t.xpath||null})))}function os(n){return Qr.decode(Zi.GetResource(n)).replace(/schemaLocation="([^"]+)"/g,(t,r)=>{let i=r.split("/").at(-1);if(!rs.includes(i))throw new Error(`Unbundled GraphML schema dependency: ${r}`);return`schemaLocation="${Yr}${i}"`})}function js(n){if(ts.has(n))return;let e=Object.create(null);for(let r of rs)e[Yr+r]=Ms.encode(os(r));let t=new n.XmlBufferInputProvider(e);if(!n.xmlRegisterInputProvider(t))throw new Error("libxml2 could not register the local GraphML schema resolver");ts.set(n,t)}var Tn=class extends SyntaxError{constructor(e,t){super(e.map(r=>`${r.FileName}:${r.LineNumber}:${r.ColumnNumber}: ${r.Message}`).join(`
`),t?{cause:t}:void 0),this.name="GraphMLValidationError",this.Errors=e}},Xr=class{constructor(e,t,r){if(e!==is)throw new TypeError("Use await CreateGraphMLSchemaValidator()");this._engine=t,this._schema=r,this._disposed=!1}get IsDisposed(){return this._disposed}get SchemaNamespace(){return"http://graphml.graphdrawing.org/xmlns"}get SchemaVersion(){return"1.1"}_ensureActive(){if(this._disposed)throw new Error("GraphMLSchemaValidator is disposed")}Validate(e,t={}){this._ensureActive();let r=ns(e),i=String(t.filename??"graph.graphml"),s=this._engine,l;try{return l=s.XmlDocument.fromString(r,{url:i,option:s.ParseOption.XML_PARSE_NONET|s.ParseOption.XML_PARSE_NO_XXE|s.ParseOption.XML_PARSE_BIG_LINES}),this._schema.validate(l),Object.freeze({IsValid:!0,Errors:Object.freeze([])})}catch(a){if(!(a instanceof s.XmlError))throw a;return Object.freeze({IsValid:!1,Errors:ss(a,i)})}finally{l?.dispose()}}ValidateAndThrow(e,t={}){let r=this.Validate(e,t);if(!r.IsValid)throw new Tn(r.Errors);return r}Deserialize(e,t={}){this._ensureActive();let r=ns(e);return this.ValidateAndThrow(r,{filename:t.filename}),new ze(t).Deserialize(r,t.graph,t.vertexFactory,t.edgeFactory)}Serialize(e,t={}){this._ensureActive();let r=new Ze(t).Serialize(e,t);this.ValidateAndThrow(r,{filename:t.filename});let i=t.writer;if(i!=null)if(typeof i=="function")i(r);else if(typeof i.Write=="function")i.Write(r);else if(typeof i.write=="function")i.write(r);else throw new TypeError("writer must be a callback or expose Write/write");return r}Dispose(){this._disposed||(this._disposed=!0,this._schema.dispose(),this._schema=null,this._engine=null)}dispose(){this.Dispose()}[Symbol.dispose??Symbol.for("Symbol.dispose")](){this.Dispose()}};async function as(n={}){if(!n||typeof n!="object")throw new TypeError("options must be an object");if(n.engineLoader!==void 0&&typeof n.engineLoader!="function")throw new TypeError("engineLoader must be a function");let e=await(n.engineLoader?n.engineLoader():n.engineUrl?import(String(n.engineUrl)):import("./vendor/libxml2-wasm.mjs"));for(let r of["XmlDocument","XsdValidator","XmlError","XmlLibError","XmlBufferInputProvider","xmlRegisterInputProvider"])if(!e?.[r])throw new TypeError(`The XML engine does not expose ${r}`);js(e);let t;try{return t=e.XmlDocument.fromString(os("graphml.xsd"),{url:Yr+"graphml.xsd"}),new Xr(is,e,e.XsdValidator.fromDoc(t))}catch(r){throw r instanceof e.XmlLibError?new Tn(ss(r,"graphml.xsd"),r):r}finally{t?.dispose()}}async function Vo(n,e={}){let t=await as(e);try{return t.Validate(n,e)}finally{t.Dispose()}}async function Oo(n,e={}){let t=await as(e);try{return t.Deserialize(n,e)}finally{t.Dispose()}}export{as as CreateGraphMLSchemaValidator,Oo as DeserializeAndValidateGraphML,Xr as GraphMLSchemaValidator,Tn as GraphMLValidationError,Vo as ValidateGraphMLSchema};
//# sourceMappingURL=quikgraphweb-xml-validation.js.map
