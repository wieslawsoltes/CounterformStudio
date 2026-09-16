var _h=Object.defineProperty;var yo=(i,e)=>{for(var t in e)_h(i,t,{get:e[t],enumerable:!0})};function v(i,e){return i===e||i!==i&&e!==e||i!=null&&typeof i.Equals=="function"&&!!i.Equals(e)}var me=globalThis.Map,pt=globalThis.Set,He=i=>i!==null&&(typeof i=="object"||typeof i=="function")&&typeof i.Equals=="function",xs=i=>typeof i.GetHashCode=="function"?i.GetHashCode():void 0;function gt(i){if(i==null||typeof i!="object"&&typeof i!="function")throw new TypeError("Expected a set-like object.");let e=Number(i.size);if(Number.isNaN(e))throw new TypeError("Set-like size must be numeric.");if(Math.trunc(e)<0)throw new RangeError("Set-like size must be nonnegative.");if(typeof i.has!="function"||typeof i.keys!="function")throw new TypeError("Set-like object must provide has() and keys().");return i instanceof _?i:new _({[Symbol.iterator]:()=>i.keys()})}var y=class extends me{constructor(e){if(super(),this._buckets=null,e!=null)for(let[t,n]of e)this.set(t,n)}_canonicalKey(e){if(me.prototype.has.call(this,e)||!He(e))return e;let t=this._buckets?.get(xs(e));if(t){for(let n of t)if(v(n,e))return n}return e}has(e){return me.prototype.has.call(this,e)?!0:He(e)?me.prototype.has.call(this,this._canonicalKey(e)):!1}get(e){return me.prototype.has.call(this,e)||!He(e)?me.prototype.get.call(this,e):me.prototype.get.call(this,this._canonicalKey(e))}set(e,t){if(me.prototype.has.call(this,e)||!He(e))return me.prototype.set.call(this,e,t),this;let n=xs(e);this._buckets??=new me;let s=this._buckets.get(n);if(s){for(let r of s)if(v(r,e))return me.prototype.set.call(this,r,t),this}return s||(s=[],this._buckets.set(n,s)),s.push(e),me.prototype.set.call(this,e,t),this}delete(e){let t=this._canonicalKey(e);if(!me.prototype.delete.call(this,t))return!1;if(He(t)){let n=xs(t),s=this._buckets.get(n);if(s){let r=s.indexOf(t);r>=0&&s.splice(r,1),s.length||this._buckets.delete(n)}}return!0}clear(){me.prototype.clear.call(this),this._buckets?.clear()}},_=class i extends pt{constructor(e){if(super(),this._index=null,e!=null)for(let t of e)this.add(t)}add(e){return He(e)?(this._index??=new y,this._index.has(e)||(this._index.set(e,e),pt.prototype.add.call(this,e)),this):(pt.prototype.add.call(this,e),this)}has(e){return pt.prototype.has.call(this,e)?!0:He(e)&&(this._index?.has(e)??!1)}delete(e){if(!He(e))return pt.prototype.delete.call(this,e);if(!this._index?.has(e))return!1;let t=this._index.get(e);return this._index.delete(e),pt.prototype.delete.call(this,t)}clear(){pt.prototype.clear.call(this),this._index?.clear()}union(e){let t=gt(e),n=new i(this);for(let s of t)n.add(s);return n}intersection(e){let t=gt(e),n=new i,s=this.size<=t.size?this:t,r=s===this?t:this;for(let o of s)r.has(o)&&n.add(o);return n}difference(e){let t=gt(e),n=new i;for(let s of this)t.has(s)||n.add(s);return n}symmetricDifference(e){let t=gt(e),n=this.difference(t);for(let s of t)this.has(s)||n.add(s);return n}isSubsetOf(e){let t=gt(e);if(this.size>t.size)return!1;for(let n of this)if(!t.has(n))return!1;return!0}isSupersetOf(e){return gt(e).isSubsetOf(this)}isDisjointFrom(e){let t=gt(e),n=this.size<=t.size?this:t,s=n===this?t:this;for(let r of n)if(s.has(r))return!1;return!0}};var Re={};yo(Re,{AdjacencyGraph:()=>he,ArgumentException:()=>xe,ArgumentNullException:()=>Xe,ArgumentOutOfRangeException:()=>Ae,ArrayAdjacencyGraph:()=>tn,ArrayBidirectionalGraph:()=>nn,ArrayUndirectedGraph:()=>Kn,BidirectionalAdapterGraph:()=>Qn,BidirectionalGraph:()=>Z,BidirectionalMatrixGraph:()=>sn,ClusteredAdjacencyGraph:()=>an,CompressedSparseRowGraph:()=>Xn,DelegateBidirectionalIncidenceGraph:()=>Yn,DelegateImplicitGraph:()=>rn,DelegateImplicitUndirectedGraph:()=>Zn,DelegateIncidenceGraph:()=>Rt,DelegateUndirectedGraph:()=>Jn,DelegateVertexAndEdgeListGraph:()=>on,Edge:()=>Q,EdgeEventArgs:()=>Wn,EdgeExtensions:()=>Ih,EdgeListGraph:()=>en,EquatableEdge:()=>Un,EquatableTaggedEdge:()=>Vs,EquatableTermEdge:()=>Ds,EquatableUndirectedEdge:()=>Is,EventHook:()=>L,FilteredBidirectionalGraph:()=>Ls,FilteredEdgeListGraph:()=>Ms,FilteredGraph:()=>hn,FilteredImplicitGraph:()=>ei,FilteredImplicitVertexSet:()=>ln,FilteredIncidenceGraph:()=>ti,FilteredUndirectedGraph:()=>Os,FilteredVertexAndEdgeListGraph:()=>Ns,FilteredVertexListGraph:()=>cn,GetOtherVertex:()=>Je,GetUndirectedVertexEquality:()=>_o,GraphColor:()=>Ce,GraphExtensions:()=>No,HasCycles:()=>Ws,InDictionaryVertexPredicate:()=>Bs,InvalidOperationException:()=>G,IsAdjacent:()=>Qe,IsPath:()=>$s,IsPathWithoutCycles:()=>bo,IsPredecessor:()=>Eo,IsSelfEdge:()=>_e,IsolatedVertexPredicate:()=>qs,NegativeCapacityException:()=>Yt,NegativeCycleGraphException:()=>bs,NegativeWeightException:()=>Es,NoPathFoundException:()=>_s,NonAcyclicGraphException:()=>Oe,NonStronglyConnectedGraphException:()=>Cs,NotSupportedException:()=>$n,ParallelEdgeNotAllowedException:()=>Ss,QuikGraphException:()=>Ge,ResidualEdgePredicate:()=>ni,ReverseEdges:()=>Co,ReversedBidirectionalGraph:()=>Ps,ReversedResidualEdgePredicate:()=>zs,SEdge:()=>Ft,SEquatableEdge:()=>Pe,SEquatableTaggedEdge:()=>Gs,SReversedEdge:()=>mt,STaggedEdge:()=>ks,STaggedUndirectedEdge:()=>Rs,SUndirectedEdge:()=>Jt,SinkVertexPredicate:()=>js,SortedVertexEquality:()=>Dt,TaggedEdge:()=>As,TaggedUndirectedEdge:()=>Fs,TermEdge:()=>Hn,ToAdjacencyGraph:()=>To,ToArrayAdjacencyGraph:()=>Vo,ToArrayBidirectionalGraph:()=>ko,ToArrayUndirectedGraph:()=>Go,ToBidirectionalGraph:()=>Io,ToCompressedRowGraph:()=>Fo,ToDelegateBidirectionalIncidenceGraph:()=>Do,ToDelegateIncidenceGraph:()=>Ro,ToDelegateUndirectedGraph:()=>vo,ToDelegateVertexAndEdgeListGraph:()=>Po,ToUndirectedGraph:()=>Ao,ToVertexPair:()=>Us,TryGetPath:()=>So,UndirectedBidirectionalGraph:()=>vs,UndirectedEdge:()=>Be,UndirectedEdgeEventArgs:()=>Ye,UndirectedGraph:()=>Fe,UndirectedVertexEquality:()=>je,VertexEventArgs:()=>Ts,VertexNotFoundException:()=>$,defaultCompare:()=>Ve,equals:()=>k,requireValue:()=>g});var Ce=Object.freeze({White:0,Gray:1,Black:2}),Ge=class extends Error{constructor(e="A graph operation failed.",t){super(e,t instanceof Error?{cause:t}:t??void 0),this.name=new.target.name}get Message(){return this.message}get InnerException(){return this.cause??null}get StackTrace(){return this.stack}ToString(){return this.toString()}},$=class extends Ge{},bs=class extends Ge{},Es=class extends Ge{},Ss=class extends Ge{},Yt=class extends Ge{},_s=class extends Ge{},Cs=class extends Ge{},Oe=class extends Ge{},xe=class extends TypeError{constructor(e="Invalid argument."){super(e),this.name=new.target.name}},Xe=class extends xe{},Ae=class extends RangeError{constructor(e="Argument out of range."){super(e),this.name=new.target.name}},G=class extends Error{constructor(e="Operation is not valid."){super(e),this.name=new.target.name}},$n=class extends Error{constructor(e="Operation is not supported."){super(e),this.name=new.target.name}};function g(i,e="value"){if(i==null)throw new Xe(`${e} must not be null.`);return i}function k(i,e){return i===e||i!==i&&e!==e||i!=null&&typeof i.Equals=="function"&&i.Equals(e)}function Ve(i,e){return i===e?0:typeof i?.CompareTo=="function"?i.CompareTo(e):i<e?-1:i>e?1:0}var Ke=(i,e)=>{let t=Array.from(g(i,e));return t.forEach(n=>g(n,e)),t},ys=(i,e)=>{if(!Number.isInteger(e)||e<0||e>=i.length)throw new Ae("Index is outside the collection.");return i[e]},ft=(i,e)=>{let t=i.findIndex(n=>k(n,e));return t<0?!1:(i.splice(t,1),!0)},L=class{constructor(){this._listeners=[]}add(e){if(typeof e!="function")throw new TypeError("Listener must be a function.");return this._listeners.push(e),e}remove(e){let t=this._listeners.lastIndexOf(e);return t>=0&&this._listeners.splice(t,1),t>=0}subscribe(e){this.add(e);let t=!0,n=()=>{t&&(t=!1,this.remove(e))};return{dispose:n,unsubscribe:n,Dispose:n}}emit(...e){for(let t of this._listeners.slice())t(...e)}clear(){this._listeners.length=0}get Count(){return this._listeners.length}},Ts=class{constructor(e){this.Vertex=g(e,"vertex")}},Wn=class{constructor(e){this.Edge=g(e,"edge")}},Ye=class extends Wn{constructor(e,t){super(e),this.Reversed=!!t}get Source(){return this.Reversed?this.Edge.Target:this.Edge.Source}get Target(){return this.Reversed?this.Edge.Source:this.Edge.Target}},ws=new WeakMap,Ch=1;function wo(i){if(i==null)return 0;if(typeof i=="object"||typeof i=="function")return ws.has(i)||ws.set(i,Ch++),ws.get(i);let e=0;for(let t of String(i))e=e*31^t.charCodeAt(0)|0;return e}function Zt(i){return typeof i?.GetHashCode=="function"?i.GetHashCode():typeof i?.Equals=="function"?0:wo(i)}function xt(i){return Math.imul(Zt(i.Source),397)^Zt(i.Target)|0}function Th(i,e,t){Object.defineProperties(i,{Source:{value:g(e,"source"),enumerable:!0},Target:{value:g(t,"target"),enumerable:!0}})}var dn=Symbol("struct default"),Q=class{constructor(e,t,n){n===dn?Object.defineProperties(this,{Source:{value:null,enumerable:!0},Target:{value:null,enumerable:!0}}):Th(this,e,t)}Equals(e){return this===e}GetHashCode(){return wo(this)}ToString(){return`${this.Source??""} -> ${this.Target??""}`}toString(){return this.ToString()}},Un=class i extends Q{Equals(e){return e instanceof i&&k(this.Source,e.Source)&&k(this.Target,e.Target)}GetHashCode(){return xt(this)}},Ft=class extends Q{constructor(e,t){arguments.length===0?super(null,null,dn):super(e,t)}Equals(e){return e?.constructor===this.constructor&&k(this.Source,e.Source)&&k(this.Target,e.Target)}GetHashCode(){return xt(this)}},Pe=class extends Ft{},Be=class extends Q{constructor(e,t,n){if(super(e,t,n),n!==dn&&Ve(e,t)>0)throw new RangeError("source must be lower than or equal to target.")}ToString(){return`${this.Source??""} <-> ${this.Target??""}`}},Is=class i extends Be{Equals(e){return e instanceof i&&k(this.Source,e.Source)&&k(this.Target,e.Target)}GetHashCode(){return xt(this)}},Jt=class extends Be{constructor(e,t){arguments.length===0?super(null,null,dn):super(e,t)}Equals(e){return e?.constructor===this.constructor&&k(this.Source,e.Source)&&k(this.Target,e.Target)}GetHashCode(){return xt(this)}},Pt=i=>class extends i{constructor(...e){e.length===0&&(i===Ft||i===Pe||i===Jt)?super():super(e[0],e[1]),this._tag=e.length===0?null:e[2],this.TagChanged=new L}get Tag(){return this._tag}set Tag(e){k(e,this._tag)||(this._tag=e,this.TagChanged.emit(this,{}))}ToString(){return`${super.ToString()} (${this.Tag==null?"":this.Tag})`}},As=class extends Pt(Q){},Vs=class extends Pt(Un){},ks=class extends Pt(Ft){Equals(e){return super.Equals(e)&&k(this.Tag,e.Tag)}GetHashCode(){return xt(this)^Zt(this.Tag)}},Gs=class extends Pt(Pe){},Fs=class extends Pt(Be){},Rs=class extends Pt(Jt){Equals(e){return super.Equals(e)&&k(this.Tag,e.Tag)}GetHashCode(){return xt(this)^Zt(this.Tag)}},Hn=class extends Q{constructor(e,t,n=0,s=0){if(super(e,t),!Number.isInteger(n)||n<0||!Number.isInteger(s)||s<0)throw new RangeError("Terminals must be nonnegative integers.");Object.defineProperties(this,{SourceTerminal:{value:n,enumerable:!0},TargetTerminal:{value:s,enumerable:!0}})}ToString(){return`${this.Source} (${this.SourceTerminal}) -> ${this.Target} (${this.TargetTerminal})`}},Ds=class i extends Hn{Equals(e){return e instanceof i&&k(this.Source,e.Source)&&k(this.Target,e.Target)&&this.SourceTerminal===e.SourceTerminal&&this.TargetTerminal===e.TargetTerminal}GetHashCode(){return xt(this)^this.SourceTerminal^Math.imul(this.TargetTerminal,397)}},mt=class i extends Q{constructor(e){arguments.length===0?(super(null,null,dn),e=null):(g(e,"originalEdge"),super(e.Target,e.Source)),Object.defineProperty(this,"OriginalEdge",{value:e,enumerable:!0})}Equals(e){return e instanceof i&&k(this.OriginalEdge,e.OriginalEdge)}GetHashCode(){return(typeof this.OriginalEdge?.GetHashCode=="function"?this.OriginalEdge.GetHashCode():Zt(this.OriginalEdge))^16777619}ToString(){return`R(${this.OriginalEdge??""})`}},Ze=class{get IsVerticesEmpty(){return this.VertexCount===0}get IsEdgesEmpty(){return this.EdgeCount===0}ContainsEdge(e,t){return g(e),arguments.length===2?this.TryGetEdge(e,g(t))!==void 0:this.Edges.some(n=>k(n,e))}TryGetEdge(e,t){return g(e),g(t),this.TryGetEdges(e,t)?.[0]}TryGetEdges(e,t){g(e),g(t);let n=this.TryGetOutEdges(e);if(n)return n.filter(s=>this.IsDirected?k(s.Target,t):je(s,e,t))}OutDegree(e){return this.OutEdges(e).length}IsOutEdgesEmpty(e){return this.OutDegree(e)===0}OutEdge(e,t){return ys(this.OutEdges(e),t)}InDegree(e){return this.InEdges(e).length}IsInEdgesEmpty(e){return this.InDegree(e)===0}InEdge(e,t){return ys(this.InEdges(e),t)}Degree(e){return this.OutDegree(e)+this.InDegree(e)}AdjacentEdges(e){return this.OutEdges(e).concat(this.InEdges(e).filter(t=>!_e(t)))}TryGetAdjacentEdges(e){return this.ContainsVertex(e)?this.AdjacentEdges(e):void 0}AdjacentDegree(e){return this.AdjacentEdges(e).length}IsAdjacentEdgesEmpty(e){return this.AdjacentDegree(e)===0}AdjacentEdge(e,t){return ys(this.AdjacentEdges(e),t)}AdjacentVertices(e){return Array.from(new _(this.AdjacentEdges(e).filter(t=>!_e(t)).map(t=>Je(t,e))))}},he=class extends Ze{constructor(e=!0,t=-1,n=0){super();let s=typeof e=="object"?g(e):null;if(this.AllowParallelEdges=s?s.AllowParallelEdges:!!e,this.EdgeCapacity=s?s.EdgeCapacity:n,this._out=new y,this._in=new y,this._count=0,this.VertexAdded=new L,this.VertexRemoved=new L,this.EdgeAdded=new L,this.EdgeRemoved=new L,s&&(this.AddVertexRange(s.Vertices),this.AddEdgeRange(s.Edges),typeof s.InEdges=="function"))for(let r of s.Vertices)this._in.set(r,Array.from(s.InEdges(r)))}get IsDirected(){return!0}get VertexType(){return Object}get EdgeType(){return Q}get VertexCount(){return this._out.size}get EdgeCount(){return this._count}get Vertices(){return Array.from(this._out.keys())}get Edges(){let e=[];for(let t of this._out.values())for(let n of t)e.push(n);return e}ContainsVertex(e){return this._out.has(g(e,"vertex"))}ContainsEdge(e,t){if(arguments.length===2)return this.TryGetEdge(e,t)!==void 0;let n=g(e,"edge");return this._out.get(n.Source)?.some(s=>k(s,n))??!1}TryGetEdge(e,t){return g(e),g(t),this._out.get(e)?.find(n=>k(n.Target,t))}TryGetEdges(e,t){return g(e),g(t),this._out.get(e)?.filter(n=>k(n.Target,t))}OutEdges(e){let t=this.TryGetOutEdges(e);if(!t)throw new $;return t}TryGetOutEdges(e){return this._out.get(g(e,"vertex"))?.slice()}InEdges(e){let t=this.TryGetInEdges(e);if(!t)throw new $;return t}TryGetInEdges(e){return this._in.get(g(e,"vertex"))?.slice()}OutDegree(e){let t=this._out.get(g(e));if(!t)throw new $;return t.length}InDegree(e){let t=this._in.get(g(e));if(!t)throw new $;return t.length}AddVertex(e){return g(e,"vertex"),this._out.has(e)?!1:(this._out.set(e,[]),this._in.set(e,[]),this.VertexAdded.emit(e),!0)}AddVertexRange(e){let t=0;for(let n of Ke(e,"vertices"))t+=this.AddVertex(n);return t}AddEdge(e){if(g(e,"edge"),!this.ContainsVertex(e.Source)||!this.ContainsVertex(e.Target))throw new $;return!this.AllowParallelEdges&&this.ContainsEdge(e.Source,e.Target)?!1:(this._out.get(e.Source).push(e),this._in.get(e.Target).push(e),++this._count,this.EdgeAdded.emit(e),!0)}AddEdgeRange(e){let t=0;for(let n of Ke(e,"edges"))t+=this.AddEdge(n);return t}AddVerticesAndEdge(e){return g(e,"edge"),this.AddVertex(e.Source),this.AddVertex(e.Target),this.AddEdge(e)}AddVerticesAndEdgeRange(e){let t=0;for(let n of Ke(e,"edges"))t+=this.AddVerticesAndEdge(n);return t}RemoveEdge(e){g(e,"edge");let t=this._out.get(e.Source);return!t||!ft(t,e)?!1:(ft(this._in.get(e.Target),e),--this._count,this.EdgeRemoved.emit(e),!0)}RemoveEdges(e){let t=0;for(let n of Ke(e,"edges"))t+=this.RemoveEdge(n);return t}RemoveEdgeIf(e){return g(e),this.RemoveEdges(this.Edges.filter(e))}RemoveOutEdgeIf(e,t){return g(t),this.RemoveEdges((this.TryGetOutEdges(e)??[]).filter(t))}RemoveInEdgeIf(e,t){return g(t),this.RemoveEdges((this.TryGetInEdges(e)??[]).filter(t))}ClearOutEdges(e){this.RemoveEdges(this.TryGetOutEdges(e)??[])}ClearInEdges(e){this.RemoveEdges(this.TryGetInEdges(e)??[])}ClearEdges(e){this.ClearOutEdges(e),this.ClearInEdges(e)}RemoveVertex(e){return this.ContainsVertex(e)?(this.ClearEdges(e),this._out.delete(e),this._in.delete(e),this.VertexRemoved.emit(e),!0):!1}RemoveVertexIf(e){g(e);let t=this.Vertices.filter(e);for(let n of t)this.RemoveVertex(n);return t.length}Clear(){let e=this.Edges,t=this.Vertices;this._out.clear(),this._in.clear(),this._count=0;for(let n of e)this.EdgeRemoved.emit(n);for(let n of t)this.VertexRemoved.emit(n)}TrimEdgeExcess(){for(let[e,t]of this._out)this._out.set(e,t.slice());for(let[e,t]of this._in)this._in.set(e,t.slice())}Clone(){return new this.constructor(this)}},Z=class extends he{MergeVertex(e,t){g(t);let n=this.InEdges(e).filter(r=>!_e(r)),s=this.OutEdges(e).filter(r=>!_e(r));this.RemoveVertex(e);for(let r of n)for(let o of s)this.AddEdge(t(r.Source,o.Target))}MergeVerticesIf(e,t){g(e),g(t);for(let n of this.Vertices.filter(e))this.MergeVertex(n,t)}},Fe=class i extends he{constructor(e=!0,t=je){super(typeof e=="object"?g(e).AllowParallelEdges:e),this.EdgeCapacity=-1,this.EdgeEqualityComparer=g(t),this._edges=[],typeof e=="object"&&(this.AddVertexRange(e.Vertices),this.AddEdgeRange(e.Edges))}get IsDirected(){return!1}get Edges(){return this._edges.slice()}ContainsEdge(e,t){return arguments.length===2?this.TryGetEdge(e,t)!==void 0:(g(e),this._out.get(e.Source)?.some(n=>k(n,e))??!1)}TryGetEdges(e,t){g(t);let n=this.TryGetAdjacentEdges(e)?.filter(s=>this.EdgeEqualityComparer(s,e,t));return n?.length?n:void 0}TryGetEdge(e,t){return g(e),g(t),this._sortedEdgeType&&Ve(e,t)>0&&([e,t]=[t,e]),this._out.get(e)?.find(n=>this.EdgeEqualityComparer(n,e,t))}AdjacentEdges(e){return this.OutEdges(e)}AdjacentDegree(e){return this.AdjacentEdges(e).reduce((t,n)=>t+(_e(n)?2:1),0)}TryGetAdjacentEdges(e){return this.TryGetOutEdges(e)}InEdges(e){return this.OutEdges(e)}TryGetInEdges(e){return this.TryGetOutEdges(e)}InDegree(e){return this.OutDegree(e)}Degree(e){return this.AdjacentDegree(e)}AddEdge(e){if(g(e),!this.ContainsVertex(e.Source)||!this.ContainsVertex(e.Target))throw new $;return!this.AllowParallelEdges&&this.ContainsEdge(e.Source,e.Target)?!1:(this._sortedEdgeType=(this._sortedEdgeType??!0)&&e instanceof Be,this._out.get(e.Source).push(e),_e(e)||this._out.get(e.Target).push(e),this._edges.push(e),++this._count,this.EdgeAdded.emit(e),!0)}RemoveEdge(e){g(e);let t=this._out.get(e.Source);return!t||!ft(t,e)?!1:(_e(e)||ft(this._out.get(e.Target),e),ft(this._edges,e),--this._count,this.EdgeRemoved.emit(e),!0)}ClearAdjacentEdges(e){this.RemoveEdges(this.TryGetAdjacentEdges(e)??[])}ClearEdges(e){this.ClearAdjacentEdges(e)}ClearInEdges(e){this.ClearAdjacentEdges(e)}RemoveAdjacentEdgeIf(e,t){return g(t),this.RemoveEdges((this.TryGetAdjacentEdges(e)??[]).filter(t))}Clear(){let e=this.Edges,t=this.Vertices;this._edges.length=0,this._out.clear(),this._in.clear(),this._count=0;for(let n of e)this.EdgeRemoved.emit(n);for(let n of t)this.VertexRemoved.emit(n)}Clone(){let e=new i(this.AllowParallelEdges,this.EdgeEqualityComparer);return e.EdgeCapacity=this.EdgeCapacity,e.AddVertexRange(this.Vertices),e.AddEdgeRange(this.Edges),e}},en=class i extends Ze{constructor(e=!0,t=!0){super(),this.IsDirected=!!e,this.AllowParallelEdges=!!t,this._edges=[],this.EdgeAdded=new L,this.EdgeRemoved=new L}get Edges(){return this._edges.slice()}get EdgeCount(){return this._edges.length}get Vertices(){let e=new _;for(let t of this._edges)e.add(t.Source),e.add(t.Target);return[...e]}get VertexCount(){return this.Vertices.length}ContainsVertex(e){return g(e),this._edges.some(t=>Qe(t,e))}TryGetOutEdges(e){return this.ContainsVertex(e)?this._edges.filter(t=>this.IsDirected?k(t.Source,e):Qe(t,e)):void 0}OutEdges(e){let t=this.TryGetOutEdges(e);if(!t)throw new $;return t}InEdges(e){if(!this.ContainsVertex(e))throw new $;return this._edges.filter(t=>this.IsDirected?k(t.Target,e):Qe(t,e))}AddEdge(e){return g(e),(this.AllowParallelEdges?this.ContainsEdge(e):this.ContainsEdge(e.Source,e.Target))?!1:(this._edges.push(e),this.EdgeAdded.emit(e),!0)}AddVerticesAndEdge(e){return this.AddEdge(e)}AddEdgeRange(e){let t=0;for(let n of Ke(e,"edges"))t+=this.AddEdge(n);return t}AddVerticesAndEdgeRange(e){return this.AddEdgeRange(e)}RemoveEdge(e){return g(e),ft(this._edges,e)?(this.EdgeRemoved.emit(e),!0):!1}RemoveEdgeIf(e){g(e);let t=this.Edges.filter(e);for(let n of t)this.RemoveEdge(n);return t.length}Clear(){let e=this._edges;this._edges=[];for(let t of e)this.EdgeRemoved.emit(t)}Clone(){let e=new i(this.IsDirected,this.AllowParallelEdges);return e.AddEdgeRange(this.Edges),e}},qe=class extends Ze{constructor(e){super(),this.OriginalGraph=g(e,"graph")}get IsDirected(){return this.OriginalGraph.IsDirected}get AllowParallelEdges(){return this.OriginalGraph.AllowParallelEdges}get Vertices(){return Array.from(this.OriginalGraph.Vertices)}get VertexCount(){return this.OriginalGraph.VertexCount}get Edges(){return Array.from(this.OriginalGraph.Edges)}get EdgeCount(){return this.OriginalGraph.EdgeCount}ContainsVertex(e){return this.OriginalGraph.ContainsVertex(e)}OutEdges(e){return Array.from(this.OriginalGraph.OutEdges(e))}TryGetOutEdges(e){return this.ContainsVertex(e)?this.OutEdges(e):void 0}InEdges(e){return Array.from(this.OriginalGraph.InEdges(e))}TryGetInEdges(e){return this.ContainsVertex(e)?this.InEdges(e):void 0}},tn=class extends qe{constructor(e){let t=new he(g(e).AllowParallelEdges);t.AddVertexRange(e.Vertices),t.AddEdgeRange(e.Edges),super(t)}Clone(){return new this.constructor(this)}},nn=class extends tn{constructor(e){super(e);for(let t of e.Vertices)this.OriginalGraph._in.set(t,Array.from(e.InEdges(t)))}},Kn=class i extends qe{constructor(e){let t=new Fe(g(e).AllowParallelEdges,e.EdgeEqualityComparer??je);t.AddVertexRange(e.Vertices),t.AddEdgeRange(e.Edges),super(t),this.EdgeEqualityComparer=t.EdgeEqualityComparer}AdjacentEdges(e){return this.OriginalGraph.AdjacentEdges(e)}AdjacentDegree(e){return this.OriginalGraph.AdjacentDegree(e)}TryGetEdges(e,t){return this.OriginalGraph.TryGetEdges(e,t)}Clone(){return new i(this)}},Qn=class extends qe{constructor(e){super(e),this._incoming=new y;for(let t of e.Vertices)this._incoming.set(t,[]);for(let t of e.Edges)this._incoming.has(t.Target)||this._incoming.set(t.Target,[]),this._incoming.get(t.Target).push(t)}InEdges(e){let t=this._incoming.get(g(e));if(!t)throw new $;return t.slice()}TryGetInEdges(e){return this._incoming.get(g(e))?.slice()}},Ps=class extends qe{get Edges(){return this.OriginalGraph.Edges.map(e=>new mt(e))}OutEdges(e){return this.OriginalGraph.InEdges(e).map(t=>new mt(t))}InEdges(e){return this.OriginalGraph.OutEdges(e).map(t=>new mt(t))}},vs=class extends qe{constructor(e){super(e),this.EdgeEqualityComparer=je}get IsDirected(){return!1}AdjacentEdges(e){return this.OriginalGraph.OutEdges(e).concat(this.OriginalGraph.InEdges(e).filter(t=>!_e(t)))}AdjacentDegree(e){return this.OriginalGraph.Degree(e)}AdjacentEdge(){throw new $n}OutEdges(e){return this.AdjacentEdges(e)}InEdges(e){return this.AdjacentEdges(e)}},sn=class i extends Z{constructor(e){if(!Number.isInteger(e)||e<0)throw new RangeError("vertexCount must be nonnegative.");super(!1),this._size=e;for(let t=0;t<e;++t)he.prototype.AddVertex.call(this,t)}AddVertex(){throw new TypeError("Matrix graph has a fixed vertex set.")}RemoveVertex(){throw new TypeError("Matrix graph has a fixed vertex set.")}ContainsVertex(e){return Number.isInteger(e)&&e>=0&&e<this._size}TryGetEdge(e,t){return this.ContainsVertex(e)&&this.ContainsVertex(t)?this._matrix?.get(e*this._size+t):void 0}AddEdge(e){if(g(e),!this.ContainsVertex(e.Source)||!this.ContainsVertex(e.Target))throw new $;this._matrix||(this._matrix=new y);let t=e.Source*this._size+e.Target;return this._matrix.has(t)?!1:(this._matrix.set(t,e),this._out.get(e.Source).push(e),this._in.get(e.Target).push(e),++this._count,this.EdgeAdded.emit(e),!0)}RemoveEdge(e){g(e);let t=e.Source*this._size+e.Target,n=this._matrix?.get(t);return!n||!k(n,e)?!1:(this._matrix.delete(t),super.RemoveEdge(n))}OutEdges(e){return super.OutEdges(e).sort((t,n)=>t.Target-n.Target)}InEdges(e){return super.InEdges(e).sort((t,n)=>t.Source-n.Source)}get Edges(){return super.Edges.sort((e,t)=>e.Source-t.Source||e.Target-t.Target)}Clear(){this.RemoveEdgeIf(()=>!0)}Clone(){let e=new i(this.VertexCount);return e.AddEdgeRange(this.Edges),e}},Xn=class i extends Ze{constructor(e){super(),g(e),this._vertices=Array.from(e.Vertices),this._index=new y(this._vertices.map((t,n)=>[t,n])),this._offsets=new Uint32Array(this._vertices.length+1),this._targets=[];for(let t=0;t<this._vertices.length;++t){this._offsets[t]=this._targets.length;for(let n of e.OutEdges(this._vertices[t]))this._targets.push(n.Target)}this._offsets[this._vertices.length]=this._targets.length}static FromGraph(e){return new i(e)}get IsDirected(){return!0}get AllowParallelEdges(){return!1}get VertexCount(){return this._vertices.length}get Vertices(){return this._vertices.slice()}get EdgeCount(){return this._targets.length}get Edges(){let e=[];for(let t of this._vertices)for(let n of this.OutEdges(t))e.push(n);return e}ContainsVertex(e){return this._index.has(g(e))}OutEdges(e){let t=this.TryGetOutEdges(e);if(!t)throw new $;return t}TryGetOutEdges(e){g(e);let t=this._index.get(e);if(t===void 0)return;let n=[];for(let s=this._offsets[t];s<this._offsets[t+1];++s)n.push(new Pe(e,this._targets[s]));return n}OutDegree(e){let t=this._index.get(g(e));if(t===void 0)throw new $;return this._offsets[t+1]-this._offsets[t]}Clone(){return new i(this)}},rn=class extends Ze{constructor(e,t=!0){super(),this._getter=g(e),this.AllowParallelEdges=!!t}get IsDirected(){return!0}TryGetOutEdges(e){let t=this._getter(g(e));return t==null||t===!1?void 0:Array.from(t)}ContainsVertex(e){return this.TryGetOutEdges(e)!==void 0}OutEdges(e){let t=this.TryGetOutEdges(e);if(!t)throw new $;return t}},Rt=class extends rn{},Yn=class extends Rt{constructor(e,t,n=!0){super(e,n),this._inGetter=g(t)}TryGetInEdges(e){let t=this._inGetter(g(e));return t==null||t===!1?void 0:Array.from(t)}InEdges(e){let t=this.TryGetInEdges(e);if(!t)throw new $;return t}},on=class extends Rt{constructor(e,t,n=!0){super(t,n),this._vertices=g(e)}get Vertices(){return Array.from(typeof this._vertices=="function"?this._vertices():this._vertices)}get VertexCount(){return this.Vertices.length}get Edges(){return this.Vertices.flatMap(e=>this.OutEdges(e))}get EdgeCount(){return this.Edges.length}ContainsVertex(e){return g(e),this.Vertices.some(t=>k(t,e))}TryGetOutEdges(e){if(!this.ContainsVertex(e))return;let t=new _(this.Vertices);return(super.TryGetOutEdges(e)??[]).filter(n=>k(n.Source,e)&&t.has(n.Target))}OutEdges(e){if(!this.ContainsVertex(e))throw new $;let t=this._getter(e);if(t==null||t===!1)throw new $;let n=new _(this.Vertices);return Array.from(t).filter(s=>k(s.Source,e)&&n.has(s.Target))}},Zn=class extends rn{constructor(e,t=!0){super(e,t),this.EdgeEqualityComparer=je}get IsDirected(){return!1}AdjacentEdges(e){return this.OutEdges(e)}TryGetAdjacentEdges(e){return this.TryGetOutEdges(e)}},Jn=class extends Zn{constructor(e,t,n=!0){super(t,n),this._vertices=g(e)}get Vertices(){return Array.from(typeof this._vertices=="function"?this._vertices():this._vertices)}get VertexCount(){return this.Vertices.length}get Edges(){return this.Vertices.flatMap(e=>this.AdjacentEdges(e).filter(t=>k(t.Source,e)))}get EdgeCount(){return this.Edges.length}ContainsVertex(e){return g(e),this.Vertices.some(t=>k(t,e))}TryGetOutEdges(e){if(!this.ContainsVertex(e))return;let t=new _(this.Vertices);return(super.TryGetOutEdges(e)??[]).filter(n=>Qe(n,e)&&t.has(Je(n,e)))}OutEdges(e){if(!this.ContainsVertex(e))throw new $;let t=this._getter(e);if(t==null||t===!1)throw new $;let n=new _(this.Vertices);return Array.from(t).filter(s=>Qe(s,e)&&n.has(Je(s,e)))}},an=class i extends qe{constructor(e){let t=e instanceof i?e:null;super(t?new he(t.AllowParallelEdges):g(e)),this.Parent=t,this.Wrapped=this.OriginalGraph,this.Collapsed=!1,this._clusters=[]}get EdgeCapacity(){return this.Wrapped.EdgeCapacity}set EdgeCapacity(e){this.Wrapped.EdgeCapacity=e}get VertexType(){return Object}get EdgeType(){return Q}get Clusters(){return this._clusters.slice()}get ClustersCount(){return this._clusters.length}AddCluster(){let e=new i(this);return this._clusters.push(e),e}RemoveCluster(e){g(e),ft(this._clusters,e)}AddVertex(e){return this.Parent?.AddVertex(e),this.Wrapped.AddVertex(e)}AddVertexRange(e){return Ke(e).reduce((t,n)=>t+this.AddVertex(n),0)}AddEdge(e){return g(e),this.Parent&&!this.Parent.ContainsEdge(e)&&this.Parent.AddEdge(e),this.Wrapped.AddEdge(e)}AddEdgeRange(e){return Ke(e).reduce((t,n)=>t+this.AddEdge(n),0)}AddVerticesAndEdge(e){return g(e),this.AddVertex(e.Source),this.AddVertex(e.Target),this.AddEdge(e)}AddVerticesAndEdgeRange(e){return Ke(e).reduce((t,n)=>t+this.AddVerticesAndEdge(n),0)}_removeDescendants(e,t){for(let n of this._clusters)n.Wrapped[e](t),n._removeDescendants(e,t)}RemoveVertex(e){return this.ContainsVertex(e)?(this._removeDescendants("RemoveVertex",e),this.Wrapped.RemoveVertex(e),this.Parent?.RemoveVertex(e),!0):!1}RemoveEdge(e){return this.ContainsEdge(e)?(this._removeDescendants("RemoveEdge",e),this.Wrapped.RemoveEdge(e),this.Parent?.RemoveEdge(e),!0):!1}RemoveVertexIf(e){return g(e),this.Vertices.filter(e).reduce((t,n)=>t+this.RemoveVertex(n),0)}RemoveEdgeIf(e){return g(e),this.Edges.filter(e).reduce((t,n)=>t+this.RemoveEdge(n),0)}RemoveOutEdgeIf(e,t){return g(t),(this.TryGetOutEdges(e)??[]).filter(t).reduce((n,s)=>n+this.RemoveEdge(s),0)}ClearOutEdges(e){this.Wrapped.ClearOutEdges(e)}Clear(){this.Wrapped.Clear(),this._clusters.length=0}},hn=class extends qe{constructor(e,t,n){super(e),this.BaseGraph=e,this.VertexPredicate=g(t),this.EdgePredicate=g(n)}FilterEdge(e){return g(e),this.VertexPredicate(e.Source)&&this.VertexPredicate(e.Target)&&this.EdgePredicate(e)}get Vertices(){return Array.from(this.BaseGraph.Vertices).filter(this.VertexPredicate)}get VertexCount(){return this.Vertices.length}get Edges(){return Array.from(this.BaseGraph.Edges).filter(e=>this.FilterEdge(e))}get EdgeCount(){return this.Edges.length}ContainsVertex(e){return this.VertexPredicate(g(e))&&this.BaseGraph.ContainsVertex(e)}ContainsEdge(e,t){return arguments.length===2?this.TryGetEdge(e,t)!==void 0:this.FilterEdge(e)&&this.BaseGraph.ContainsEdge(e)}OutEdges(e){if(!this.VertexPredicate(g(e)))throw new $;return Array.from(this.BaseGraph.OutEdges(e)).filter(t=>this.FilterEdge(t))}TryGetOutEdges(e){return this.ContainsVertex(e)?this.OutEdges(e):void 0}InEdges(e){if(!this.VertexPredicate(g(e)))throw new $;return Array.from(this.BaseGraph.InEdges(e)).filter(t=>this.FilterEdge(t))}TryGetInEdges(e){return this.ContainsVertex(e)?this.InEdges(e):void 0}TryGetEdges(e,t){if(g(e),g(t),!(!this.VertexPredicate(e)||!this.VertexPredicate(t)))return this.BaseGraph.TryGetEdges(e,t)?.filter(n=>this.EdgePredicate(n))}},ln=class extends hn{},ei=class extends ln{},ti=class extends ei{},cn=class extends ti{},Ns=class extends cn{},Ms=class extends ln{},Ls=class extends cn{},Os=class extends hn{get EdgeEqualityComparer(){return this.BaseGraph.EdgeEqualityComparer}AdjacentEdges(e){if(!this.VertexPredicate(g(e)))throw new $;return Array.from(this.BaseGraph.AdjacentEdges(e)).filter(t=>this.FilterEdge(t))}AdjacentDegree(e){return this.AdjacentEdges(e).reduce((t,n)=>t+(_e(n)?2:1),0)}OutEdges(e){return this.AdjacentEdges(e)}InEdges(e){return this.AdjacentEdges(e)}},Bs=class{constructor(e){this.VertexMap=g(e)}Test(e){return this.VertexMap.has(g(e))}},qs=class{constructor(e){this.VisitedGraph=g(e)}Test(e){return this.VisitedGraph.Degree(g(e))===0}},js=class{constructor(e){this.VisitedGraph=g(e)}Test(e){return this.VisitedGraph.OutDegree(g(e))===0}},ni=class{constructor(e){this.ResidualCapacities=g(e)}Test(e){if(g(e),!this.ResidualCapacities.has(e))throw new TypeError("Residual capacity is missing.");return this.ResidualCapacities.get(e)>0}},zs=class extends ni{constructor(e,t){super(e),this.ReversedEdges=g(t)}Test(e){if(g(e),!this.ReversedEdges.has(e))throw new TypeError("Reversed edge is missing.");return super.Test(this.ReversedEdges.get(e))}};function _e(i){return g(i),k(i.Source,i.Target)}function Je(i,e){return g(i),g(e),k(i.Source,e)?i.Target:i.Source}function Qe(i,e){return g(i),g(e),k(i.Source,e)||k(i.Target,e)}function $s(i){let e=!0,t;for(let n of g(i)){if(!e&&!k(t,n.Source))return!1;e=!1,t=n.Target}return!0}function Ws(i){let e=new _,t=!0;for(let n of g(i)){if(t&&(e.add(n.Source),t=!1),e.has(n.Target))return!0;e.add(n.Target)}return!1}function bo(i){let e=Array.from(g(i));return $s(e)&&!Ws(e)}function Us(i){return g(i),new Pe(i.Source,i.Target)}function Eo(i,e,t){g(i),g(e),g(t);let n=new _;for(;!n.has(t);){if(k(t,e))return!0;n.add(t);let s=i.get(t);if(!s)return!1;t=Je(s,t)}return!1}function So(i,e){g(i),g(e);let t=[],n=new _;for(;i.has(e);){if(n.has(e))return;n.add(e);let s=i.get(e);if(_e(s))break;t.push(s),e=Je(s,e)}return t.length?t.reverse():void 0}function Dt(i,e,t){return g(i),g(e),g(t),k(i.Source,e)&&k(i.Target,t)}function je(i,e,t){return Dt(i,e,t)||Dt(i,t,e)}function _o(i){return i===Be||i?.prototype instanceof Be?Dt:je}function Co(i){return Array.from(g(i),e=>new mt(e))}var Ih=Object.freeze({IsSelfEdge:_e,GetOtherVertex:Je,IsAdjacent:Qe,IsPath:$s,HasCycles:Ws,IsPathWithoutCycles:bo,ToVertexPair:Us,IsPredecessor:Eo,TryGetPath:So,SortedVertexEquality:Dt,UndirectedVertexEquality:je,GetUndirectedVertexEquality:_o,ReverseEdges:Co});for(let[i,e]of Object.entries({IsSelfEdge:_e,GetOtherVertex:Je,IsAdjacent:Qe,ToVertexPair:Us,SortedVertexEquality:Dt,UndirectedVertexEquality:je}))Object.defineProperty(Q.prototype,i,{value(...t){return e(this,...t)}});function ii(i,e,t=!0,n=!0){g(e),g(t);let s=typeof t=="function"?t:null,r=new i(s?n:t);if(s){r.AddVertexRange(e);for(let o of r.Vertices)r.AddEdgeRange(s(o))}else if(e.Vertices&&e.Edges)r.AddVertexRange(e.Vertices),r.AddEdgeRange(e.Edges);else{let o=Array.from(e);if(o.length&&Array.isArray(o[0])){if(o.length!==2||o[0].length!==o[1]?.length)throw new RangeError("Expected equally sized source and target columns.");r.AddVerticesAndEdgeRange(o[0].map((a,h)=>new Pe(a,o[1][h])))}else r.AddVerticesAndEdgeRange(o)}return r}function To(i,e=!0,t=!0){return ii(he,i,e,t)}function Io(i,e=!0,t=!0){return i?.Vertices&&i?.Edges&&arguments.length===1?i.IsDirected?i instanceof Z||i instanceof nn?i:new Qn(i):ii(Z,i):ii(Z,i,e,t)}function Ao(i,e=!0,t=!0){return ii(Fe,i,e,t)}function Vo(i){return new tn(i)}function ko(i){return new nn(i)}function Go(i){return new Kn(i)}function Fo(i){return Xn.FromGraph(i)}function Ro(i){return new Rt(i)}function Do(i,e){return new Yn(i,e)}function Po(i,e){if(i instanceof globalThis.Map){arguments.length>1&&g(e);let t=i;return new on(()=>t.keys(),n=>t.has(n)?e?e({Key:n,Value:t.get(n)}):t.get(n):void 0)}return new on(i,e)}function vo(i,e){return new Jn(i,e)}var No=Object.freeze({ToAdjacencyGraph:To,ToBidirectionalGraph:Io,ToUndirectedGraph:Ao,ToArrayAdjacencyGraph:Vo,ToArrayBidirectionalGraph:ko,ToArrayUndirectedGraph:Go,ToCompressedRowGraph:Fo,ToDelegateIncidenceGraph:Ro,ToDelegateBidirectionalIncidenceGraph:Do,ToDelegateVertexAndEdgeListGraph:Po,ToDelegateUndirectedGraph:vo});for(let[i,e]of Object.entries(No))i.startsWith("ToDelegate")||Object.defineProperty(Ze.prototype,i,{value(...t){return e(this,...t)}});var mn={};yo(mn,{BinaryHeap:()=>ai,BinaryQueue:()=>Hs,EdgeEdgeDictionary:()=>gn,EdgeList:()=>et,FibonacciHeap:()=>li,FibonacciHeapCell:()=>hi,FibonacciHeapLinkedList:()=>fn,FibonacciQueue:()=>Ks,ForestDisjointSet:()=>Nt,HeapConstants:()=>un,HeapDirection:()=>Xs,Queue:()=>yt,SoftHeap:()=>Qs,VertexEdgeDictionary:()=>pn,VertexList:()=>vt});var si=(i,e)=>({Key:i,Value:e}),Xs=Object.freeze({Increasing:0,Decreasing:1}),un=Object.freeze({Consistent:"Is_Consistent",NotConsistent:"Is_NOT_Consistent"}),ri=class extends Array{constructor(e=[]){if(super(),typeof e=="number"){if(e<0)throw new RangeError("Negative capacity.");this.Capacity=e}else{g(e);for(let t of e)this.push(t);this.Capacity=this.length}}static get[Symbol.species](){return Array}get Count(){return this.length}Add(e){this.push(e)}AddRange(e){for(let t of g(e))this.push(t)}Contains(e){return this.some(t=>k(t,e))}IndexOf(e){return this.findIndex(t=>k(t,e))}Remove(e){let t=this.IndexOf(e);return t<0?!1:(this.splice(t,1),!0)}RemoveAt(e){if(!Number.isInteger(e)||e<0||e>=this.length)throw new RangeError("Index out of range.");this.splice(e,1)}RemoveAll(e){g(e);let t=this.filter(s=>!e(s)),n=this.length-t.length;return this.length=0,this.AddRange(t),n}Clear(){this.length=0}ToArray(){return Array.from(this)}TrimExcess(){this.Capacity=this.length}Clone(){return new this.constructor(this)}},vt=class extends ri{},et=class extends ri{},oi=class extends y{constructor(e){if(typeof e=="number"){if(e<0)throw new RangeError("Negative capacity.");super()}else super(e)}get Count(){return this.size}get Keys(){return Array.from(this.keys())}get Values(){return Array.from(this.values())}Add(e,t){if(g(e),this.has(e))throw new TypeError("Duplicate key.");this.set(e,t)}ContainsKey(e){return this.has(g(e))}Remove(e){return this.delete(g(e))}TryGetValue(e){return this.get(g(e))}Clear(){this.clear()}Clone(){return new this.constructor(this)}},pn=class i extends oi{Clone(){let e=new i;for(let[t,n]of this)e.set(t,typeof n.Clone=="function"?n.Clone():new et(n));return e}},gn=class extends oi{},yt=class{constructor(e=[]){if(typeof e=="number"){if(e<0)throw new RangeError("Negative capacity.");e=[]}this._a=Array.from(g(e)),this._head=0}get Count(){return this._a.length-this._head}Enqueue(e){this._a.push(e)}Dequeue(){if(!this.Count)throw new G("Queue is empty.");let e=this._a[this._head];return this._a[this._head++]=void 0,this._head>=1024&&this._head*2>=this._a.length&&(this._a=this._a.slice(this._head),this._head=0),e}Peek(){if(!this.Count)throw new G("Queue is empty.");return this._a[this._head]}Contains(e){for(let t=this._head;t<this._a.length;++t)if(k(e,this._a[t]))return!0;return!1}Clear(){this._a=[],this._head=0}ToArray(){return this._a.slice(this._head)}[Symbol.iterator](){return this.ToArray()[Symbol.iterator]()}},ai=class{constructor(e=16,t=Ve){if(typeof e=="function"&&(t=e,e=16),!Number.isInteger(e)||e<0)throw new RangeError("Negative capacity.");this.Capacity=e,this.PriorityComparison=g(t),this._items=[],this._version=0}get Count(){return this._items.length}_less(e,t){return this.PriorityComparison(this._items[e].Key,this._items[t].Key)<0}_swap(e,t){let n=this._items[e];this._items[e]=this._items[t],this._items[t]=n}_up(e){for(;e>0;){let t=e-1>>1;if(!this._less(e,t))break;this._swap(e,t),e=t}}_down(e){for(;;){let t=e*2+1,n=t+1,s=e;if(t<this.Count&&this._less(t,s)&&(s=t),n<this.Count&&this._less(n,s)&&(s=n),s===e)break;this._swap(e,s),e=s}}Add(e,t){g(e),this.Count>=this.Capacity&&(this.Capacity=this.Capacity*2+1),this._items.push(si(e,t)),++this._version,this._up(this.Count-1)}Minimum(){if(!this.Count)throw new G("Heap is empty.");return{...this._items[0]}}RemoveMinimum(){let e=this.Minimum(),t=this._items.pop();return this.Count&&(this._items[0]=t,this._down(0)),++this._version,e}IndexOf(e){return this._items.findIndex(t=>k(t.Value,e))}Update(e,t){g(e);let n=this.IndexOf(t);if(n<0)return this.Add(e,t);let s=this._items[n].Key;this._items[n]=si(e,t),++this._version,this.PriorityComparison(e,s)>0?this._down(n):this._up(n)}MinimumUpdate(e,t){g(e);let n=this.IndexOf(t);return n>=0&&this.PriorityComparison(e,this._items[n].Key)>0?!1:(this.Update(e,t),!0)}ToArray(){return this._items.map(e=>e.Value)}ToPairsArray(){return this._items.map(e=>({...e}))}*[Symbol.iterator](){let e=this._version;for(let t=0;t<this.Count;++t){if(e!==this._version)throw new G("Collection modified during enumeration.");yield{...this._items[t]}}if(e!==this._version)throw new G("Collection modified during enumeration.")}IsConsistent(){for(let e=1;e<this.Count;++e)if(this.PriorityComparison(this._items[e-1>>1].Key,this._items[e].Key)>0)return!1;return!0}_entry(e){let t=this._items[e];return t?`${t.Key} ${t.Value==null?"null":t.Value}`:"null"}ToString2(){return`${this.IsConsistent()?un.Consistent:un.NotConsistent}: ${Array.from({length:this.Capacity},(e,t)=>this._entry(t)).join(", ")}`}ToStringTree(){let e=this.IsConsistent()?un.Consistent:un.NotConsistent;for(let t=0;t<this.Count;++t)e+=`
index${t} ${this._entry(t)} -> ${this._entry(2*t+1)} and ${this._entry(2*t+2)}`;return e}},Hs=class{constructor(e,t=Ve){this._distance=g(e),this._heap=new ai(g(t))}get Count(){return this._heap.Count}Contains(e){return this._heap.IndexOf(e)>=0}Enqueue(e){this._heap.Add(this._distance(g(e)),e)}Dequeue(){return this._heap.RemoveMinimum().Value}Peek(){return this._heap.Minimum().Value}Update(e){this._heap.Update(this._distance(g(e)),e)}ToArray(){return this._heap.ToArray()}ToPairsArray(){return this._heap.ToPairsArray()}ToString2(){return this._heap.ToString2()}},Nt=class{constructor(e=0){if(e<0)throw new RangeError("Negative capacity.");this._elements=new y,this.SetCount=0}get ElementCount(){return this._elements.size}Contains(e){return this._elements.has(g(e))}MakeSet(e){if(g(e),this._elements.has(e))throw new TypeError("Element already exists.");let t={Value:e,Rank:0};t.Parent=t,this._elements.set(e,t),++this.SetCount}_find(e){let t=this._elements.get(g(e));if(!t)throw new TypeError("Element is not in the disjoint set.");let n=t;for(;n.Parent!==n;)n=n.Parent;for(;t.Parent!==t;){let s=t.Parent;t.Parent=n,t=s}return n}FindSet(e){return this._find(e).Value}AreInSameSet(e,t){return this._find(e)===this._find(t)}Union(e,t){let n=this._find(e),s=this._find(t);return n===s?!1:(n.Rank<s.Rank?n.Parent=s:(s.Parent=n,n.Rank===s.Rank&&++n.Rank),--this.SetCount,!0)}},fn=class{constructor(){this.First=null,this._last=null}AddLast(e){e.Previous=this._last,e.Next=null,this._last?this._last.Next=e:this.First=e,this._last=e}Remove(e){e.Previous?e.Previous.Next=e.Next:this.First===e&&(this.First=e.Next),e.Next?e.Next.Previous=e.Previous:this._last===e&&(this._last=e.Previous),e.Previous=e.Next=null}MergeLists(e){e.First&&(this._last?this._last.Next=e.First:this.First=e.First,e.First.Previous=this._last,this._last=e._last,e.First=e._last=null)}*[Symbol.iterator](){let e=this.First;for(;e;)yield e,e=e.Next}},hi=class{constructor(e,t){this.Priority=e,this.Value=t,this.Marked=!1,this.Degree=0,this.Removed=!1,this.Parent=null,this.Children=new fn,this.Previous=this.Next=null}ToKeyValuePair(){return si(this.Priority,this.Value)}},li=class{constructor(e=Xs.Increasing,t=Ve){if(e!==0&&e!==1)throw new RangeError("Invalid heap direction.");this.Direction=e,this.PriorityComparison=g(t),this._roots=new fn,this._top=null,this.Count=0,this._owner={parent:null}}get IsEmpty(){return this.Count===0}get Top(){return this._top}_compare(e,t){return this.PriorityComparison(e,t)*(this.Direction===0?1:-1)}_ownerRoot(e){for(;e.parent;)e=e.parent;return e}_check(e){if(g(e),e.Removed||!e._owner||this._ownerRoot(e._owner)!==this._ownerRoot(this._owner))throw new G("Cell does not belong to this heap.")}Enqueue(e,t){g(e);let n=new hi(e,t);return n._owner=this._owner,this._roots.AddLast(n),(!this._top||this._compare(e,this._top.Priority)<0)&&(this._top=n),++this.Count,n}_cut(e,t){t.Children.Remove(e),--t.Degree,e.Parent=null,e.Marked=!1,this._roots.AddLast(e)}_cascade(e){for(let t=e.Parent;t;t=e.Parent){if(!e.Marked){e.Marked=!0;break}this._cut(e,t),e=t}}ChangeKey(e,t){if(this._check(e),g(t),this._compare(t,e.Priority)>0){this.Delete(e),e.Priority=t,e.Removed=!1,e._owner=this._owner,this._roots.AddLast(e),++this.Count,(!this._top||this._compare(t,this._top.Priority)<0)&&(this._top=e);return}e.Priority=t;let s=e.Parent;s&&this._compare(e.Priority,s.Priority)<0&&(this._cut(e,s),this._cascade(s)),(!this._top||this._compare(e.Priority,this._top.Priority)<0)&&(this._top=e)}Delete(e){this._check(e);let t=e.Parent;t&&(this._cut(e,t),this._cascade(t)),this._top=e,this.Dequeue()}Dequeue(){let e=this._top;if(!e)throw new G("Heap is empty.");for(let t of Array.from(e.Children))e.Children.Remove(t),t.Parent=null,t.Marked=!1,this._roots.AddLast(t);return this._roots.Remove(e),e.Removed=!0,e.Parent=null,e.Degree=0,--this.Count,this._top=null,this.Count&&this._consolidate(),e.ToKeyValuePair()}_consolidate(){let e=[];for(let t of Array.from(this._roots)){if(t.Parent)continue;let n=t;for(;e[n.Degree];){let s=e[n.Degree];e[n.Degree]=void 0,this._compare(s.Priority,n.Priority)<0&&([n,s]=[s,n]),this._roots.Remove(s),s.Parent=n,s.Marked=!1,n.Children.AddLast(s),++n.Degree}e[n.Degree]=n}for(let t of this._roots)(!this._top||this._compare(t.Priority,this._top.Priority)<0)&&(this._top=t)}Merge(e){if(g(e),e===this)throw new TypeError("Cannot merge a heap with itself.");if(e.Direction!==this.Direction||e.PriorityComparison!==this.PriorityComparison)throw new TypeError("Heaps must use identical ordering.");e.Count&&((!this._top||this._compare(e._top.Priority,this._top.Priority)<0)&&(this._top=e._top),this._roots.MergeLists(e._roots),this.Count+=e.Count,this._ownerRoot(e._owner).parent=this._ownerRoot(this._owner),e.Count=0,e._top=null,e._owner={parent:null})}*[Symbol.iterator](){let e=Array.from(this._roots).reverse();for(;e.length;){let t=e.pop();yield t.ToKeyValuePair();let n=Array.from(t.Children);for(let s=n.length-1;s>=0;--s)e.push(n[s])}}*GetDestructiveEnumerator(){for(;this.Count;)yield this.Dequeue()}DrawHeap(){let e=[],t=0,n=Array.from(this._roots,s=>({c:s,level:0})).reverse();for(;n.length;){let{c:s,level:r}=n.pop(),o=`${s.Priority}${s.Marked?"*":""} `;e[r]=(e[r]??"").padEnd(t," ")+o;let a=Array.from(s.Children);if(a.length)for(let h=a.length-1;h>=0;--h)n.push({c:a[h],level:r+1});else t+=o.length}return e.join(`
`)}},Ks=class{constructor(...e){let t,n=Ve;if(typeof e[0]=="number"){if(e[0]<0)throw new RangeError("Negative capacity.");t=e[2],n=e.length>3?e[3]:Ve}else if(e[0]instanceof globalThis.Map){let s=e[0];t=r=>{if(!s.has(r))throw new TypeError("Key not found.");return s.get(r)},n=e.length>1?e[1]:Ve}else t=e[0],n=e.length>1?e[1]:Ve;this._distance=g(t),this._heap=new li(Xs.Increasing,g(n)),this._cells=new y}get Count(){return this._heap.Count}Contains(e){return this._cells.has(e)&&!this._cells.get(e).Removed}Enqueue(e){g(e),this._cells.set(e,this._heap.Enqueue(this._distance(e),e))}Dequeue(){return this._heap.Dequeue().Value}Peek(){if(!this.Count)throw new G("Queue is empty.");return this._heap.Top.Value}Update(e){g(e);let t=this._cells.get(e);if(t&&!t.Removed)this._heap.ChangeKey(t,this._distance(e));else throw new G("Vertex has not been enqueued or was removed.")}ToArray(){return Array.from(this._heap,e=>e.Value)}},Qs=class{constructor(e,t,n=Ve){if(this.KeyMaxValue=g(t),!(e>0&&e<=.5))throw new RangeError("Error rate must be in (0, 0.5].");this.KeyComparison=g(n),this.ErrorRate=e,this.MinRank=2+2*Math.ceil(Math.log2(1/e)),this.Count=0,this._header={},this._tail={Rank:1/0,Prev:this._header},this._header.Next=this._tail}Add(e,t){if(g(e),this.KeyComparison(e,this.KeyMaxValue)>=0)throw new RangeError("Key must be below the maximum sentinel.");let n={Key:e,Value:t,Next:null};this._meld({CKey:e,Rank:0,Next:null,Child:null,IL:n,ILTail:n}),++this.Count}_meld(e){let t=this._header.Next;for(;e.Rank>t.Rank;)t=t.Next;let n=t.Prev;for(;e.Rank===t.Rank;){let r,o;this.KeyComparison(t.Queue.CKey,e.CKey)>0?(r=e,o=t.Queue):(r=t.Queue,o=e),e={CKey:r.CKey,Rank:r.Rank+1,Next:r,Child:o,IL:r.IL,ILTail:r.ILTail},t=t.Next}let s=n===t.Prev?{}:n.Next;Object.assign(s,{Queue:e,Rank:e.Rank,Prev:n,Next:t}),n.Next=s,t.Prev=s,this._fixMin(s)}_fixMin(e){if(e===this._header)return;let t=e.Next===this._tail?e:e.Next.SuffixMin;for(;e!==this._header;)this.KeyComparison(t.Queue.CKey,e.Queue.CKey)>0&&(t=e),e.SuffixMin=t,e=e.Prev}_shift(e){return e.IL=e.ILTail=null,!e.Next&&!e.Child?(e.CKey=this.KeyMaxValue,e):(e.Next=this._shift(e.Next),this.KeyComparison(e.Next.CKey,e.Child.CKey)>0&&([e.Child,e.Next]=[e.Next,e.Child]),e.IL=e.Next.IL,e.ILTail=e.Next.ILTail,e.CKey=e.Next.CKey,e.Rank>this.MinRank&&(e.Rank%2===1||e.Child.Rank<e.Rank-1)&&(e.Next=this._shift(e.Next),this.KeyComparison(e.Next.CKey,e.Child.CKey)>0&&([e.Child,e.Next]=[e.Next,e.Child]),this.KeyComparison(e.Next.CKey,this.KeyMaxValue)!==0&&e.Next.IL&&(e.Next.ILTail.Next=e.IL,e.IL=e.Next.IL,e.ILTail||(e.ILTail=e.Next.ILTail),e.CKey=e.Next.CKey)),this.KeyComparison(e.Child.CKey,this.KeyMaxValue)===0&&(this.KeyComparison(e.Next.CKey,this.KeyMaxValue)===0?e.Child=e.Next=null:(e.Child=e.Next.Child,e.Next=e.Next.Next)),e)}RemoveMinimum(){if(!this.Count)throw new G("Heap is empty.");let e=this._header.Next.SuffixMin;for(;!e.Queue.IL;){let n=e.Queue,s=0;for(;n.Next;)n=n.Next,++s;if(s<Math.trunc(e.Rank/2))for(e.Prev.Next=e.Next,e.Next.Prev=e.Prev,this._fixMin(e.Prev),n=e.Queue;n.Next;)this._meld(n.Child),n=n.Next;else e.Queue=this._shift(e.Queue),this.KeyComparison(e.Queue.CKey,this.KeyMaxValue)===0&&(e.Prev.Next=e.Next,e.Next.Prev=e.Prev,e=e.Prev),this._fixMin(e);e=this._header.Next.SuffixMin}let t=e.Queue.IL;return e.Queue.IL=t.Next,e.Queue.IL||(e.Queue.ILTail=null),--this.Count,si(t.Key,t.Value)}*[Symbol.iterator](){}};var Te=Object.freeze({NotRunning:0,Running:1,PendingAbortion:2,Finished:3,Aborted:4}),di=class extends Error{constructor(e="Algorithm aborted."){super(e),this.name="OperationCanceledException"}};function N(i,e){if(typeof Re[i]=="function")return new Re[i](e);let t=new Error(e);return t.name=i,t}var ie=v;function De(i,e){for(let t of e.split(" "))i[t]||(i[t]=new L)}var tt=class{constructor(){this.IsCancelling=!1,this.CancelRequested=new L,this.CancelReset=new L,this.Cancelling=this.CancelRequested}Cancel(){this.IsCancelling||(this.IsCancelling=!0,this.Cancelling.emit(this,{}))}ResetCancel(){let e=this.IsCancelling;this.IsCancelling=!1,e&&this.CancelReset.emit(this,{})}},Ys=class{constructor(e){this.Host=g(e,"host")}get CancelManager(){return this._cancelManager??=this.Host.GetService(tt)}},B=class{constructor(e,t){arguments.length===1&&(t=e,e=null),this.VisitedGraph=g(t,"visitedGraph"),this.State=Te.NotRunning,this.SyncRoot={},this._services=new y,this.Services=new Ys(e??this),De(this,"StateChanged Started Finished Aborted")}TryGetService(e){return g(e,"serviceType"),e===tt||e==="ICancelManager"||e==="CancelManager"?(this._services.has(tt)||this._services.set(tt,new tt),this._services.get(tt)):this._services.get(e)}GetService(e){let t=this.TryGetService(e);if(t===void 0)throw N("InvalidOperationException","Service not found.");return t}Compute(){if(this.State===Te.Running||this.State===Te.PendingAbortion)throw N("InvalidOperationException","Algorithm is already running.");this.State=Te.Running,this.Services.CancelManager.ResetCancel(),this.OnStarted({}),this.OnStateChanged({});try{this.Initialize(),this.ThrowIfCancellationRequested(),this.InternalCompute()}catch(e){if(!(e instanceof di))throw e}finally{try{this.Clean()}finally{this.State=this.State===Te.PendingAbortion?Te.Aborted:Te.Finished,this.State===Te.Aborted?this.OnAborted({}):this.OnFinished({}),this.Services.CancelManager.ResetCancel(),this.OnStateChanged({})}}return this}Abort(){this.State===Te.Running&&(this.State=Te.PendingAbortion,this.Services.CancelManager.Cancel(),this.OnStateChanged({}))}ThrowIfCancellationRequested(){if(this.Services.CancelManager.IsCancelling)throw new di}OnStateChanged(e={}){this.StateChanged.emit(this,e)}OnStarted(e={}){this.Started.emit(this,e)}OnFinished(e={}){this.Finished.emit(this,e)}OnAborted(e={}){this.Aborted.emit(this,e)}Initialize(){}InternalCompute(){throw N("NotImplementedException","Override InternalCompute().")}Clean(){}},ce=class extends B{constructor(...e){super(...e),this._hasRoot=!1,De(this,"RootVertexChanged")}TryGetRootVertex(){return this._hasRoot?this._root:void 0}SetRootVertex(e){g(e,"root");let t=!this._hasRoot||!ie(e,this._root);this._root=e,this._hasRoot=!0,t&&this.OnRootVertexChanged({})}ClearRootVertex(){let e=this._hasRoot;this._hasRoot=!1,this._root=void 0,e&&this.OnRootVertexChanged({})}OnRootVertexChanged(e={}){this.RootVertexChanged.emit(this,e)}AssertRootInGraph(e){if(!this.VisitedGraph.ContainsVertex(e))throw N("VertexNotFoundException","Root vertex is not part of the graph.")}GetAndAssertRootInGraph(){if(!this._hasRoot)throw N("InvalidOperationException","Root vertex not set.");return this.AssertRootInGraph(this._root),this._root}Compute(e){if(arguments.length&&(this.SetRootVertex(e),!this.VisitedGraph.ContainsVertex(e)))throw N("ArgumentException","Graph does not contain the provided root vertex.");return super.Compute()}},Mt=class extends ce{constructor(...e){super(...e),this._hasTarget=!1,De(this,"TargetVertexChanged TargetReached")}TryGetTargetVertex(){return this._hasTarget?this._target:void 0}SetTargetVertex(e){g(e,"target");let t=!this._hasTarget||!ie(e,this._target);this._target=e,this._hasTarget=!0,t&&this.OnTargetVertexChanged({})}ClearTargetVertex(){let e=this._hasTarget;this._hasTarget=!1,this._target=void 0,e&&this.OnTargetVertexChanged({})}Compute(e,t){if(arguments.length>1&&(g(e,"root"),this.SetTargetVertex(t),!this.VisitedGraph.ContainsVertex(t)))throw N("ArgumentException","Graph does not contain the provided target vertex.");return arguments.length?super.Compute(e):super.Compute()}OnTargetVertexChanged(e={}){this.TargetVertexChanged.emit(this,e)}OnTargetReached(){this.TargetReached.emit(this,{})}},ci=(i,e)=>i<e?-1:i>e?1:0,Ne=Object.freeze({ShortestDistance:Object.freeze({InitialDistance:Number.MAX_VALUE,Compare:ci,Combine:(i,e)=>i+e}),CriticalDistance:Object.freeze({InitialDistance:-Number.MAX_VALUE,Compare:(i,e)=>-ci(i,e),Combine:(i,e)=>i+e}),EdgeShortestDistance:Object.freeze({InitialDistance:0,Compare:ci,Combine:(i,e)=>i+e}),Prim:Object.freeze({InitialDistance:Number.MAX_VALUE,Compare:ci,Combine:(i,e)=>e})}),ve=class{constructor(e=(t,n)=>t.priority-n.priority){this.items=[],this.compareItems=e,this.sequence=0}get Count(){return this.items.length}_compare(e,t){return this.compareItems(e.value,t.value)||e.sequence-t.sequence}Enqueue(e){let t={value:e,sequence:this.sequence++},n=this.items.length;for(this.items.push(t);n;){let s=n-1>>1;if(this._compare(this.items[s],t)<=0)break;this.items[n]=this.items[s],n=s}this.items[n]=t}Dequeue(){if(!this.Count)throw N("InvalidOperationException","Queue is empty.");let e=this.items[0],t=this.items.pop();if(this.Count){let n=0;for(;n*2+1<this.Count;){let s=n*2+1;if(s+1<this.Count&&this._compare(this.items[s+1],this.items[s])<0&&s++,this._compare(t,this.items[s])<=0)break;this.items[n]=this.items[s],n=s}this.items[n]=t}return e.value}};var{White:ye,Gray:Me,Black:xn}=Ce;function ui(i){i=[...i];let e=null;(i[0]==null||i[0]?.Services&&i[1]?.ContainsVertex)&&(e=i.shift());let t=g(i.shift(),"visitedGraph");if(typeof t.ContainsVertex!="function")throw N("ArgumentException","visitedGraph must implement ContainsVertex.");return{host:e,graph:t,args:i}}function zo(i,e){if(!i.has(e))throw N("VertexNotFoundException","Vertex color not available.");return i.get(e)}function wt(i,e,t,n){i._undirected&&!(e==="ExamineEdge"&&i instanceof Lt)?i[e].emit(i,new Ye(t,ie(t.Target,n))):i[e].emit(t)}var Lt=class extends ce{constructor(...e){let{host:t,graph:n,args:s}=ui(e);if(super(t,n),this.VertexQueue=s[0]??null,this.VerticesColors=s[1]??new y,this.OutEdgesFilter=s[2]??(r=>r),s.length&&s[0]==null)throw N("ArgumentNullException","vertexQueue cannot be null.");if(s.length>1&&s[1]==null)throw N("ArgumentNullException","verticesColors cannot be null.");if(s.length>2&&s[2]==null)throw N("ArgumentNullException","outEdgesFilter cannot be null.");De(this,"InitializeVertex StartVertex DiscoverVertex ExamineVertex ExamineEdge TreeEdge NonTreeEdge GrayTarget BlackTarget FinishVertex")}GetVertexColor(e){return zo(this.VerticesColors,e)}Initialize(){this.ThrowIfCancellationRequested(),this.VerticesColors.clear();for(let e of this.VisitedGraph.Vertices)this.VerticesColors.set(e,ye),this.InitializeVertex.emit(e)}_edges(e){return this.OutEdgesFilter(this._undirected?this.VisitedGraph.AdjacentEdges(e):this.VisitedGraph.OutEdges(e))}InternalCompute(){if(this._undirected)return this._visit([this.GetAndAssertRootInGraph()]);if(this.VisitedGraph.VertexCount===0)return;if(this._hasRoot)return this.AssertRootInGraph(this._root),this._visit([this._root]);let e=new _(Array.from(this.VisitedGraph.Edges,t=>t.Target));this._visit(Array.from(this.VisitedGraph.Vertices).filter(t=>!e.has(t)))}Visit(e){this.AssertRootInGraph(e),this._visit([e])}_visit(e){let t=this.VertexQueue,n=[],s=0,r=h=>t?t.Enqueue(h):n.push(h),o=()=>t?t.Dequeue():n[s++],a=()=>t?t.Count:n.length-s;for(let h of e)this.StartVertex.emit(h),this.VerticesColors.set(h,Me),this.DiscoverVertex.emit(h),r(h);for(;a();){this.ThrowIfCancellationRequested();let h=o();this.ExamineVertex.emit(h);for(let l of this._edges(h)){let d=this._undirected&&ie(l.Target,h)?l.Source:l.Target;wt(this,"ExamineEdge",l,h);let u=this.GetVertexColor(d);u===ye?(wt(this,"TreeEdge",l,h),this.VerticesColors.set(d,Me),this.DiscoverVertex.emit(d),r(d)):(wt(this,"NonTreeEdge",l,h),wt(this,u===Me?"GrayTarget":"BlackTarget",l,h))}this.VerticesColors.set(h,xn),this.FinishVertex.emit(h)}}},Mo=class extends Lt{constructor(...e){super(...e),this._undirected=!0}},bt=class extends ce{constructor(...e){let{host:t,graph:n,args:s}=ui(e);if(super(t,n),this.VerticesColors=s[0]instanceof globalThis.Map?s[0]:new y,this.OutEdgesFilter=s.find(r=>typeof r=="function")??(r=>r),s.length&&s[0]==null)throw N("ArgumentNullException","verticesColors cannot be null.");if(s.length>1&&s[1]==null)throw N("ArgumentNullException","outEdgesFilter cannot be null.");this.AdjacentEdgesFilter=this.OutEdgesFilter,this.ProcessAllComponents=!1,this._maxDepth=2147483647,De(this,"InitializeVertex StartVertex DiscoverVertex ExamineEdge TreeEdge BackEdge ForwardOrCrossEdge FinishVertex VertexMaxDepthReached")}get MaxDepth(){return this._maxDepth}set MaxDepth(e){if(!Number.isInteger(e)||e<0)throw N("ArgumentOutOfRangeException","MaxDepth must be a non-negative integer.");this._maxDepth=e}GetVertexColor(e){return this._implicit?this.VerticesColors.get(e)??ye:zo(this.VerticesColors,e)}Initialize(){if(this.VerticesColors.clear(),!this._implicit)for(let e of this.VisitedGraph.Vertices)this.VerticesColors.set(e,ye),this.InitializeVertex.emit(e)}*_edges(e){this._undirected?yield*this.AdjacentEdgesFilter(this.VisitedGraph.AdjacentEdges(e)):(yield*this.OutEdgesFilter(this.VisitedGraph.OutEdges(e)),this._bidirectional&&(yield*this.VisitedGraph.InEdges(e)))}InternalCompute(){if(this._implicit&&!this._hasRoot&&this.GetAndAssertRootInGraph(),!(this._hasRoot&&(this.AssertRootInGraph(this._root),this.StartVertex.emit(this._root),this.Visit(this._root),!this.ProcessAllComponents)))for(let e of this.VisitedGraph.Vertices??[])this.ThrowIfCancellationRequested(),this.GetVertexColor(e)===ye&&(this.StartVertex.emit(e),this.Visit(e))}Visit(e){let t=new _,n=[],s=(r,o)=>{(this._implicit||this._bidirectional)&&o>this.MaxDepth||(this.VerticesColors.set(r,Me),this.DiscoverVertex.emit(r),n.push({v:r,depth:o,edges:this._edges(r)[Symbol.iterator]()}))};for(s(e,0);n.length;){this.ThrowIfCancellationRequested();let r=n[n.length-1];if(r.depth>this.MaxDepth){this.VertexMaxDepthReached.emit(r.v),n.pop(),this.VerticesColors.set(r.v,xn),this.FinishVertex.emit(r.v);continue}let o=r.edges.next();if(o.done){n.pop(),this.VerticesColors.set(r.v,xn),this.FinishVertex.emit(r.v);continue}let a=o.value;if(this._undirected){if(t.has(a))continue;t.add(a)}let h=(this._undirected||this._bidirectional)&&ie(a.Target,r.v)?a.Source:a.Target;wt(this,"ExamineEdge",a,r.v);let l=this.GetVertexColor(h);l===ye?(wt(this,"TreeEdge",a,r.v),s(h,r.depth+1)):wt(this,l===Me?"BackEdge":"ForwardOrCrossEdge",a,r.v)}}},Lo=class extends bt{constructor(...e){super(...e),this._undirected=!0}},Oo=class extends bt{constructor(...e){super(...e),this._bidirectional=!0}},Bo=class extends bt{constructor(...e){super(...e),this._implicit=!0}},Zs=class extends ce{constructor(...e){let{host:t,graph:n,args:s}=ui(e);super(t,n),this.EdgesColors=s.length?g(s[0],"edgesColors"):new y,this.ProcessAllComponents=!1,this._maxDepth=2147483647,De(this,"InitializeEdge StartVertex StartEdge DiscoverTreeEdge TreeEdge BackEdge ForwardOrCrossEdge FinishEdge")}get MaxDepth(){return this._maxDepth}set MaxDepth(e){if(!Number.isInteger(e)||e<0)throw N("ArgumentOutOfRangeException","MaxDepth must be a non-negative integer.");this._maxDepth=e}Initialize(){if(this.EdgesColors.clear(),!this._implicit)for(let e of this.VisitedGraph.Edges)this.EdgesColors.set(e,ye),this.InitializeEdge.emit(e)}InternalCompute(){if(this._implicit&&!this._hasRoot&&this.GetAndAssertRootInGraph(),this._hasRoot){this.AssertRootInGraph(this._root),this.StartVertex.emit(this._root);for(let e of this.VisitedGraph.OutEdges(this._root))(this.EdgesColors.get(e)??ye)===ye&&(this.StartEdge.emit(e),this.Visit(e));if(!this.ProcessAllComponents)return}for(let e of this.VisitedGraph.Edges??[])(this.EdgesColors.get(e)??ye)===ye&&(this.StartEdge.emit(e),this.Visit(e))}Visit(e){let t=[],n=(s,r)=>{if(r>this.MaxDepth){this._implicit||(this.EdgesColors.set(s,xn),this.FinishEdge.emit(s));return}this.EdgesColors.set(s,Me),this.TreeEdge.emit(s),t.push({edge:s,depth:r,iterator:this.VisitedGraph.OutEdges(s.Target)[Symbol.iterator]()})};for(n(e,0);t.length;){this.ThrowIfCancellationRequested();let s=t[t.length-1],r=s.depth>this.MaxDepth?{done:!0}:s.iterator.next();if(r.done){t.pop(),this.EdgesColors.set(s.edge,xn),this.FinishEdge.emit(s.edge);continue}let o=r.value,a=this.EdgesColors.get(o)??ye;a===ye?(this.DiscoverTreeEdge.emit(s.edge,o),n(o,s.depth+1)):(a===Me?this.BackEdge:this.ForwardOrCrossEdge).emit(o)}}},qo=class extends Zs{constructor(...e){super(...e),this._implicit=!0}},jo=class extends Mt{constructor(...e){let{host:t,graph:n,args:s}=ui(e);super(t,n),this.Weights=g(s[0],"edgeWeights"),this.DistanceRelaxer=s.length>1?g(s[1],"distanceRelaxer"):Ne.ShortestDistance,this.OperatorMaxCount=-1,De(this,"TreeEdge")}InternalCompute(){let e=this.GetAndAssertRootInGraph(),t=this.TryGetTargetVertex();if(t===void 0)throw N("InvalidOperationException","Target vertex not set.");if(this.AssertRootInGraph(t),ie(e,t)){this.OnTargetReached();return}let n=new ve((a,h)=>this.DistanceRelaxer.Compare(a.priority,h.priority)),s=new y([[e,0]]),r=new y,o=new _;n.Enqueue({vertex:e,priority:0});for(let a of this.VisitedGraph.OutEdges(e))r.set(a,ye);for(;n.Count;){this.ThrowIfCancellationRequested();let{vertex:a,priority:h}=n.Dequeue();if(!(s.get(a)!==h||o.has(a))){if(s.delete(a),o.add(a),ie(a,t)){this.OnTargetReached();return}for(let l of this.VisitedGraph.OutEdges(a)){if(ie(l.Source,l.Target)||o.has(l.Target))continue;if(r.get(l)===Me){r.delete(l);continue}let d=this.Weights(l);if(d<0)throw N("NegativeWeightException","Best-first search requires non-negative weights.");let u=this.DistanceRelaxer.Combine(h,d);r.set(l,Me),(!s.has(l.Target)||this.DistanceRelaxer.Compare(u,s.get(l.Target))<0)&&(s.set(l.Target,u),n.Enqueue({vertex:l.Target,priority:u}),this.TreeEdge.emit(l))}this.OperatorMaxCount=Math.max(this.OperatorMaxCount,r.size);for(let l of this.VisitedGraph.InEdges(a))r.get(l)===Me&&r.delete(l)}}}};var{White:Js,Gray:yn,Black:Ot}=Ce;function wn(i){let e=[...i],t=null;(e[0]==null||e[0]?.Services&&e[1]?.ContainsVertex)&&(t=e.shift());let n=g(e.shift(),"visitedGraph");if(typeof n.ContainsVertex!="function")throw N("ArgumentException","visitedGraph must implement ContainsVertex.");return{host:t,graph:n,args:e}}function qt(i,e,t=!1){let n=i(e);if(typeof n!="number"||!Number.isFinite(n))throw N("ArgumentException","Edge weights must be finite numbers.");if(t&&n<0)throw N("NegativeWeightException","Algorithm requires non-negative edge weights.");return n}function bn(i,e,t=!1){g(e,"vertex");let n=[],s=new _;for(;i.has(e);){if(s.has(e))throw N("InvalidOperationException","The predecessor map contains a cycle.");s.add(e);let r=i.get(e);n.push(r),e=t&&ie(r.Source,e)?r.Target:r.Source}return n.length?n.reverse():void 0}var nt=class extends ce{constructor(...e){let{host:t,graph:n,args:s}=wn(e);super(t,n),this.Weights=g(s[0],"edgeWeights"),this.DistanceRelaxer=s.length>1?g(s[1],"distanceRelaxer"):Ne.ShortestDistance,this.Distances=null,this.VerticesColors=null,this.Predecessors=new y,De(this,"TreeEdge InitializeVertex DiscoverVertex StartVertex ExamineVertex ExamineEdge FinishVertex EdgeNotRelaxed")}TryGetDistance(e){if(g(e,"vertex"),!this.Distances)throw N("InvalidOperationException","Run the algorithm before.");return this.Distances.get(e)}GetDistance(e){let t=this.TryGetDistance(e);if(t===void 0)throw N("VertexNotFoundException","Vertex distance not available.");return t}GetDistances(){return this.Distances?this.Distances.entries():[][Symbol.iterator]()}DistancesIndexGetter(){return e=>this.GetDistance(e)}OnTreeEdge(e,t=!1){this._undirected?this.TreeEdge.emit(this,new Ye(e,t)):this.TreeEdge.emit(e)}GetVertexDistance(e){return this.GetDistance(e)}SetVertexDistance(e,t){this.Distances.set(e,t)}GetVertexColor(e){if(!this.VerticesColors.has(e))throw N("VertexNotFoundException","Vertex color not available.");return this.VerticesColors.get(e)}TryGetPath(e){return bn(this.Predecessors,e,this._undirected)}Initialize(){this.Distances??=new y,this.VerticesColors??=new y,this.Distances.clear(),this.VerticesColors.clear(),this.Predecessors.clear();for(let e of this.VisitedGraph.Vertices)this.Distances.set(e,this.DistanceRelaxer.InitialDistance),this.VerticesColors.set(e,Js),this.InitializeVertex.emit(e)}_emitEdge(e,t,n){this._undirected&&e!=="ExamineEdge"?this[e].emit(this,new Ye(t,ie(t.Target,n))):this[e].emit(t)}Relax(e,t=e.Source,n=e.Target){let s=this.Distances.get(t);if(s===this.DistanceRelaxer.InitialDistance||s===1/0)return!1;let r=this.DistanceRelaxer.Combine(s,qt(this.Weights,e));return this.DistanceRelaxer.Compare(r,this.Distances.get(n))<0?(this.Distances.set(n,r),this.Predecessors.set(n,e),!0):!1}},$o=class extends nt{constructor(...e){super(...e),this._undirected=!0}},Bt=class extends nt{InternalCompute(){if(this._hasRoot)this.AssertRootInGraph(this._root),this._fromRoot(this._root);else for(let e of this.VisitedGraph.Vertices)this.GetVertexColor(e)===Js&&this._fromRoot(e)}_fromRoot(e){let t=new ve((n,s)=>this.DistanceRelaxer.Compare(n.priority,s.priority));for(this.Distances.set(e,0),this.StartVertex.emit(e),this.VerticesColors.set(e,yn),this.DiscoverVertex.emit(e),t.Enqueue({vertex:e,distance:0,priority:0});t.Count;){this.ThrowIfCancellationRequested();let n=t.Dequeue(),s=n.vertex;if(n.distance!==this.Distances.get(s)||this.GetVertexColor(s)===Ot)continue;this.ExamineVertex.emit(s);let r=this._undirected?this.VisitedGraph.AdjacentEdges(s):this.VisitedGraph.OutEdges(s);for(let o of r){this.ThrowIfCancellationRequested();let a=this._undirected&&ie(o.Target,s)?o.Source:o.Target;this.ExamineEdge.emit(o),qt(this.Weights,o,!0);let h=this.GetVertexColor(a);if(!(h===Ot&&!this.CostHeuristic))if(this.Relax(o,s,a)){let l=this.Distances.get(a),d;this.CostHeuristic&&h!==Ot?(d=this.DistanceRelaxer.Combine(l,this.CostHeuristic(a)),this._emitEdge("TreeEdge",o,s)):(this._emitEdge("TreeEdge",o,s),d=this.CostHeuristic?this.DistanceRelaxer.Combine(l,this.CostHeuristic(a)):l),this.VerticesColors.set(a,yn),h===Js&&this.DiscoverVertex.emit(a),t.Enqueue({vertex:a,distance:l,priority:d})}else this._emitEdge("EdgeNotRelaxed",o,s)}this.VerticesColors.set(s,Ot),this.FinishVertex.emit(s)}}},pi=class extends Bt{constructor(...e){super(...e),this._undirected=!0}},gi=class extends Bt{constructor(...e){let{host:t,graph:n,args:s}=wn(e);super(t,n,s[0],s.length>2?g(s[2],"distanceRelaxer"):Ne.ShortestDistance),this.CostHeuristic=g(s[1],"costHeuristic")}},fi=class extends nt{constructor(...e){super(...e),this.FoundNegativeCycle=!1,De(this,"EdgeMinimized EdgeNotMinimized")}Initialize(){super.Initialize(),this.FoundNegativeCycle=!1;for(let t of this.VisitedGraph.Vertices)this.Distances.set(t,1/0);let e=this._hasRoot?this.GetAndAssertRootInGraph():this.VisitedGraph.Vertices[Symbol.iterator]().next().value;if(e===void 0)throw N("InvalidOperationException","Graph is empty.");this.Distances.set(e,0)}InternalCompute(){for(let e=0;e<this.VisitedGraph.VertexCount;e++){let t=!1;for(let n of this.VisitedGraph.Edges)this.ThrowIfCancellationRequested(),this.ExamineEdge.emit(n),this.Relax(n)?(t=!0,this.TreeEdge.emit(n)):this.EdgeNotRelaxed.emit(n);if(!t)break}for(let e of this.VisitedGraph.Edges){let t=this.Distances.get(e.Source);if(t!==1/0&&this.DistanceRelaxer.Compare(this.DistanceRelaxer.Combine(t,qt(this.Weights,e)),this.Distances.get(e.Target))<0){this.EdgeMinimized.emit(e),this.FoundNegativeCycle=!0;return}this.EdgeNotMinimized.emit(e)}}Clean(){for(let e of this.VisitedGraph.Vertices)this.VerticesColors.set(e,Ot)}},mi=class extends nt{InternalCompute(){let e=this.GetAndAssertRootInGraph(),t=[...this.VisitedGraph.Vertices],n=new y(t.map(r=>[r,0]));for(let r of this.VisitedGraph.Edges)n.set(r.Target,n.get(r.Target)+1);let s=t.filter(r=>n.get(r)===0);for(let r=0;r<s.length;r++)for(let o of this.VisitedGraph.OutEdges(s[r]))n.set(o.Target,n.get(o.Target)-1),n.get(o.Target)||s.push(o.Target);if(s.length!==t.length)throw N("NonAcyclicGraphException","DAG shortest paths require an acyclic graph.");this.Distances.set(e,0),this.VerticesColors.set(e,yn),this.DiscoverVertex.emit(e);for(let r of s){this.ThrowIfCancellationRequested(),this.StartVertex.emit(r),this.VerticesColors.set(r,yn),this.ExamineVertex.emit(r);for(let o of this.VisitedGraph.OutEdges(r))this.VerticesColors.set(o.Target,yn),this.ExamineEdge.emit(o),this.DiscoverVertex.emit(o.Target),(this.Relax(o)?this.TreeEdge:this.EdgeNotRelaxed).emit(o);this.VerticesColors.set(r,Ot),this.FinishVertex.emit(r)}}},Wo=class extends B{constructor(...e){let{host:t,graph:n,args:s}=wn(e);super(t,n),this.Weights=g(s[0],"edgeWeights"),this.DistanceRelaxer=s.length>1?g(s[1],"distanceRelaxer"):Ne.ShortestDistance,this.Distances=new y,this._next=new y}Initialize(){this.Distances.clear(),this._next.clear();for(let e of this.VisitedGraph.Vertices)this.Distances.set(e,new y([[e,0]])),this._next.set(e,new y);for(let e of this.VisitedGraph.Edges){let t=qt(this.Weights,e),n=this.Distances.get(e.Source);if((!n.has(e.Target)||this.DistanceRelaxer.Compare(t,n.get(e.Target))<0)&&(n.set(e.Target,t),this._next.get(e.Source).set(e.Target,e)),!this.VisitedGraph.IsDirected){let s=this.Distances.get(e.Target);(!s.has(e.Source)||this.DistanceRelaxer.Compare(t,s.get(e.Source))<0)&&(s.set(e.Source,t),this._next.get(e.Target).set(e.Source,e))}}}InternalCompute(){let e=[...this.VisitedGraph.Vertices];for(let t of e){this.ThrowIfCancellationRequested();let n=this.Distances.get(t);for(let s of e){let r=this.Distances.get(s);if(!r.has(t))continue;let o=r.get(t);for(let a of e){if(!n.has(a))continue;let h=this.DistanceRelaxer.Combine(o,n.get(a));(!r.has(a)||this.DistanceRelaxer.Compare(h,r.get(a))<0)&&(r.set(a,h),this._next.get(s).set(a,this._next.get(s).get(t)??this._next.get(t).get(a)))}}}for(let t of e)if(this.Distances.get(t).get(t)<0)throw N("NegativeCycleGraphException","Graph contains a negative cycle.")}TryGetDistance(e,t){return g(e,"source"),g(t,"target"),this.Distances.get(e)?.get(t)}TryGetPath(e,t){if(g(e,"source"),g(t,"target"),ie(e,t)||!this._next.get(e)?.has(t))return;let n=[],s=new _;for(;!ie(e,t);){if(s.has(e))throw N("InvalidOperationException","Cycle in shortest path.");s.add(e);let r=this._next.get(e)?.get(t);if(!r)return;n.push(r),e=!this.VisitedGraph.IsDirected&&ie(r.Target,e)?r.Source:r.Target}return n}Dump(e){g(e,"writer");let t=["data:"];for(let[s,r]of this.Distances)for(let[o,a]of r)t.push(`${s}->${o}: ${a}`);let n=t.join(`
`);if(typeof e=="function")e(n);else if(e.WriteLine)for(let s of t)e.WriteLine(s);else e.write(n);return n}},Vh=1,Uo=new WeakMap,xi=class i{constructor(e){this.Edges=[...g(e,"edges")],Uo.set(this,Vh++)}get Count(){return this.Edges.length}GetVertex(e){return this.Edges[e].Source}GetEdge(e){return this.Edges[e]}GetEdges(e){return this.Edges.slice(0,e)}Equals(e){return e instanceof i&&this.Count===e.Count&&this.Edges.every((t,n)=>v(t,e.Edges[n]))}GetHashCode(){return Uo.get(this)}[Symbol.iterator](){return this.Edges[Symbol.iterator]()}};function Ho(i,e,t,n,s=new _,r=new _){let o=new y([[e,0]]),a=new y,h=new ve;for(h.Enqueue({vertex:e,priority:0});h.Count;){let{vertex:l,priority:d}=h.Dequeue();if(o.get(l)===d){if(ie(l,t))return bn(a,l)??[];for(let u of i.OutEdges(l)){if(r.has(u)||s.has(u.Target))continue;let p=d+qt(n,u,!0);p<(o.get(u.Target)??1/0)&&(o.set(u.Target,p),a.set(u.Target,u),h.Enqueue({vertex:u.Target,priority:p}))}}}}var Ko=class{static SortedPath=xi;constructor(e,t,n,s,r=null,o=null){if(this.VisitedGraph=g(e,"graph").Clone(),g(t,"source"),g(n,"target"),!e.ContainsVertex(t)||!e.ContainsVertex(n))throw N("ArgumentException","Both endpoints must be in the graph.");if(!Number.isInteger(s)||s<1)throw N("ArgumentOutOfRangeException","k must be a positive integer.");this.Source=t,this.Target=n,this.K=s,this.Weights=r??(a=>a.Tag),this.Filter=o??(a=>a)}Execute(){let e=this.VisitedGraph,t=Ho(e,this.Source,this.Target,this.Weights);if(t===void 0||!t.length)throw N("NoPathFoundException","No path found between the supplied vertices.");let n=[t],s=new ve,r=new _,o=new y([...e.Edges].map((h,l)=>[h,l])),a=h=>h.map(l=>o.get(l)).join(",");r.add(a(t));for(let h=1;h<this.K;h++){let l=n[h-1];for(let d=0;d<l.length;d++){let u=l.slice(0,d),p=l[d].Source,x=new _,w=new _(u.map(f=>f.Source));for(let f of n)f.length>d&&u.every((S,T)=>v(S,f[T]))&&x.add(f[d]);let b=Ho(e,p,this.Target,this.Weights,w,x);if(b===void 0)continue;let m=[...u,...b],E=a(m);r.has(E)||(r.add(E),s.Enqueue({path:m,priority:m.reduce((f,S)=>f+this.Weights(S),0)}))}if(!s.Count)break;n.push(s.Dequeue().path)}return[...this.Filter(n.map(h=>new xi(h)))]}},er=class extends Mt{constructor(...e){let{host:t,graph:n,args:s}=wn(e);super(t,n),this.DistanceRelaxer=s[0]??Ne.ShortestDistance,this._shortestPathCount=3,this.ComputedShortestPaths=[]}get ShortestPathCount(){return this._shortestPathCount}set ShortestPathCount(e){if(!Number.isInteger(e)||e<=1)throw N("ArgumentOutOfRangeException","ShortestPathCount must be more than 1.");this._shortestPathCount=e}get ComputedShortestPathCount(){return this.ComputedShortestPaths.length}AddComputedShortestPath(e){this.ComputedShortestPaths.push([...e])}Initialize(){this.ComputedShortestPaths=[]}},yi=class extends er{constructor(...e){let{host:t,graph:n,args:s}=wn(e);super(t,n,s.length>1?g(s[1],"distanceRelaxer"):Ne.ShortestDistance),this.Weights=g(s[0],"edgeWeights")}InternalCompute(){let e=this.GetAndAssertRootInGraph(),t=this.TryGetTargetVertex();if(t===void 0)throw N("InvalidOperationException","Target vertex not set.");if(this.AssertRootInGraph(t),ie(e,t))return;let n=this.VisitedGraph,s=new y([...n.Vertices].map(w=>[w,[]]));for(let w of n.Edges)s.get(w.Target).push(w);let r=new y([[t,0]]),o=new y,a=new ve((w,b)=>this.DistanceRelaxer.Compare(w.priority,b.priority));for(a.Enqueue({vertex:t,priority:0});a.Count;){this.ThrowIfCancellationRequested();let{vertex:w,priority:b}=a.Dequeue();if(r.get(w)===b)for(let m of s.get(w)){let E=this.DistanceRelaxer.Combine(b,qt(this.Weights,m,!0));(!r.has(m.Source)||this.DistanceRelaxer.Compare(E,r.get(m.Source))<0)&&(r.set(m.Source,E),o.set(m.Source,m),a.Enqueue({vertex:m.Source,priority:E}))}}let h=(w,b)=>{let m=new _;for(;o.has(b);){if(m.has(b))return!1;m.add(b);let E=o.get(b);w.push(E),b=E.Target}return ie(b,t)},l=[];if(!h(l,e)||!l.length)return;this.AddComputedShortestPath(l);let d=new ve((w,b)=>this.DistanceRelaxer.Compare(w.priority,b.priority)),u=new y([...n.Edges].map((w,b)=>[w,b])),p=new _([l.map(w=>u.get(w)).join(",")]),x=(w,b)=>{let m=0,E=new _([e]);for(let f=0;f<w.length;f++){let S=w[f];if(f>=b)for(let T of n.OutEdges(S.Source)){if(v(T,S)||E.has(T.Target)||!r.has(T.Target))continue;let P=this.DistanceRelaxer.Combine(m,this.DistanceRelaxer.Combine(this.Weights(T),r.get(T.Target)));d.Enqueue({parent:w,index:f,edge:T,priority:P})}if(m+=this.Weights(S),E.has(S.Target))break;E.add(S.Target)}};for(x(l,0);d.Count&&this.ComputedShortestPathCount<this.ShortestPathCount;){this.ThrowIfCancellationRequested();let w=d.Dequeue(),b=[...w.parent.slice(0,w.index),w.edge],m=b.length;if(!h(b,w.edge.Target))continue;let E=b.map(T=>u.get(T)).join(",");if(p.has(E))continue;p.add(E);let f=new _([e]),S=!1;for(let T of b)f.has(T.Target)&&(S=!0),f.add(T.Target);S||this.AddComputedShortestPath(b),m<n.VertexCount&&x(b,m)}}};function ze(i,e){g(i,"algorithm");let t=[];for(let[o,a]of Object.entries(e)){if(!i[o]?.add){for(let[h,l]of t)h.remove(l);throw new TypeError(`Algorithm must expose ${o}.`)}i[o].add(a),t.push([i[o],a])}let n=!1,s=()=>{if(!n){n=!0;for(let[o,a]of t)o.remove(a)}},r={Dispose:s,dispose:s,unsubscribe:s};return Symbol.dispose&&(r[Symbol.dispose]=s),r}var jt=class{constructor(e=new y){this.VerticesPredecessors=g(e,"verticesPredecessors")}Attach(e){return ze(e,{TreeEdge:t=>this.VerticesPredecessors.set(t.Target,t)})}TryGetPath(e){return bn(this.VerticesPredecessors,e)}},wi=class extends jt{Attach(e){return ze(e,{TreeEdge:(t,n)=>this.VerticesPredecessors.set(n.Target,n.Edge)})}TryGetPath(e){return bn(this.VerticesPredecessors,e,!0)}},tr=class{constructor(e,t=Ne.EdgeShortestDistance,n=new y){this.EdgeWeights=g(e,"edgeWeights"),this.DistanceRelaxer=g(t,"distanceRelaxer"),this.Distances=g(n,"distances")}_record(e,t,n){this.Distances.has(t)||this.Distances.set(t,this.DistanceRelaxer.InitialDistance),this.Distances.set(n,this.DistanceRelaxer.Combine(this.Distances.get(t),this.EdgeWeights(e)))}Attach(e){return ze(e,{TreeEdge:t=>this._record(t,t.Source,t.Target)})}},Qo=class extends tr{Attach(e){return ze(e,{TreeEdge:(t,n)=>this._record(n.Edge,n.Source,n.Target)})}},Xo=class{constructor(e,t){this.DiscoverTimes=arguments.length?g(e,"discoverTimes"):new y,this.FinishTimes=arguments.length===1?null:arguments.length>1?g(t,"finishTimes"):new y,this._currentTime=0}Attach(e){let t={DiscoverVertex:n=>this.DiscoverTimes.set(n,this._currentTime++)};return this.FinishTimes&&(t.FinishVertex=n=>this.FinishTimes.set(n,this._currentTime++)),ze(e,t)}},Yo=class{constructor(e=[]){this.Vertices=[...g(e,"vertices")]}Attach(e){return ze(e,{DiscoverVertex:t=>this.Vertices.push(t)})}},Zo=class{constructor(e=[]){this.Edges=[...g(e,"edges")]}Attach(e){return ze(e,{TreeEdge:t=>this.Edges.push(t)})}},Jo=class extends jt{constructor(...e){super(...e),this.EndPathVertices=[]}Attach(e){return ze(e,{TreeEdge:t=>this.VerticesPredecessors.set(t.Target,t),FinishVertex:t=>{for(let n of this.VerticesPredecessors.values())if(ie(n.Source,t))return;this.EndPathVertices.push(t)}})}*AllPaths(){for(let e of this.EndPathVertices){let t=this.TryGetPath(e);t&&(yield t)}}},ea=class{constructor(e=new y){this.EdgesPredecessors=g(e,"edgesPredecessors"),this.EndPathEdges=[]}Attach(e){return ze(e,{DiscoverTreeEdge:(t,n)=>{v(t,n)||this.EdgesPredecessors.set(n,t)},FinishEdge:t=>{for(let n of this.EdgesPredecessors.values())if(v(n,t))return;this.EndPathEdges.push(t)}})}Path(e){g(e,"startingEdge");let t=[],n=new _,s=e;for(;s!==void 0;){if(n.has(s))throw N("InvalidOperationException","The edge predecessor map contains a cycle.");n.add(s),t.push(s),s=this.EdgesPredecessors.get(s)}return t.reverse()}*AllPaths(){for(let e of this.EndPathEdges)yield this.Path(e)}MergedPath(e,t){g(e,"startingEdge"),g(t,"colors");let n=[],s=e;for(;s!==void 0;){if(!t.has(s))throw N("KeyNotFoundException","No color recorded for edge.");if(t.get(s)!==Ce.White)break;t.set(s,Ce.Black),n.push(s),s=this.EdgesPredecessors.get(s)}return n.reverse()}*AllMergedPaths(){let e=new y;for(let[t,n]of this.EdgesPredecessors)e.set(t,Ce.White),e.set(n,Ce.White);for(let t of this.EndPathEdges)e.has(t)||e.set(t,Ce.White),yield this.MergedPath(t,e)}};var se=(i,e)=>{if(i==null)throw new Xe(e);return i},Pi=(i,e)=>v(i.Source,e)?i.Target:i.Source,nr=i=>Array.from(i.Vertices),Fh=i=>Array.from(i.Edges),it=(i,e=!1,t=!1)=>{let n=new y(nr(i).map(s=>[s,[]]));for(let s of i.Edges)n.get(t?s.Target:s.Source).push(s),e&&!v(s.Source,s.Target)&&n.get(s.Target).push(s);return n},En=class{constructor(e=[]){this.parents=new y,this.ranks=new y,this.count=0;for(let t of e)this.add(t)}add(e){this.parents.has(e)||(this.parents.set(e,e),this.ranks.set(e,0),++this.count)}find(e){if(!this.parents.has(e))throw new xe("Vertex is not in the disjoint set.");let t=this.parents.get(e);for(;!v(this.parents.get(t),t);)t=this.parents.get(t);for(;!v(e,t);){let n=this.parents.get(e);this.parents.set(e,t),e=n}return t}union(e,t){return e=this.find(e),t=this.find(t),v(e,t)?!1:(this.ranks.get(e)<this.ranks.get(t)&&([e,t]=[t,e]),this.parents.set(t,e),this.ranks.get(e)===this.ranks.get(t)&&this.ranks.set(e,this.ranks.get(e)+1),--this.count,!0)}},zt=class{constructor(e){this.weight=e,this.items=[],this.positions=new y}get size(){return this.items.length}has(e){return this.positions.has(e)}swap(e,t){[this.items[e],this.items[t]]=[this.items[t],this.items[e]],this.positions.set(this.items[e].v,e),this.positions.set(this.items[t].v,t)}up(e){for(;e>0;){let t=e-1>>1;if(!(this.items[e].w<this.items[t].w))break;this.swap(e,t),e=t}}down(e){for(;;){let t=e,n=e*2+1,s=n+1;if(n<this.size&&this.items[n].w<this.items[t].w&&(t=n),s<this.size&&this.items[s].w<this.items[t].w&&(t=s),t===e)break;this.swap(e,t),e=t}}push(e){this.positions.set(e,this.size),this.items.push({v:e,w:this.weight(e)}),this.up(this.size-1)}pop(){let e=this.items[0];if(!e)throw new G("Heap is empty.");let t=this.items.pop();return this.positions.delete(e.v),this.size&&(this.items[0]=t,this.positions.set(t.v,0),this.down(0)),e.v}update(e){let t=this.positions.get(e);if(t===void 0)return this.push(e);let n=this.items[t].w;this.items[t].w=this.weight(e),this.items[t].w<n?this.up(t):this.down(t)}};function Rh(i){return i.length>=3?{host:i[0],graph:i[1],components:se(i[2],"components")}:{host:null,graph:i[0],components:i.length===2?se(i[1],"components"):new y}}var Ei=class extends B{constructor(...e){let{host:t,graph:n,components:s}=Rh(e);super(t,n),this.Components=s,this._componentMap=s instanceof y?s:new y,this.ComponentCount=0}Initialize(){super.Initialize(),this.Components.clear(),this._componentMap.clear(),this.ComponentCount=0}Clean(){if(this.Components!==this._componentMap)for(let e of this.VisitedGraph.Vertices)this._componentMap.has(e)&&this.Components.set(e,this._componentMap.get(e));super.Clean()}get Graphs(){let e=Array.from({length:this.ComponentCount},()=>new Z);for(let[t,n]of this._componentMap)e[n].AddVertex(t);for(let t of this.VisitedGraph.Edges)this._componentMap.get(t.Source)===this._componentMap.get(t.Target)&&e[this._componentMap.get(t.Source)].AddEdge(t);return e}},Sn=class extends Ei{InternalCompute(){let e=it(this.VisitedGraph,!0);for(let t of this.VisitedGraph.Vertices){if(this.ThrowIfCancellationRequested(),this._componentMap.has(t))continue;let n=this.ComponentCount++,s=[t];for(this._componentMap.set(t,n);s.length;){this.ThrowIfCancellationRequested();let r=s.pop();for(let o of e.get(r)){let a=Pi(o,r);this._componentMap.has(a)||(this._componentMap.set(a,n),s.push(a))}}}}},_n=class extends Sn{},Cn=class extends Ei{constructor(...e){super(...e),this.Roots=new y,this.DiscoverTimes=new y,this.Steps=0,this.ComponentsPerStep=null,this.VerticesPerStep=null}Initialize(){super.Initialize(),this.Roots.clear(),this.DiscoverTimes.clear(),this.Steps=0,this.ComponentsPerStep=[],this.VerticesPerStep=[]}InternalCompute(){let e=[],t=[],n=it(this.VisitedGraph),s=r=>{this.Roots.set(r,r),this._componentMap.set(r,2147483647),this.ComponentsPerStep.push(this.ComponentCount),this.VerticesPerStep.push(r),++this.Steps,this.DiscoverTimes.set(r,this.DiscoverTimes.size),e.push(r),t.push({vertex:r,index:0})};for(let r of this.VisitedGraph.Vertices)if(!this.DiscoverTimes.has(r))for(s(r);t.length;){this.ThrowIfCancellationRequested();let o=t[t.length-1],a=n.get(o.vertex);if(o.index<a.length){let h=a[o.index++].Target;this.DiscoverTimes.has(h)||s(h);continue}t.pop();for(let h of a)if(this._componentMap.get(h.Target)===2147483647){let l=this.Roots.get(o.vertex),d=this.Roots.get(h.Target);this.DiscoverTimes.get(d)<=this.DiscoverTimes.get(l)&&this.Roots.set(o.vertex,d)}if(v(this.Roots.get(o.vertex),o.vertex)){let h;do h=e.pop(),this._componentMap.set(h,this.ComponentCount),this.ComponentsPerStep.push(this.ComponentCount),this.VerticesPerStep.push(h),++this.Steps;while(!v(h,o.vertex));++this.ComponentCount}}}},Si=class extends B{constructor(...e){super(...e),this._sets=null,this._subscriptions=[]}InternalCompute(){this._sets=new En(this.VisitedGraph.Vertices);for(let t of this.VisitedGraph.Edges)this._sets.union(t.Source,t.Target);if(this._subscriptions.length)return;let e=(t,n)=>{this.VisitedGraph[t].add(n),this._subscriptions.push([t,n])};e("VertexAdded",t=>this._sets.add(t)),e("EdgeAdded",t=>this._sets.union(t.Source,t.Target)),e("VertexRemoved",()=>{throw new G("Vertex removal is not supported for incremental connected components.")}),e("EdgeRemoved",()=>{throw new G("Edge removal is not supported for incremental connected components.")})}get ComponentCount(){if(!this._sets)throw new G("Run the algorithm before getting components.");return this._sets.count}GetComponents(){let e=this.ComponentCount,t=new y,n=new y;for(let s of this.VisitedGraph.Vertices){let r=this._sets.find(s);t.has(r)||t.set(r,t.size),n.set(s,t.get(r))}return{Key:e,Value:n}}Dispose(){for(let[e,t]of this._subscriptions)this.VisitedGraph[e].remove(t);this._subscriptions=[]}},Et=Object.freeze({Forward:0,Backward:1}),St=class extends B{constructor(e,t=-1){super(e),this.SortedVertices=null,this.DiscoverVertex=new L,this.FinishVertex=new L}Initialize(){super.Initialize(),this.SortedVertices=null}InternalCompute(){let e=new y,t=[],n=it(this.VisitedGraph,!!this._undirected),s=(r,o)=>(e.set(r,1),this.DiscoverVertex.emit(r),{v:r,index:0,parentEdge:o,skippedParent:!1});try{for(let r of this.VisitedGraph.Vertices){if(e.has(r))continue;let o=[s(r)];for(;o.length;){this.ThrowIfCancellationRequested();let a=o[o.length-1],h=n.get(a.v);if(a.index<h.length){let l=h[a.index++];if(this._undirected&&l===a.parentEdge&&!a.skippedParent){a.skippedParent=!0;continue}let d=this._undirected?Pi(l,a.v):l.Target,u=e.get(d);if(u===void 0)o.push(s(d,l));else if(u===1&&!this.AllowCyclicGraph)throw new Oe}else o.pop(),e.set(a.v,2),t.push(a.v),this.FinishVertex.emit(a.v)}}}finally{this.SortedVertices=t.reverse()}}},_i=class extends St{constructor(e,t=-1){super(e,t),this._undirected=!0,this.AllowCyclicGraph=!1}},Tn=class extends B{constructor(e,t=-1){super(e),this.SortedVertices=null,this.InDegrees=new y,this.VertexAdded=new L,this._direction=Et.Forward}Initialize(){super.Initialize(),this.SortedVertices=null,this.InDegrees.clear();for(let e of this.VisitedGraph.Vertices)this.InDegrees.set(e,0);for(let e of this.VisitedGraph.Edges){if(v(e.Source,e.Target))throw new Oe;let t=this._direction===Et.Backward?e.Source:e.Target;this.InDegrees.set(t,this.InDegrees.get(t)+1)}}InternalCompute(){let e=this._direction===Et.Backward,t=it(this.VisitedGraph,!1,e),n=new zt(r=>this.InDegrees.get(r)),s=[];for(let r of this.VisitedGraph.Vertices)n.push(r);for(;n.size;){this.ThrowIfCancellationRequested();let r=n.pop();if(this.InDegrees.get(r)!==0)throw new Oe;s.push(r),this.VertexAdded.emit(r);for(let o of t.get(r)){let a=e?o.Source:o.Target;this.InDegrees.set(a,this.InDegrees.get(a)-1),n.update(a)}}this.SortedVertices=s}},Ci=class extends Tn{constructor(e,t=Et.Forward,n=-1){super(e,n),this._direction=t===Et.Backward||t==="Backward"?Et.Backward:Et.Forward}},Ti=class extends B{constructor(e,t=-1){super(e),this.SortedVertices=null,this.Degrees=new y,this.AllowCyclicGraph=!1,this.VertexAdded=new L}Initialize(){super.Initialize(),this.SortedVertices=null,this.Degrees.clear()}InternalCompute(){let e=it(this.VisitedGraph,!0),t=new zt(s=>this.Degrees.get(s)),n=[];if(!this.AllowCyclicGraph&&Fh(this.VisitedGraph).some(s=>v(s.Source,s.Target)))throw new Oe;for(let[s,r]of e)this.Degrees.set(s,typeof this.VisitedGraph.AdjacentDegree=="function"?this.VisitedGraph.AdjacentDegree(s):r.length),t.push(s);for(;t.size;){this.ThrowIfCancellationRequested();let s=t.pop();if(this.Degrees.get(s)>1&&!this.AllowCyclicGraph)throw new Oe;n.push(s),this.VertexAdded.emit(s);for(let o of e.get(s))if(!v(o.Source,o.Target)){let a=Pi(o,s);this.Degrees.set(a,this.Degrees.get(a)-1),t.has(a)&&t.update(a)}}this.SortedVertices=n}},Ii=class extends B{constructor(...e){let t=e.length>=3;super(t?e[0]:null,t?e[1]:e[0]),this._edgeWeights=se(t?e[2]:e[1],"edgeWeights"),this.ExamineEdge=new L,this.TreeEdge=new L,this.SpanningTree=[]}Initialize(){super.Initialize(),this.SpanningTree=[]}_add(e){this.SpanningTree.push(e),this.TreeEdge.emit(e)}},Ai=class extends Ii{InternalCompute(){let e=new En(this.VisitedGraph.Vertices),t=new zt(this._edgeWeights);for(let n of this.VisitedGraph.Edges)t.push(n);for(;t.size;){this.ThrowIfCancellationRequested();let n=t.pop();this.ExamineEdge.emit(n),e.union(n.Source,n.Target)&&this._add(n)}}},Vi=class extends Ii{InternalCompute(){let e=it(this.VisitedGraph,!0),t=new _,n=new _,s=new zt(this._edgeWeights),r=e.size,o=a=>{t.add(a);for(let h of e.get(a))n.has(h)||(n.add(h),s.push(h))};for(let a of this.VisitedGraph.Vertices)if(!t.has(a))for(o(a);s.size&&t.size<r;){this.ThrowIfCancellationRequested();let h=s.pop();this.ExamineEdge.emit(h);let l=t.has(h.Source),d=t.has(h.Target);l!==d&&(this._add(h),o(l?h.Target:h.Source))}}},ir=class extends Q{constructor(e,t){super(e,t),this.Edges=[]}},ki=class i extends Q{constructor(e,t){super(e,t),this.Edges=[]}static Merge(e,t){se(e,"inEdge"),se(t,"outEdge");let n=new i(e.Source,t.Target);return n.Edges.push(...e.Edges,...t.Edges),n}},_t=class extends B{constructor(e,t=()=>new Z){super(e),this.StronglyConnected=!0,this.CondensedGraph=null,this.GraphFactory=se(t,"graphFactory")}InternalCompute(){this.CondensedGraph=new Z(!1);let e=this.StronglyConnected?new Cn(this.VisitedGraph):new _n(this.VisitedGraph);e.Compute();let t=Array.from({length:e.ComponentCount},()=>this.GraphFactory());this.CondensedGraph.AddVertexRange(t);for(let s of this.VisitedGraph.Vertices)t[e.Components.get(s)].AddVertex(s);let n=new y;for(let s of this.VisitedGraph.Edges){this.ThrowIfCancellationRequested();let r=e.Components.get(s.Source),o=e.Components.get(s.Target);if(r===o){t[r].AddEdge(s);continue}let a=n.get(r);a||n.set(r,a=new y);let h=a.get(o);h||(h=new ir(t[r],t[o]),a.set(o,h),this.CondensedGraph.AddEdge(h)),h.Edges.push(s)}}},Gi=class extends B{constructor(e,t,n){super(e),this.CondensedGraph=se(t,"condensedGraph"),this.VertexPredicate=se(n,"vertexPredicate")}InternalCompute(){let e=[],t=this.CondensedGraph;for(let n of this.VisitedGraph.Vertices)t.AddVertex(n),this.VertexPredicate(n)||e.push(n);for(let n of this.VisitedGraph.Edges){let s=new ki(n.Source,n.Target);s.Edges.push(n),t.AddEdge(s)}for(let n of e){this.ThrowIfCancellationRequested();let s=Array.from(t.InEdges(n)),r=Array.from(t.OutEdges(n));t.RemoveVertex(n);for(let o of s)if(!v(o.Source,n))for(let a of r)v(a.Target,n)||t.AddEdge(ki.Merge(o,a))}}};function ia(i,e,t,n){let s=new St(i.VisitedGraph);s.Compute(),e.Clear(),e.AddVertexRange(i.VisitedGraph.Vertices),e.AddEdgeRange(i.VisitedGraph.Edges);let r=new y;for(let o of s.SortedVertices){i.ThrowIfCancellationRequested();let a=[],h=new _;for(let l of e.InEdges(o)){a.push(l.Source);for(let d of r.get(l.Source))h.add(d)}for(let l of h)if(t){let d=Array.from(e.OutEdges(l)).filter(u=>v(u.Target,o));for(let u of d)e.RemoveEdge(u)}else e.ContainsEdge(l,o)||e.AddEdge(n(l,o));for(let l of a)h.add(l);r.set(o,h)}}var Fi=class extends B{constructor(e,t){super(e),this._createEdge=se(t,"edgeFactory"),this.TransitiveClosure=new Z}InternalCompute(){ia(this,this.TransitiveClosure,!1,this._createEdge)}},Ri=class extends B{constructor(e){super(e),this.TransitiveReduction=new Z}InternalCompute(){ia(this,this.TransitiveReduction,!0)}},ta=class extends B{constructor(e){super(e),this.Ranks=new y,this._damping=.85,this._tolerance=2*Number.MIN_VALUE,this._maxIterations=60,this.Iterations=0}get Damping(){return this._damping}set Damping(e){if(!(e>=0&&e<=1))throw new Ae("Damping must be in [0,1].");this._damping=e}get Tolerance(){return this._tolerance}set Tolerance(e){if(!(e>=0))throw new Ae("Tolerance must be nonnegative.");this._tolerance=e}get MaxIterations(){return this._maxIterations}set MaxIterations(e){if(!Number.isInteger(e)||e<=0)throw new Ae("MaxIterations must be a positive integer.");this._maxIterations=e}Initialize(){super.Initialize(),this.Ranks.clear(),this.Iterations=0;let e=nr(this.VisitedGraph);for(let t of e)this.Ranks.set(t,1/e.length)}InternalCompute(){let e=it(this.VisitedGraph,!1,!0),t=new y(nr(this.VisitedGraph).map(s=>[s,0]));for(let s of this.VisitedGraph.Edges)t.set(s.Source,t.get(s.Source)+1);let n;do{this.ThrowIfCancellationRequested();let s=new y;n=0;for(let[r,o]of this.Ranks){this.ThrowIfCancellationRequested();let a=0;for(let l of e.get(r))a+=this.Ranks.get(l.Source)/t.get(l.Source);let h=1-this.Damping+this.Damping*a;s.set(r,h),n+=Math.abs(h-o)}this.Ranks=s,++this.Iterations}while(n>this.Tolerance&&this.Iterations<this.MaxIterations)}GetRanksSum(){let e=0;for(let t of this.Ranks.values())e+=t;return e}GetRanksMean(){return this.GetRanksSum()/this.Ranks.size}},sr=class extends y{constructor(){super(),this._keys=new y}_key(e){return this._keys.get(e?.Source)?.get(e?.Target)}get(e){let t=this._key(e);return t===void 0?void 0:super.get(t)}has(e){let t=this._key(e);return t!==void 0&&super.has(t)}set(e,t){let n=this._keys.get(e.Source);n||this._keys.set(e.Source,n=new y);let s=n.get(e.Target);return s===void 0&&(s=e,n.set(e.Target,s)),super.set(s,t),this}delete(e){let t=this._key(e);return t===void 0?!1:(this._keys.get(e.Source).delete(e.Target),super.delete(t))}clear(){super.clear(),this._keys?.clear()}},Di=class extends ce{constructor(...e){super(...e),this.Ancestors=new sr,this._pairs=void 0}TryGetVertexPairs(){return this._pairs}SetVertexPairs(e){let t=Array.from(se(e,"pairs"));if(!t.length)throw new xe("Must have at least one vertex pair.");for(let n of t)if(!n||!this.VisitedGraph.ContainsVertex(n.Source)||!this.VisitedGraph.ContainsVertex(n.Target))throw new xe("All pairs vertices must be in the graph.");this._pairs=t}Compute(...e){return e.length>=2?(this.SetVertexPairs(e[1]),super.Compute(e[0])):super.Compute(...e)}Initialize(){super.Initialize(),this.Ancestors.clear()}InternalCompute(){let e=this.GetAndAssertRootInGraph();if(!this._pairs)throw new G("Pairs not set.");let t=it(this.VisitedGraph),n=new y,s=new En,r=new y,o=new _,a=new _;for(let d of this._pairs)for(let u of v(d.Source,d.Target)?[d.Source]:[d.Source,d.Target]){let p=n.get(u);p||n.set(u,p=[]),p.push(d)}let h=(d,u)=>(o.add(d),s.add(d),r.set(d,d),{v:d,parent:u,index:0}),l=[h(e,void 0)];for(;l.length;){this.ThrowIfCancellationRequested();let d=l[l.length-1],u=t.get(d.v);if(d.index<u.length){let p=u[d.index++].Target;o.has(p)||l.push(h(p,d.v));continue}l.pop(),a.add(d.v);for(let p of n.get(d.v)??[]){let x=Pi(p,d.v);a.has(x)&&this.Ancestors.set(p,r.get(s.find(x)))}l.length&&(s.union(d.parent,d.v),r.set(s.find(d.parent),d.parent))}}};function rr(i,e){if(se(i,"rng"),!Number.isInteger(e)||e<=0)throw new Ae("Count must be a positive integer.");let t=typeof i=="function"?Math.floor(i()*e):typeof i.Next=="function"?i.Next(e):Math.floor(i.next()*e);if(!Number.isInteger(t)||t<0||t>=e)throw new Ae("Random generator returned an out-of-range value.");return t}function bi(i,e,t){se(i,"items");let n=rr(t,e);for(let s of i)if(n--===0)return s;throw new G("Could not find a random element.")}var na=class{static GetVertex(e,t,n){return se(e,"graph"),arguments.length===2?bi(e.Vertices,e.VertexCount,t):bi(e,t,n)}static GetEdge(e,t,n){return se(e,"graph"),arguments.length===2?bi(e.Edges,e.EdgeCount,t):bi(e,t,n)}static Create(e,t,n,s,r,o,a){if(se(e,"graph"),se(t,"vertexFactory"),se(n,"edgeFactory"),se(s,"rng"),!Number.isInteger(r)||r<=0)throw new Ae("Must request at least one vertex.");if(!Number.isInteger(o)||o<0)throw new Ae("Edge count must be nonnegative.");let h=[];for(let b=0;b<r;++b){let m=t();e.AddVertex(m),h.push(m)}let l=Array.from(new _(h)),d=l.length;if(o&&!a&&d<2)throw new xe("Cannot create non-self edges with fewer than two distinct vertices.");let u=e.AllowParallelEdges!==!1;if(!u){let b=e.IsDirected?d*(d-(a?0:1)):d*(d-1)/2+(a?d:0),m=new _,E=new y(l.map((f,S)=>[f,S]));for(let f of e.Edges)if(E.has(f.Source)&&E.has(f.Target)&&(a||!v(f.Source,f.Target))){let S=E.get(f.Source),T=E.get(f.Target);!e.IsDirected&&S>T&&([S,T]=[T,S]),m.add(`${S}:${T}`)}if(o>b-m.size)throw new xe("Requested edge count exceeds the available distinct edges.")}let p=0,x=0,w=Math.max(64,Math.min(1e5,d*d*4));for(;p<o;){let b=h[rr(s,h.length)],m=h[rr(s,h.length)];if((a||!v(b,m))&&e.AddEdge(n(b,m))){++p,x=0;continue}if(++x<w)continue;let E=!1;for(let f=0;f<d&&!E;++f)for(let S=e.IsDirected?0:f;S<d&&!E;++S)b=l[f],m=l[S],!(!a&&v(b,m))&&(!u&&e.ContainsEdge(b,m)||e.AddEdge(n(b,m))&&(++p,x=0,E=!0));if(!E)throw new G("The factories cannot create the requested graph.")}return e}};var A=(i,e="argument")=>{if(i==null)throw new Xe(`${e} must not be null`);return i},st=(i,e)=>{for(let t of e.split(" "))i[t]=new L},de=i=>[...i.Vertices],$t=i=>[...i.Edges],q=v,Ia=(i,e)=>q(i.Source,e)?i.Target:i.Source,we=(i,e)=>[...i.IsDirected===!1?i.AdjacentEdges(e):i.OutEdges(e)],vi=(i,e)=>i.InEdges?[...i.InEdges(e)]:$t(i).filter(t=>q(t.Target,e)),In=i=>typeof i=="function"?i():i.NextDouble(),Tt=(i,e)=>new Q(i,e),$e=(i,e)=>{if(A(e,"vertex"),!i.ContainsVertex(e))throw new $("Vertex is not part of the graph")},Ct=i=>i.length>1&&i[1]?.Vertices!==void 0&&i[0]?.Vertices===void 0?[i[0],...i.slice(1)]:[null,...i],cr=i=>{let e=new y(de(i).map(t=>[t,new _]));for(let t of i.Edges)q(t.Source,t.Target)||(e.get(t.Source).add(t.Target),e.get(t.Target).add(t.Source));return e},sa=class{constructor(e,t=Tt){this.VisitedGraph=A(e),this.EdgeFactory=A(t),this.ReversedEdges=new y,this._augmented=[],this.Augmented=!1,st(this,"ReversedEdgeAdded")}get AugmentedEdges(){return this._augmented.slice()}AddReversedEdges(){if(this.Augmented)throw new G("Graph already augmented");let e=$t(this.VisitedGraph);for(let t of e){if(this.ReversedEdges.has(t))continue;let n=we(this.VisitedGraph,t.Target).find(s=>q(s.Target,t.Source)&&!this.ReversedEdges.has(s));if(!n){if(n=this.EdgeFactory(t.Target,t.Source),this.VisitedGraph.AddEdge(n))this._augmented.push(n),this.ReversedEdgeAdded.emit(n);else if(n=we(this.VisitedGraph,t.Target).find(s=>q(s.Target,t.Source)),!n)throw new G("Cannot add reversed edge")}this.ReversedEdges.set(t,n),this.ReversedEdges.has(n)||this.ReversedEdges.set(n,t)}this.Augmented=!0}RemoveReversedEdges(){if(!this.Augmented)throw new G("Graph is not augmented");for(let e of this._augmented)this.VisitedGraph.RemoveEdge(e);this._augmented.length=0,this.ReversedEdges.clear(),this.Augmented=!1}Dispose(){this.Augmented&&this.RemoveReversedEdges()}},ar=class extends B{constructor(...e){let[t,n,s,r=Tt]=Ct(e);super(t,n),this.Capacities=A(s),this.EdgeFactory=A(r),this.Predecessors=new y,this.ResidualCapacities=new y,this.ReversedEdges=new y,this.VerticesColors=new y,this.MaxFlow=0,this.Source=void 0,this.Sink=void 0}GetVertexColor(e){if(A(e),!this.VerticesColors.has(e))throw new $("Vertex color is not available");return this.VerticesColors.get(e)}Compute(e,t){return arguments.length&&(A(e),A(t),this.Source=e,this.Sink=t),super.Compute(),this.MaxFlow}},An=class extends ar{constructor(...e){let[t,n,s,r=Tt,o]=Ct(e);if(super(t,n,s,r),this._reverser=o,Ct(e).length>=5&&A(o,"reverseEdgesAugmentorAlgorithm"),o&&o.VisitedGraph!==n)throw new xe("Reverser must target the same graph");o&&(this.ReversedEdges=o.ReversedEdges),this.Flows=new y}Initialize(){if(this._reverser&&!this._reverser.Augmented)throw new G("Call AddReversedEdges before computing maximum flow");if(this.Source==null||this.Sink==null)throw new G("Source and sink must be specified");if($e(this.VisitedGraph,this.Source),$e(this.VisitedGraph,this.Sink),q(this.Source,this.Sink))throw new G("Source and sink must differ");this.Predecessors.clear(),this.ResidualCapacities.clear(),this.VerticesColors.clear(),this.Flows.clear(),this.MaxFlow=0}InternalCompute(){let e=new y(de(this.VisitedGraph).map(n=>[n,[]])),t=new y;for(let n of this.VisitedGraph.Edges){let s=this.Capacities instanceof globalThis.Map?this.Capacities.get(n):this.Capacities(n);if(typeof s!="number"||Number.isNaN(s)||s<0)throw new Yt("Negative or invalid capacity");let r={to:n.Target,from:n.Source,residual:s,edge:n,forward:!0},o={to:n.Source,from:n.Target,residual:0,edge:n,forward:!1};r.reverse=o,o.reverse=r,e.get(n.Source).push(r),e.get(n.Target).push(o),t.set(n,r),this.Flows.set(n,0)}for(;;){this.ThrowIfCancellationRequested();let n=new _([this.Source]),s=new y,r=[this.Source];for(let a=0;a<r.length&&!n.has(this.Sink);++a)for(let h of e.get(r[a]))h.residual>0&&!n.has(h.to)&&(n.add(h.to),s.set(h.to,h),r.push(h.to));for(let[a,h]of s)this.Predecessors.set(a,h.forward?h.edge:this.ReversedEdges.get(h.edge)??this.EdgeFactory(h.from,h.to));for(let a of e.keys())this.VerticesColors.set(a,n.has(a)?2:0);if(!n.has(this.Sink))break;let o=1/0;for(let a=this.Sink;!q(a,this.Source);){let h=s.get(a);o=Math.min(o,h.residual),a=h.from}if(!Number.isFinite(o))throw new RangeError("Maximum flow is unbounded");for(let a=this.Sink;!q(a,this.Source);){let h=s.get(a);h.residual-=o,h.reverse.residual+=o,this.Flows.set(h.edge,this.Flows.get(h.edge)+(h.forward?o:-o)),a=h.from}this.MaxFlow+=o}for(let[n,s]of t){let r=this.ReversedEdges.get(n);this.ResidualCapacities.set(n,s.residual+(r&&r!==n?this.Flows.get(r)??0:0))}}},Vn=class extends B{constructor(...e){let[t,n,s,r=Tt]=Ct(e);super(t,n),this.VertexFactory=A(s),this.EdgeFactory=A(r),this.SuperSource=void 0,this.SuperSink=void 0,this.Augmented=!1,this._augmented=[],st(this,"SuperSourceAdded SuperSinkAdded EdgeAdded")}get AugmentedEdges(){return this._augmented.slice()}InternalCompute(){if(this.Augmented)throw new G("Graph already augmented");if(this._originalVertices=de(this.VisitedGraph),this.SuperSource=A(this.VertexFactory()),this.SuperSink=A(this.VertexFactory()),q(this.SuperSource,this.SuperSink)||this.VisitedGraph.ContainsVertex(this.SuperSource)||this.VisitedGraph.ContainsVertex(this.SuperSink))throw new G("Vertex factory must produce fresh vertices");this.VisitedGraph.AddVertex(this.SuperSource),this.SuperSourceAdded.emit(this.SuperSource),this.VisitedGraph.AddVertex(this.SuperSink),this.SuperSinkAdded.emit(this.SuperSink),this.Augmented=!0;try{this.AugmentGraph()}catch(e){throw this.Rollback(),e}}AddAugmentedEdge(e,t){let n=this.EdgeFactory(e,t);return this.VisitedGraph.AddEdge(n),this._augmented.push(n),this.EdgeAdded.emit(n),n}AugmentGraph(){throw new G("AugmentGraph must be implemented")}Rollback(){this.Augmented&&(this.VisitedGraph.RemoveVertex(this.SuperSource),this.VisitedGraph.RemoveVertex(this.SuperSink),this.SuperSource=this.SuperSink=void 0,this._augmented.length=0,this.Augmented=!1)}Dispose(){this.Rollback()}},ra=class extends Vn{AugmentGraph(){for(let e of this.VisitedGraph.Vertices)this.ThrowIfCancellationRequested(),this.AddAugmentedEdge(this.SuperSource,e),this.AddAugmentedEdge(e,this.SuperSink)}},oa=class extends Vn{AugmentGraph(){for(let e of this.VisitedGraph.Vertices)this.ThrowIfCancellationRequested(),vi(this.VisitedGraph,e).length||this.AddAugmentedEdge(this.SuperSource,e),we(this.VisitedGraph,e).length||this.AddAugmentedEdge(e,this.SuperSink)}},aa=class extends Vn{constructor(...e){let[t,n,s,r,o,a=Tt]=Ct(e);super(t,n,o,a),this.SourceToVertices=A(s),this.VerticesToSink=A(r)}AugmentGraph(){for(let e of this.SourceToVertices)$e(this.VisitedGraph,e),this.AddAugmentedEdge(this.SuperSource,e);for(let e of this.VerticesToSink)$e(this.VisitedGraph,e),this.AddAugmentedEdge(e,this.SuperSink)}},ha=class{constructor(e,t,n,s,r=Tt,o){if(this.VisitedGraph=A(e),A(t),A(n),!e.ContainsVertex(t)||!e.ContainsVertex(n))throw new xe("Source and sink must be in the graph");this.Source=t,this.Sink=n,this.VertexFactory=A(s),this.EdgeFactory=A(r),this.Capacities=arguments.length>=6?A(o,"capacities"):new y($t(e).map(a=>[a,Number.MAX_VALUE])),this._preFlow=new y($t(e).map(a=>[a,1])),this.Balanced=!1,this.SurplusVertices=[],this.DeficientVertices=[],this.SurplusEdges=[],this.DeficientEdges=[],st(this,"BalancingSourceAdded BalancingSinkAdded EdgeAdded SurplusVertexAdded DeficientVertexAdded")}GetBalancingIndex(e){return $e(this.VisitedGraph,e),we(this.VisitedGraph,e).reduce((t,n)=>t+(this._preFlow.get(n)??0),0)-vi(this.VisitedGraph,e).reduce((t,n)=>t+(this._preFlow.get(n)??0),0)}Balance(){if(this.Balanced)throw new G("Graph already balanced");let e=new y(de(this.VisitedGraph).map(n=>[n,this.GetBalancingIndex(n)]));this.BalancingSource=A(this.VertexFactory()),this.BalancingSink=A(this.VertexFactory()),this._balancingAddedVertices=[],this._balancingAddedEdges=new _,this.VisitedGraph.AddVertex(this.BalancingSource)&&this._balancingAddedVertices.push(this.BalancingSource),this.BalancingSourceAdded.emit(this.Source),this.VisitedGraph.AddVertex(this.BalancingSink)&&this._balancingAddedVertices.push(this.BalancingSink),this.BalancingSinkAdded.emit(this.Sink);let t=(n,s,r)=>{let o=this.EdgeFactory(n,s);return this.VisitedGraph.AddEdge(o)&&this._balancingAddedEdges.add(o),this.Capacities.set(o,r),this._preFlow.set(o,0),this.EdgeAdded.emit(o),o};this.BalancingSourceEdge=t(this.BalancingSource,this.Source,Number.MAX_VALUE),this.BalancingSinkEdge=t(this.Sink,this.BalancingSink,Number.MAX_VALUE);for(let[n,s]of e)!q(n,this.Source)&&!q(n,this.Sink)&&s!==0&&(s<0?(this.SurplusVertices.push(n),this.SurplusVertexAdded.emit(n),this.SurplusEdges.push(t(this.BalancingSource,n,-s))):(this.DeficientVertices.push(n),this.DeficientVertexAdded.emit(n),this.DeficientEdges.push(t(n,this.BalancingSink,s))));this.Balanced=!0}UnBalance(){if(!this.Balanced)throw new G("Graph is not balanced");for(let e of[...this.SurplusEdges,...this.DeficientEdges,this.BalancingSourceEdge,this.BalancingSinkEdge])this._balancingAddedEdges.has(e)&&this.VisitedGraph.RemoveEdge(e),this.Capacities.delete(e),this._preFlow.delete(e);for(let e of this._balancingAddedVertices)this.VisitedGraph.RemoveVertex(e);this._balancingAddedEdges.clear(),this._balancingAddedVertices.length=0,this.BalancingSource=this.BalancingSink=this.BalancingSourceEdge=this.BalancingSinkEdge=void 0,this.SurplusVertices.length=this.DeficientVertices.length=this.SurplusEdges.length=this.DeficientEdges.length=0,this.Balanced=!1}},la=class extends B{constructor(e,t,n,s=()=>Symbol("vertex"),r=Tt){super(e),this.SourceToVertices=A(t),this.VerticesToSink=A(n),this.VertexFactory=A(s),this.EdgeFactory=A(r),this._matchedEdges=[]}get MatchedEdges(){return this._matchedEdges.slice()}Initialize(){this._matchedEdges=[]}InternalCompute(){let e=new _(this.SourceToVertices),t=new _(this.VerticesToSink);for(let h of[...e,...t])$e(this.VisitedGraph,h);for(let h of e)if(t.has(h))throw new G("Bipartite vertex sets must be disjoint");let n=new y([...e].map(h=>[h,[]]));for(let h of this.VisitedGraph.Edges)e.has(h.Source)&&t.has(h.Target)?n.get(h.Source).push([h.Target,h]):e.has(h.Target)&&t.has(h.Source)&&n.get(h.Target).push([h.Source,h]);let s=new y,r=new y,o=new y,a=new y;for(;;){this.ThrowIfCancellationRequested();let h=[],l=!1;for(let p of e)a.set(p,s.has(p)?1/0:0),s.has(p)||h.push(p);for(let p=0;p<h.length;++p)for(let[x]of n.get(h[p]))if(!r.has(x))l=!0;else{let w=r.get(x);a.get(w)===1/0&&(a.set(w,a.get(h[p])+1),h.push(w))}if(!l)break;let d=p=>{for(let[x,w]of n.get(p)){let b=r.get(x);if(!r.has(x)||a.get(b)===a.get(p)+1&&d(b))return s.set(p,x),r.set(x,p),o.set(p,w),!0}return a.set(p,1/0),!1},u=0;for(let p of e)!s.has(p)&&d(p)&&++u;if(!u)break}this._matchedEdges=[...o.values()]}},or=Object.freeze({Init:0,Step1:1,Step2:2,Step3:3,Step4:4,End:5}),hr=class{constructor(e,t,n,s,r){this.Matrix=e,this.Mask=t,this.RowsCovered=n,this.ColumnsCovered=s,this.Step=r}},ca=class{static Steps=or;constructor(e){if(A(e),!Array.isArray(e))throw new TypeError("Costs must be a matrix of rows");if(this._height=e.length,this._width=e[0]?.length??0,e.some(t=>t.length!==this._width||t.some(n=>!Number.isFinite(n))))throw new RangeError("Costs must be a rectangular finite matrix");if(this._height>this._width)throw new RangeError("Assignment requires at least as many tasks as agents");this._costs=e,this._step=0,this.AgentsTasks=void 0}Compute(){for(;this._doStep()!==or.End;);return this.AgentsTasks}*GetIterations(){let e;do e=this._doStep(),yield new hr(this._costs.map(t=>t.slice()),this._mask.map(t=>t.slice()),this._rows.slice(),this._cols.slice(),e);while(e!==or.End)}_doStep(){let e=this._step,t=this._height,n=this._width,s=this._costs;if(e===0){this._mask=Array.from({length:t},()=>Array(n).fill(0)),this._rows=Array(t).fill(!1),this._cols=Array(n).fill(!1);for(let r=0;r<t;++r){let o=Math.min(...s[r]);for(let a=0;a<n;++a)s[r][a]-=o}for(let r=0;r<t;++r)for(let o=0;o<n;++o)s[r][o]===0&&!this._rows[r]&&!this._cols[o]&&(this._mask[r][o]=1,this._rows[r]=!0,this._cols[o]=!0);this._rows.fill(!1),this._cols.fill(!1),this._step=1}else if(e===1){for(let r=0;r<t;++r)for(let o=0;o<n;++o)this._mask[r][o]===1&&(this._cols[o]=!0);this._step=this._cols.filter(Boolean).length===t?5:2}else if(e===2){let r;e:for(let o=0;o<t;++o)if(!this._rows[o]){for(let a=0;a<n;++a)if(!this._cols[a]&&s[o][a]===0){r=[o,a];break e}}if(!r)this._step=4;else{let[o,a]=r;this._mask[o][a]=2;let h=this._mask[o].indexOf(1);h>=0?(this._rows[o]=!0,this._cols[h]=!1):(this._start=r,this._step=3)}}else if(e===3){let r=[this._start];for(;;){let o=r.at(-1)[1],a=this._mask.findIndex(h=>h[o]===1);if(a<0)break;r.push([a,o]),r.push([a,this._mask[a].indexOf(2)])}for(let[o,a]of r)this._mask[o][a]=this._mask[o][a]===1?0:1;this._rows.fill(!1),this._cols.fill(!1);for(let o of this._mask)for(let a=0;a<n;++a)o[a]===2&&(o[a]=0);this._step=1}else if(e===4){let r=1/0;for(let o=0;o<t;++o)if(!this._rows[o])for(let a=0;a<n;++a)this._cols[a]||(r=Math.min(r,s[o][a]));if(!Number.isFinite(r))throw new G("No feasible assignment");for(let o=0;o<t;++o)for(let a=0;a<n;++a)this._rows[o]&&(s[o][a]+=r),this._cols[a]||(s[o][a]-=r);this._step=2}else this.AgentsTasks=this._mask.map(r=>r.indexOf(1));return e}},Ni=class{constructor(e,t,n){this.VertexSetA=new _(A(e)),this.VertexSetB=new _(A(t)),this.CutCost=n}static AreEquivalent(e,t){let n=(s,r)=>s.size===r.size&&[...s].every(o=>r.has(o));return n(e.VertexSetA,t.VertexSetA)&&n(e.VertexSetB,t.VertexSetB)||n(e.VertexSetA,t.VertexSetB)&&n(e.VertexSetB,t.VertexSetA)}},wc=Object.freeze({AreEquivalent:Ni.AreEquivalent}),da=class i{constructor(e,t){this._cost=e,this._pathSize=t}Equals(e){return e instanceof i&&(this._cost===e._cost||Number.isNaN(this._cost)&&Number.isNaN(e._cost))&&this._pathSize===e._pathSize}CompareTo(e){if(e==null)return 1;let t=0;return this._cost!==e._cost&&(Number.isNaN(this._cost)?t=Number.isNaN(e._cost)?0:-1:Number.isNaN(e._cost)?t=1:t=this._cost<e._cost?-1:1),t||(e._pathSize<this._pathSize?-1:e._pathSize>this._pathSize?1:0)}GetHashCode(){let e=new ArrayBuffer(8),t=new DataView(e);return t.setFloat64(0,this._cost===0?0:this._cost),Math.imul(t.getInt32(0)^t.getInt32(4),397)^this._pathSize}},ua=class extends B{constructor(e,t=10){super(e),this._iterations=t,this.Partition=void 0}InternalCompute(){let e=de(this.VisitedGraph),t=new _(e.slice(0,Math.floor(e.length/2))),n=new _(e.slice(Math.floor(e.length/2))),s=new y(e.map(o=>[o,new y]));for(let o of this.VisitedGraph.Edges)if(!q(o.Source,o.Target)){let a=Number(o.Tag??1);if(!Number.isFinite(a))throw new RangeError("Weight must be finite");for(let[h,l]of[[o.Source,o.Target],[o.Target,o.Source]])s.get(h).set(l,(s.get(h).get(l)??0)+a)}let r=()=>$t(this.VisitedGraph).reduce((o,a)=>o+(t.has(a.Source)!==t.has(a.Target)?Number(a.Tag??1):0),0);for(let o=0;o<this._iterations;++o){this.ThrowIfCancellationRequested();let a=new _(t),h=new _(n),l=[],d=0,u=0,p=0,x=w=>[...s.get(w)].reduce((b,[m,E])=>b+(t.has(w)===t.has(m)?-E:E),0);for(;a.size&&h.size;){let w,b=-1/0;for(let f of a)for(let S of h){let T=x(f)+x(S)-2*(s.get(f).get(S)??0);T>b&&(b=T,w=[f,S])}let[m,E]=w;a.delete(m),h.delete(E),t.delete(m),t.add(E),n.delete(E),n.add(m),l.push(w),d+=b,d>u&&(u=d,p=l.length)}for(let w=l.length-1;w>=p;--w){let[b,m]=l[w];t.delete(m),t.add(b),n.delete(b),n.add(m)}if(u<=0)break}this.Partition=new Ni(t,n,r())}},pa=class extends nt{constructor(e,t){super(e,t),this.BestCost=1/0,this.ResultPath=void 0,this.VerticesColors=null}Initialize(){this.Distances=new y,this.Predecessors=new y,this.BestCost=1/0,this.ResultPath=void 0}TryGetDistance(e){if(A(e),this.State===Te.NotRunning)throw new G("Algorithm has not computed")}GetVertexColor(e){throw A(e),new $("TSP does not compute vertex colors")}InternalCompute(){let e=de(this.VisitedGraph),t=e.length;if(!t)return;let n=new y(e.map((u,p)=>[u,p])),s=Array.from({length:t},()=>new y);for(let u of this.VisitedGraph.Edges){let p=n.get(u.Source),x=n.get(u.Target),w=this.Weights(u);if(!Number.isFinite(w))throw new RangeError("TSP weights must be finite");(!s[p].has(x)||s[p].get(x).weight>w)&&s[p].set(x,{edge:u,weight:w})}if(t===1){let u=s[0].get(0);u&&this._save([u.edge],u.weight,e);return}let r=this.TryGetRootVertex(),o=r===void 0?0:n.get(r);if(o===void 0)throw new G("Root is not part of graph");let a=new Uint8Array(t),h=[],l=s.map(u=>Math.min(...[...u.values()].map(p=>p.weight)));a[o]=1;let d=(u,p,x)=>{if(this.ThrowIfCancellationRequested(),p===t){let m=s[u].get(o);m&&x+m.weight<this.BestCost&&this._save([...h,m.edge],x+m.weight,e);return}let w=x+l[u];for(let m=0;m<t;++m)a[m]||(w+=l[m]);if(w>=this.BestCost)return;let b=[...s[u]].filter(([m])=>!a[m]).sort((m,E)=>m[1].weight-E[1].weight);for(let[m,E]of b)a[m]=1,h.push(E.edge),d(m,p+1,x+E.weight),h.pop(),a[m]=0};d(o,1,0)}_save(e,t,n){this.BestCost=t,this.ResultPath=new Z(!0),this.ResultPath.AddVertexRange(n),this.ResultPath.AddEdgeRange(e)}},bc=Object.freeze({NoComponent:0,OneComponent:1,ManyComponents:2}),ga=class i{constructor(e){this.VisitedGraph=A(e),this._adj=cr(e)}CheckComponentsWithEdges(){let e=new _,t=0;for(let[n,s]of this._adj)if(s.size&&!e.has(n)){++t;let r=[n];e.add(n);for(let o=0;o<r.length;++o)for(let a of this._adj.get(r[o]))e.has(a)||(e.add(a),r.push(a))}return Math.min(2,t)}IsEulerian(){let e=this.CheckComponentsWithEdges();return e===1?[...this._adj.values()].every(t=>t.size%2===0):e===0&&this._adj.size===1}static IsEulerian(e){return new i(e).IsEulerian()}},fa=class i{constructor(e){this.VisitedGraph=A(e),this._adj=cr(e)}GetPermutations(){return[...this.EnumeratePermutations()]}*EnumeratePermutations(){let e=[...this._adj.keys()];if(!e.length)return;yield e.slice();let t=new Uint32Array(e.length);for(let n=0;n<e.length;)if(t[n]<n){let s=n%2?t[n]:0;[e[n],e[s]]=[e[s],e[n]],yield e.slice(),++t[n],n=0}else t[n]=0,++n}IsHamiltonian(){let e=this._adj.size;if(e<2)return e===1;if(e>=3&&[...this._adj.values()].every(r=>r.size>=e/2))return!0;let t=this._adj.keys().next().value,n=new _([t]),s=r=>{if(n.size===e)return this._adj.get(r).has(t);for(let o of this._adj.get(r))if(!n.has(o)){if(n.add(o),s(o))return!0;n.delete(o)}return!1};return s(t)}static IsHamiltonian(e){return new i(e).IsHamiltonian()}},ma=class extends ce{constructor(...e){super(...e),this._circuit=[],this._temporaryEdges=[],st(this,"TreeEdge CircuitEdge VisitEdge")}get Circuit(){return this._circuit.slice()}Initialize(){this._circuit=[]}InternalCompute(){let e=de(this.VisitedGraph);if(!e.length)return;let t=this.TryGetRootVertex();if(t===void 0&&(t=e[0]),$e(this.VisitedGraph,t),this.VisitedGraph.IsDirected!==!1){let h=new _,l=new _,d=new y(e.map(f=>[f,we(this.VisitedGraph,f)])),u=new y(e.map(f=>[f,0])),p=f=>{let S=d.get(f),T=u.get(f);for(;T<S.length&&h.has(S[T]);)++T;return u.set(f,T),T},x=f=>{let S=[],T=new _([f]),P=[{vertex:f,next:p(f)}];for(;P.length;){this.ThrowIfCancellationRequested();let M=P.at(-1),H=d.get(M.vertex);if(M.next===H.length){P.pop(),P.length&&S.pop();continue}let z=H[M.next++];if(!h.has(z)){if(this.TreeEdge.emit(z),q(z.Target,f))return[...S,z];T.has(z.Target)||(T.add(z.Target),S.push(z),P.push({vertex:z.Target,next:p(z.Target)}))}}return[]},w,b,m=(f,S)=>{let T,P;for(let H of f){h.add(H),this.CircuitEdge.emit(H);let z={edge:H,previous:P,next:void 0};P?P.next=z:T=z,P=z}if(!T)return S;let M=S?.previous??(S?void 0:b);return T.previous=M,P.next=S,M?M.next=T:w=T,S?S.previous=P:b=P,T};m(x(t),void 0);let E=w;for(;E;){let f=E.edge.Source;if(l.has(f)){E=E.next;continue}let S=d.get(f)[p(f)];if(!S){l.add(f),E=E.next;continue}this.VisitEdge.emit(S);let T=x(f);T.length?E=m(T,E):(l.add(f),E=E.next)}this._circuit=[];for(let f=w;f;f=f.next)this._circuit.push(f.edge);return}let n=new y(e.map(h=>[h,we(this.VisitedGraph,h)])),s=new y(e.map(h=>[h,0])),r=new _,o=[{vertex:t}],a=[];for(;o.length;){this.ThrowIfCancellationRequested();let h=o.at(-1),l=n.get(h.vertex),d=s.get(h.vertex);for(;d<l.length&&r.has(l[d]);)++d;if(s.set(h.vertex,d),d<l.length){let u=l[d];s.set(h.vertex,d+1),r.add(u),this.VisitEdge.emit(u),this.TreeEdge.emit(u),o.push({vertex:this.VisitedGraph.IsDirected===!1?Ia(u,h.vertex):u.Target,edge:u})}else{let u=o.pop();u.edge&&a.push(u.edge)}}this._circuit=a.reverse();for(let h of this._circuit)this.CircuitEdge.emit(h)}static ComputeEulerianPathCount(e){A(e);let t=de(e);if(e.EdgeCount<t.length)return 0;let n=0;for(let s of t)(we(e,s).length+(e.IsDirected===!1?0:vi(e,s).length))%2&&++n;return n===0?1:n%2?0:n/2}AddTemporaryEdges(e){if(A(e),this._temporaryEdges.length)throw new G("Temporary edges already added");let t=this.VisitedGraph,n=(s,r)=>{let o=e(s,r);if(!t.AddEdge(o))throw new G("Cannot add temporary edge");this._temporaryEdges.push(o)};if(t.IsDirected!==!1){let s=de(t).filter(o=>Math.abs(we(t,o).length-vi(t,o).length)%2),r=0;for(;s.length;){let o=s[0],a,h=!1;for(let l of we(t,o))if(!q(l.Target,o)&&s.some(d=>q(d,l.Target))&&(h=!0,!we(t,l.Target).some(d=>q(d.Target,o)))){a=l.Target;break}if(a===void 0&&!h&&(a=s[1]),a===void 0){if(s.push(s.shift()),++r>=s.length)throw new G("No valid temporary edge can pair the odd vertices");continue}r=0,n(o,a),s.splice(s.findIndex(l=>q(l,a)),1),s.splice(s.findIndex(l=>q(l,o)),1)}}else{let s=de(t).filter(r=>we(t,r).reduce((o,a)=>o+(q(a.Source,a.Target)?2:1),0)%2);for(let r=0;r<s.length;r+=2)n(s[r],s[r+1])}return this._temporaryEdges.slice()}RemoveTemporaryEdges(){for(let e of this._temporaryEdges)this.VisitedGraph.RemoveEdge(e);this._temporaryEdges=[]}Trails(e){return arguments.length&&A(e),this._trails(e)}*_trails(e){let t=this._circuit.slice(),n=new _(this._temporaryEdges),s;if(e!==void 0){$e(this.VisitedGraph,e);let o=t.findIndex(l=>!n.has(l)&&q(l.Source,e));if(o<0)throw new G("Starting vertex was not found in computed circuit");t=[...t.slice(o),...t.slice(0,o)],s=new y;let a=[e],h=new _(a);for(let l=0;l<a.length;++l)for(let d of we(this.VisitedGraph,a[l]))h.has(d.Target)||(h.add(d.Target),s.set(d.Target,d),a.push(d.Target))}let r=[];for(let o of t)if(n.has(o)){if(r.length&&(yield r),r=[],s){let a=o.Target;for(;!q(a,e);){let h=s.get(a);if(!h)throw new G("Trail is unreachable from starting vertex");r.push(h),a=h.Source}r.reverse()}}else r.push(o);r.length&&(yield r)}},xa=class extends B{constructor(e){super(e),this.Colors=new y,st(this,"VertexColored")}Initialize(){this.Colors=new y(de(this.VisitedGraph).map(e=>[e,null]))}InternalCompute(){for(let e of this.VisitedGraph.Vertices){this.ThrowIfCancellationRequested();let t=new _(we(this.VisitedGraph,e).map(s=>this.Colors.get(Ia(s,e)))),n=0;for(;t.has(n);)++n;this.Colors.set(e,n),this.VertexColored.emit(e)}}},ya=class extends B{constructor(e,t=Math.random){super(e),this._rng=A(t),this._cover=[]}get CoverSet(){return this.State===Te.Finished?this._cover.slice():null}Initialize(){this._cover=[]}InternalCompute(){let e=$t(this.VisitedGraph),t=new _;for(;e.length;){this.ThrowIfCancellationRequested();let n=e[Math.min(e.length-1,Math.floor(In(this._rng)*e.length))],s=0,r=0;for(let o of e)(q(o.Source,n.Source)||q(o.Target,n.Source))&&++s,(q(o.Source,n.Target)||q(o.Target,n.Target))&&++r;(s>1||s===1&&r===1)&&t.add(n.Source),r>1&&t.add(n.Target),e=e.filter(o=>!q(o.Source,n.Source)&&!q(o.Target,n.Source)&&!q(o.Source,n.Target)&&!q(o.Target,n.Target))}this._cover=[...t]}},lr=class extends B{},wa=class extends lr{constructor(...e){super(...e),this.MaximumClique=[],this.MaximalCliques=[]}Initialize(){this.MaximumClique=[],this.MaximalCliques=[]}InternalCompute(){let e=cr(this.VisitedGraph),t=(n,s,r)=>{if(this.ThrowIfCancellationRequested(),!s.size&&!r.size){this.MaximalCliques.push(n.slice()),n.length>this.MaximumClique.length&&(this.MaximumClique=n.slice());return}let o,a=-1;for(let h of new _([...s,...r])){let l=[...s].filter(d=>e.get(h).has(d)).length;l>a&&(a=l,o=h)}for(let h of[...s].filter(l=>o===void 0||!e.get(o).has(l))){let l=e.get(h);t([...n,h],new _([...s].filter(d=>l.has(d))),new _([...r].filter(d=>l.has(d)))),s.delete(h),r.add(h)}};t([],new _(e.keys()),new _)}},kn=(i,e)=>i?.OutEdges?[...i.OutEdges(e)]:[...A(i)],Mi=class{constructor(){this.Rand=Math.random}TryGetSuccessor(){throw new G("TryGetSuccessor must be implemented")}},Wt=class extends Mi{TryGetSuccessor(e,t){let n=kn(e,t);return n.length?n[Math.min(n.length-1,Math.floor(In(this.Rand)*n.length))]:void 0}},ba=class{constructor(){this._indices=new y}TryGetSuccessor(e,t){let n=kn(e,t);if(!n.length)return;let s=(this._indices.get(t)??0)%n.length;return this._indices.set(t,s+1),n[s]}},Li=class extends Mi{constructor(e){super(),this.Weights=A(e)}GetWeights(e){let t=0;for(let n of e){let s=this.Weights.get(n);if(!Number.isFinite(s)||s<0)throw new RangeError("Every edge needs a nonnegative finite weight");t+=s}return t}GetOutWeight(e,t){return this.GetWeights(kn(e,t))}_choose(e){let t=this.GetWeights(e);if(!e.length)return;let n=In(this.Rand)*t;for(let s of e)if(n-=this.Weights.get(s),n<=0)return s;return e.at(-1)}},Ea=class extends Li{TryGetSuccessor(e,t){return this._choose(kn(e,t))}},Sa=class extends Li{constructor(e,t=.2){super(e),this.Factor=t}TryGetSuccessor(e,t){let n=kn(e,t),s=this.GetWeights(n),r=this._choose(n);if(r!==void 0&&s>0){this.Weights.set(r,this.Weights.get(r)*this.Factor);for(let o of n)this.Weights.set(o,this.Weights.get(o)/s)}return r}},_a=class extends ce{constructor(e,t=new Wt){super(e),this.EdgeChain=t,this.EndPredicate=void 0,st(this,"StartVertex EndVertex TreeEdge")}get EdgeChain(){return this._chain}set EdgeChain(e){this._chain=A(e)}InternalCompute(){let e=this.TryGetRootVertex();if(e===void 0)throw new G("Root vertex not set");this.Generate(e)}Generate(e,t=100){$e(this.VisitedGraph,e);let n=e;this.StartVertex.emit(e);for(let s=0;s<t;++s){this.ThrowIfCancellationRequested();let r=this.EdgeChain.TryGetSuccessor(this.VisitedGraph,n);if(r==null||this.EndPredicate?.(r))break;this.TreeEdge.emit(r),n=r.Target}this.EndVertex.emit(n)}},Oi=class extends ce{constructor(...e){let[t,n,s=new Wt]=Ct(e);super(t,n),this.EdgeChain=A(s),this._rand=Math.random,this.VerticesColors=new y,this.Successors=new y,st(this,"InitializeVertex FinishVertex TreeEdge ClearTreeVertex")}get Rand(){return this._rand}set Rand(e){this._rand=A(e)}GetVertexColor(e){if(A(e),!this.VerticesColors.has(e))throw new $("Vertex color is not available");return this.VerticesColors.get(e)}Initialize(){this.Successors.clear(),this.VerticesColors.clear();for(let e of this.VisitedGraph.Vertices)this.VerticesColors.set(e,0),this.InitializeVertex.emit(e)}_makeTreeRoot(e){this.Successors.set(e,void 0),this.ClearTreeVertex.emit(e),this.VerticesColors.set(e,2),this.FinishVertex.emit(e)}_closedClasses(){let e=de(this.VisitedGraph),t=new y,n=new y(e.map(p=>[p,[]]));for(let p of e){let x=we(this.VisitedGraph,p);this.EdgeChain.Weights&&(x=this.EdgeChain.GetWeights(x)>0?x.filter(b=>this.EdgeChain.Weights.get(b)>0):x.slice(0,1)),t.set(p,x.map(w=>w.Target));for(let w of x)n.get(w.Target).push(p)}let s=new _(e.filter(p=>this.VerticesColors.get(p)===2)),r=[...s];for(let p=0;p<r.length;++p)for(let x of n.get(r[p]))s.has(x)||(s.add(x),r.push(x));let o=e.filter(p=>!s.has(p));if(!o.length)return[];let a=new _,h=[];for(let p of o)if(!a.has(p)){a.add(p);let x=[[p,0]];for(;x.length;){let w=x.at(-1),b=t.get(w[0]);if(w[1]===b.length){h.push(w[0]),x.pop();continue}let m=b[w[1]++];!s.has(m)&&!a.has(m)&&(a.add(m),x.push([m,0]))}}let l=new y,d=[];for(let p=h.length-1;p>=0;--p){let x=h[p];if(l.has(x))continue;let w=d.length,b=[x];l.set(x,w);for(let m=0;m<b.length;++m)for(let E of n.get(b[m]))!s.has(E)&&!l.has(E)&&(l.set(E,w),b.push(E));d.push(b)}let u=d.map(()=>!0);for(let p of o)for(let x of t.get(p))l.get(p)!==l.get(x)&&(u[l.get(p)]=!1);return d.filter((p,x)=>u[x])}_seedClosedClasses(){for(let e of this._closedClasses())this._makeTreeRoot(e[Math.floor(In(this.Rand)*e.length)])}InternalCompute(){let e=de(this.VisitedGraph),t=this.GetAndAssertRootInGraph();this._makeTreeRoot(t),this._seedClosedClasses();for(let n of e){if(this.ThrowIfCancellationRequested(),this.VerticesColors.get(n)===2)continue;let s=n,r=[],o=new y;for(;this.VerticesColors.get(s)!==2;){if(this.ThrowIfCancellationRequested(),o.has(s)){let h=o.get(s);for(let l of r.splice(h))o.delete(l),this.Successors.delete(l),this.ClearTreeVertex.emit(l)}o.set(s,r.length),r.push(s);let a=this.EdgeChain.TryGetSuccessor(this.VisitedGraph,s);if(!a){this._makeTreeRoot(s);break}this.Successors.set(s,a),this.TreeEdge.emit(a),s=a.Target,this.EdgeChain.Weights?.get(a)===0&&this._seedClosedClasses()}for(let a=r.length-1;a>=0;--a)this.VerticesColors.get(r[a])!==2&&(this.VerticesColors.set(r[a],2),this.FinishVertex.emit(r[a]))}}RandomTreeWithRoot(e){if(A(e),!this.VisitedGraph.ContainsVertex(e))throw new xe("Root vertex must be in the graph");return this.Compute(e)}RandomTree(){let e=de(this.VisitedGraph),t=1;for(;;){if(this.ThrowIfCancellationRequested(),this.Initialize(),!e.length)return this;let n=this._closedClasses().length;t/=2;let s=0,r=!1;for(let o of e){if(this.VerticesColors.get(o)===2)continue;let a=o,h=[],l=new y;for(;this.VerticesColors.get(a)!==2;){if(this.ThrowIfCancellationRequested(),l.has(a)){let p=l.get(a);for(let x of h.splice(p))l.delete(x),this.Successors.delete(x),this.ClearTreeVertex.emit(x)}l.set(a,h.length),h.push(a);let d=In(this.Rand)<=t,u=d?void 0:this.EdgeChain.TryGetSuccessor(this.VisitedGraph,a);if(!u){this._makeTreeRoot(a),++s>n&&(r=!0);break}this.Successors.set(a,u),this.TreeEdge.emit(u),a=u.Target}if(r)break;for(let d=h.length-1;d>=0;--d)this.VerticesColors.get(h[d])!==2&&(this.VerticesColors.set(h[d],2),this.FinishVertex.emit(h[d]))}if(!r)return this}}},Ca=class{constructor(){this._factories=[],this._cache=new y,this._pending=new y,this._vertexPredicate=()=>!0,this._edgePredicate=()=>!0}get IsDirected(){return!0}get AllowParallelEdges(){return!0}get SuccessorVertexPredicate(){return this._vertexPredicate}set SuccessorVertexPredicate(e){this._vertexPredicate=A(e),this._cache.clear()}get SuccessorEdgePredicate(){return this._edgePredicate}set SuccessorEdgePredicate(e){this._edgePredicate=A(e),this._cache.clear()}AddTransitionFactory(e){this._factories.push(A(e));for(let t of this._cache.keys())this._pending.set(t,new _);this._cache.clear()}AddTransitionFactories(e){for(let t of A(e))this.AddTransitionFactory(t)}RemoveTransitionFactory(e){let t=this._factories.indexOf(e);if(t<0)return!1;this._factories.splice(t,1),this._cache.clear();for(let[n,s]of this._pending)(!s.size||s.has(e))&&this._pending.delete(n);return!0}ClearTransitionFactories(){this._factories=[],this._cache.clear(),this._pending.clear()}ContainsTransitionFactory(e){return this._factories.includes(e)}ContainsVertex(e){return A(e),this._cache.has(e)||this._pending.has(e)}TryGetOutEdges(e){A(e);let t=this._pending.delete(e);if(this._cache.has(e))return this._cache.get(e).slice();let n=[];for(let s of this._factories)if(s.IsValid(e)){t=!0;for(let r of s.Apply(e))this.SuccessorVertexPredicate(r.Target)&&(this._cache.has(r.Target)||(this._pending.has(r.Target)||this._pending.set(r.Target,new _),this._pending.get(r.Target).add(s)),this.SuccessorEdgePredicate(r)&&n.push(r))}if(t)return this._cache.set(e,n),n.slice()}OutEdges(e){let t=this.TryGetOutEdges(e);if(t===void 0)throw new $("Vertex is not part of implicit graph");return t}OutDegree(e){return this.OutEdges(e).length}IsOutEdgesEmpty(e){return this.OutDegree(e)===0}OutEdge(e,t){let n=this.OutEdges(e);if(!Number.isInteger(t)||t<0||t>=n.length)throw new RangeError("Edge index out of range");return n[t]}},Bi=class{constructor(e=1e3,t=1e3){this.MaxVertexCount=e,this.MaxEdgeCount=t}Test(e){return A(e),e.VisitedGraph.VertexCount<=this.MaxVertexCount&&e.VisitedGraph.EdgeCount<=this.MaxEdgeCount}},Ta=class extends ce{static DefaultFinishedPredicate=Bi;constructor(...e){let[t,n]=Ct(e);super(t,n),this._factories=[],this._queue=[],this.AddVertexPredicate=()=>!0,this.ExploreVertexPredicate=()=>!0,this.AddEdgePredicate=()=>!0;let s=new Bi;this.FinishedPredicate=r=>s.Test(r),this.FinishedSuccessfully=!1,st(this,"DiscoverVertex TreeEdge BackEdge EdgeSkipped")}get AddVertexPredicate(){return this._addVertexPredicate}set AddVertexPredicate(e){this._addVertexPredicate=A(e)}get ExploreVertexPredicate(){return this._exploreVertexPredicate}set ExploreVertexPredicate(e){this._exploreVertexPredicate=A(e)}get AddEdgePredicate(){return this._addEdgePredicate}set AddEdgePredicate(e){this._addEdgePredicate=A(e)}get FinishedPredicate(){return this._finishedPredicate}set FinishedPredicate(e){this._finishedPredicate=A(e)}get UnExploredVertices(){return this._queue.slice()}AddTransitionFactory(e){this._factories.push(A(e))}AddTransitionFactories(e){for(let t of A(e))this.AddTransitionFactory(t)}RemoveTransitionFactory(e){let t=this._factories.indexOf(e);return t<0?!1:(this._factories.splice(t,1),!0)}ClearTransitionFactories(){this._factories=[]}ContainsTransitionFactory(e){return this._factories.includes(e)}Compute(e){return arguments.length&&this.SetRootVertex(e),B.prototype.Compute.call(this)}InternalCompute(){let e=this.TryGetRootVertex();if(e===void 0)throw new G("Root vertex not set");if(this.VisitedGraph.Clear(),this._queue=[],this.FinishedSuccessfully=!1,!this.AddVertexPredicate(e))throw new G("Starting vertex fails AddVertexPredicate");let t=n=>{this.VisitedGraph.AddVertex(n),this._queue.push(n),this.DiscoverVertex.emit(n)};for(t(e);this._queue.length;){if(this.ThrowIfCancellationRequested(),!this.FinishedPredicate(this))return;let n=this._queue.shift(),s=typeof n?.Clone=="function"?n.Clone():n;if(this.ExploreVertexPredicate(s)){for(let r of this._factories)if(r.IsValid(s))for(let o of r.Apply(s)){if(!this.AddVertexPredicate(o.Target)||!this.AddEdgePredicate(o)){this.EdgeSkipped.emit(o);continue}let a=q(o.Source,s)?n:de(this.VisitedGraph).find(d=>k(d,o.Source))??o.Source,h=de(this.VisitedGraph).find(d=>k(d,o.Target))??o.Target;if(!q(a,o.Source)||!q(h,o.Target)){let d=Object.getOwnPropertyDescriptors(o);d.Source={value:a,enumerable:!0},d.Target={value:h,enumerable:!0},o=Object.create(Object.getPrototypeOf(o),d)}let l=this.VisitedGraph.ContainsVertex(o.Target);l||t(o.Target),this.VisitedGraph.AddEdge(o),(l?this.BackEdge:this.TreeEdge).emit(o)}}}this.FinishedSuccessfully=!0}};var W=(i,e="value")=>{if(i==null)throw new TypeError(`${e} cannot be null`);return i},Ut=(i,e="value")=>{if(W(i,e),String(i).length===0)throw new TypeError(`${e} cannot be empty`);return i},rt=(i,e)=>i?.Equals?i.Equals(e):i===e,dr=Object.freeze({None:"none",Left:"left",Right:"right"}),Aa=Object.freeze({Close:"close",Open:"open"}),_c=Object.freeze({Box:"box",Crow:"crow",Diamond:"diamond",Dot:"dot",Inv:"inv",None:"none",Normal:"normal",Tee:"tee",Vee:"vee",Curve:"curve",ICurve:"icurve"}),Va=Object.freeze({Local:"local",Global:"global",None:"none"}),ka=Object.freeze({None:"none",Forward:"forward",Back:"back",Both:"both"}),Ga=Object.freeze({Unspecified:"unspecified",Invis:"invis",Dashed:"dashed",Dotted:"dotted",Bold:"bold",Solid:"solid"}),ja=Object.freeze({Cmap:"cmap",Fig:"fig",Gd:"gd",Gd2:"gd2",Gif:"gif",Hpgl:"hpgl",Imap:"imap",Jpeg:"jpeg",Mif:"mif",Mp:"mp",Pcl:"pcl",Pic:"pic",PlainText:"plaintext",Png:"png",Ps:"ps",Ps2:"ps2",Svg:"svg",Svgz:"svgz",Vrml:"vrml",Vtx:"vtx",Wbmp:"wbmp"}),Fa=Object.freeze({L:"l",R:"r",C:"c"}),Ra=Object.freeze({T:"t",B:"b"}),Da=Object.freeze({BreadthFirst:"breadthfirst",NodesFirst:"nodesfirst",EdgesFirst:"edgesfirst"}),Pa=Object.freeze({BL:"BL",BR:"BR",TL:"TL",TR:"TR",RB:"RB",RT:"RT",LB:"LB",LT:"LT"}),va=Object.freeze({LR:"LR",TB:"TB"}),Na=Object.freeze({Fill:"fill",Compress:"compress",Auto:"auto"}),Ma=Object.freeze({Spline:"spline",None:"none",Line:"line",Polyline:"polyline",Curved:"curved",Ortho:"ortho"}),We=Object.freeze({Unspecified:"unspecified",Box:"box",Polygon:"polygon",Ellipse:"ellipse",Circle:"circle",Point:"point",Egg:"egg",Triangle:"triangle",Plaintext:"plaintext",Diamond:"diamond",Trapezium:"trapezium",Parallelogram:"parallelogram",House:"house",Pentagon:"pentagon",Hexagon:"hexagon",Septagon:"septagon",Octagon:"octagon",DoubleCircle:"doublecircle",DoubleOctagon:"doubleoctagon",TripleOctagon:"tripleoctagon",InvTriangle:"invtriangle",InvTrapezium:"invtrapezium",InvHouse:"invhouse",MDiamond:"mdiamond",MSquare:"msquare",MCircle:"mcircle",Rect:"rect",Rectangle:"rectangle",Record:"record"}),Gn=Object.freeze({Unspecified:"unspecified",Filled:"filled",Diagonals:"diagonals",Rounded:"rounded",Invis:"invis",Dashed:"dashed",Dotted:"dotted",Bold:"bold",Solid:"solid"}),at=Object.freeze({Escape(i){return String(W(i)).replace(/\r\n|\r|\n|["\\]/g,e=>/[\r\n]/.test(e)?"\\n":"\\"+e)},EscapeRecord(i){return String(W(i)).replace(/\r\n|\r|\n|[|<>" \\{}]/g,e=>/[\r\n]/.test(e)?"\\n":"\\"+e)},EscapePort(i){return String(W(i)).replace(/\r\n|\r|\n|[|<>" \\{}]/g,"_")}}),It=class{constructor(e){this.String=W(e)}toString(){return this.String}},qi=class{constructor(e){this.value=e}},ot=i=>new qi(i),Fn=i=>`"${at.Escape(i)}"`,za=i=>i instanceof qi?String(i.value):i instanceof It?`<${i.String}>`:i instanceof Dn?`"${i.ToDot()}"`:i instanceof c?Fn(i.ToDot()):typeof i=="string"?Fn(i):String(i).toLowerCase(),Ie=(i,e,t)=>i instanceof globalThis.Map?i.set(e,t):W(i)[e]=t,vh=(i,e=", ")=>[...i instanceof globalThis.Map?i:Object.entries(i)].map(([t,n])=>`${t}=${za(n)}`).join(e),c=class i{constructor(e=0,t=0,n=0,s=0){for(let r of[e,t,n,s])if(!Number.isInteger(r)||r<0||r>255)throw new RangeError("Color channels must be bytes");this.A=e,this.R=t,this.G=n,this.B=s,Object.freeze(this)}Equals(e){return e instanceof i&&this.A===e.A&&this.R===e.R&&this.G===e.G&&this.B===e.B}GetHashCode(){return this.A<<24|this.R<<16|this.G<<8|this.B}ToDot(){return"#"+[this.R,this.G,this.B,this.A].map(e=>e.toString(16).padStart(2,"0").toUpperCase()).join("")}toString(){return this.ToDot()}};c.AliceBlue=new c(255,240,248,255);c.AntiqueWhite=new c(255,250,235,215);c.Aqua=new c(255,0,255,255);c.Aquamarine=new c(255,127,255,212);c.Azure=new c(255,240,255,255);c.Beige=new c(255,245,245,220);c.Bisque=new c(255,255,228,196);c.Black=new c(255,0,0,0);c.BlanchedAlmond=new c(255,255,235,205);c.Blue=new c(255,0,0,255);c.BlueViolet=new c(255,138,43,226);c.Brown=new c(255,165,42,42);c.BurlyWood=new c(255,222,184,135);c.CadetBlue=new c(255,95,158,160);c.Chartreuse=new c(255,127,255,0);c.Chocolate=new c(255,210,105,30);c.Coral=new c(255,255,127,80);c.CornflowerBlue=new c(255,100,149,237);c.Cornsilk=new c(255,255,248,220);c.Crimson=new c(255,220,20,60);c.Cyan=new c(255,0,255,255);c.DarkBlue=new c(255,0,0,139);c.DarkCyan=new c(255,0,139,139);c.DarkGoldenrod=new c(255,184,134,11);c.DarkGray=new c(255,169,169,169);c.DarkGreen=new c(255,0,100,0);c.DarkKhaki=new c(255,189,183,107);c.DarkMagenta=new c(255,139,0,139);c.DarkOliveGreen=new c(255,85,107,47);c.DarkOrange=new c(255,255,140,0);c.DarkOrchid=new c(255,153,50,204);c.DarkRed=new c(255,139,0,0);c.DarkSalmon=new c(255,233,150,122);c.DarkSeaGreen=new c(255,143,188,139);c.DarkSlateBlue=new c(255,72,61,139);c.DarkSlateGray=new c(255,47,79,79);c.DarkTurquoise=new c(255,0,206,209);c.DarkViolet=new c(255,148,0,211);c.DeepPink=new c(255,255,20,147);c.DeepSkyBlue=new c(255,0,191,255);c.DimGray=new c(255,105,105,105);c.DodgerBlue=new c(255,30,144,255);c.Firebrick=new c(255,178,34,34);c.FloralWhite=new c(255,255,250,240);c.ForestGreen=new c(255,34,139,34);c.Fuchsia=new c(255,255,0,255);c.Gainsboro=new c(255,220,220,220);c.GhostWhite=new c(255,248,248,255);c.Gold=new c(255,255,215,0);c.Goldenrod=new c(255,218,165,32);c.Gray=new c(255,128,128,128);c.Green=new c(255,0,128,0);c.GreenYellow=new c(255,173,255,47);c.Honeydew=new c(255,240,255,240);c.HotPink=new c(255,255,105,180);c.IndianRed=new c(255,205,92,92);c.Indigo=new c(255,75,0,130);c.Ivory=new c(255,255,255,240);c.Khaki=new c(255,240,230,140);c.Lavender=new c(255,230,230,250);c.LavenderBlush=new c(255,255,240,245);c.LawnGreen=new c(255,124,252,0);c.LemonChiffon=new c(255,255,250,205);c.LightBlue=new c(255,173,216,230);c.LightCoral=new c(255,240,128,128);c.LightCyan=new c(255,224,255,255);c.LightGoldenrodYellow=new c(255,250,250,210);c.LightGray=new c(255,211,211,211);c.LightGreen=new c(255,144,238,144);c.LightPink=new c(255,255,182,193);c.LightSalmon=new c(255,255,160,122);c.LightSeaGreen=new c(255,32,178,170);c.LightSkyBlue=new c(255,135,206,250);c.LightSlateGray=new c(255,119,136,153);c.LightSteelBlue=new c(255,176,196,222);c.LightYellow=new c(255,255,255,224);c.Lime=new c(255,0,255,0);c.LimeGreen=new c(255,50,205,50);c.Linen=new c(255,250,240,230);c.Magenta=new c(255,255,0,255);c.Maroon=new c(255,128,0,0);c.MediumAquamarine=new c(255,102,205,170);c.MediumBlue=new c(255,0,0,205);c.MediumOrchid=new c(255,186,85,211);c.MediumPurple=new c(255,147,112,219);c.MediumSeaGreen=new c(255,60,179,113);c.MediumSlateBlue=new c(255,123,104,238);c.MediumSpringGreen=new c(255,0,250,154);c.MediumTurquoise=new c(255,72,209,204);c.MediumVioletRed=new c(255,199,21,133);c.MidnightBlue=new c(255,25,25,112);c.MintCream=new c(255,245,255,250);c.MistyRose=new c(255,255,228,225);c.Moccasin=new c(255,255,228,225);c.NavajoWhite=new c(255,255,222,173);c.Navy=new c(255,0,0,128);c.OldLace=new c(255,253,245,230);c.Olive=new c(255,128,128,0);c.OliveDrab=new c(255,107,142,35);c.Orange=new c(255,255,165,0);c.OrangeRed=new c(255,255,69,0);c.Orchid=new c(255,218,112,214);c.PaleGoldenrod=new c(255,238,232,170);c.PaleGreen=new c(255,152,251,152);c.PaleTurquoise=new c(255,175,238,238);c.PaleVioletRed=new c(255,219,112,147);c.PapayaWhip=new c(255,255,239,213);c.PeachPuff=new c(255,255,218,185);c.Peru=new c(255,205,133,63);c.Pink=new c(255,255,192,203);c.Plum=new c(255,221,160,221);c.PowderBlue=new c(255,176,224,230);c.Purple=new c(255,128,0,128);c.Red=new c(255,255,0,0);c.RosyBrown=new c(255,188,143,143);c.RoyalBlue=new c(255,65,105,225);c.SaddleBrown=new c(255,139,69,19);c.Salmon=new c(255,250,128,114);c.SandyBrown=new c(255,244,164,96);c.SeaGreen=new c(255,46,139,87);c.SeaShell=new c(255,255,245,238);c.Sienna=new c(255,160,82,45);c.Silver=new c(255,192,192,192);c.SkyBlue=new c(255,135,206,235);c.SlateBlue=new c(255,106,90,205);c.SlateGray=new c(255,112,128,144);c.Snow=new c(255,255,250,250);c.SpringGreen=new c(255,0,255,127);c.SteelBlue=new c(255,70,130,180);c.Tan=new c(255,210,180,140);c.Teal=new c(255,0,128,128);c.Thistle=new c(255,216,191,216);c.Tomato=new c(255,255,99,71);c.Transparent=new c(0,255,255,255);c.Turquoise=new c(255,64,224,208);c.Violet=new c(255,238,130,238);c.Wheat=new c(255,245,222,179);c.White=new c(255,255,255,255);c.WhiteSmoke=new c(255,245,245,245);c.Yellow=new c(255,255,255,0);c.YellowGreen=new c(255,154,205,50);var Rn=class{constructor(e,t){if(this.Name=Ut(e,"name"),!(t>0))throw new RangeError("Size must be positive");this.SizeInPoints=t}},ur=class{constructor(e,t){this.X=e,this.Y=t}},ke=class{constructor(e=0,t=0){if(!(e>=0&&t>=0))throw new RangeError("Width and height must be nonnegative");this.Width=e,this.Height=t}get IsEmpty(){return this.Width===0||this.Height===0}ToString(){return`${this.Width}x${this.Height}`}toString(){return this.ToString()}},ht=class extends ke{},ji=class extends Array{static get[Symbol.species](){return Array}constructor(e=[]){super(),this.push(...W(e))}get Count(){return this.length}Add(e){this.push(W(e))}AddRange(e){for(let t of e)this.Add(t)}Clear(){this.length=0}Contains(e){return this.includes(e)}Remove(e){let t=this.indexOf(e);return t<0?!1:(this.splice(t,1),!0)}Insert(e,t){this.splice(e,0,W(t))}RemoveAt(e){if(e<0||e>=this.length)throw new RangeError("Index out of range");this.splice(e,1)}},La=class{constructor(e){this.Name=e}get Name(){return this._name}set Name(e){this._name=Ut(e,"Name")}},zi=class extends ji{constructor(e=[]){super(e),this.Separators=":"}get Separators(){return this._separators}set Separators(e){this._separators=Ut(e,"Separators")}ToDot(){return this.length?`layers=${Fn(this.map(e=>e.Name).join(this.Separators))}; layersep=${Fn(this.Separators)}`:""}},pr=class extends ji{},Dn=class{constructor(){this.Cells=new pr}get Cells(){return this._cells}set Cells(e){this._cells=W(e,"Cells")}ToDot(){return Array.from(this.Cells,e=>e.ToDot()).join(" | ")}ToString(){return this.ToDot()}toString(){return this.ToDot()}},Pn=class extends Dn{constructor(e=null,t=null){super(),this.Text=e,this.Port=t}get HasPort(){return this.Port!=null&&String(this.Port).length>0}get HasText(){return this.Text!=null&&String(this.Text).length>0}ToDot(){let e=(this.HasPort?`<${at.EscapePort(this.Port)}> `:"")+(this.HasText?at.EscapeRecord(this.Text):"");return this.Cells.length&&(e+=(e?" | ":"")+`{ ${super.ToDot()} }`),e}},Oa=class{constructor(e,t=dr.None,n=Aa.Close){this.Shape=e,this.Clipping=t,this.Filling=n}ToDot(){let e=String(this.Shape).toLowerCase();return(this.Filling===Aa.Open&&["box","diamond","dot","inv","normal"].includes(e)?"o":"")+(["box","crow","diamond","inv","normal","tee","vee","curve","icurve"].includes(e)?this.Clipping===dr.Left?"l":this.Clipping===dr.Right?"r":"":"")+e}ToString(){return this.ToDot()}toString(){return this.ToDot()}},vn=class{GenerateDot(e){return vh(W(e))}ToString(){return this.ToDot()}toString(){return this.ToDot()}},$i=class extends vn{constructor(){super(),this.Position=null,this.Comment=null,this.IsHtmlLabel=!1,this.Label=null,this.ToolTip=null,this.Url=null,this.Distortion=0,this.FillColor=c.White,this.Font=null,this.FontColor=c.Black,this.PenWidth=1,this.Group=null,this.Layer=null,this.Orientation=0,this.Peripheries=-1,this.Regular=!1,this.Record=new Dn,this.Shape=We.Unspecified,this.Sides=4,this.Size=new ke,this.FixedSize=!1,this.Skew=0,this.StrokeColor=c.Black,this.Style=Gn.Unspecified,this.Z=-1}InternalToDot(e=null){let t=new y;this.Font&&(t.set("fontname",this.Font.Name),t.set("fontsize",this.Font.SizeInPoints)),rt(this.FontColor,c.Black)||t.set("fontcolor",this.FontColor),this.PenWidth!==1&&t.set("penwidth",this.PenWidth);for(let[s,r]of[["ToolTip","tooltip"],["Comment","comment"],["Url","URL"]])this[s]!=null&&t.set(r,this[s]);this.Shape!==We.Unspecified&&t.set("shape",ot(this.Shape));let n=this.Shape===We.Unspecified&&e?e.Shape:this.Shape;if(n===We.Record?this.Label?t.set("label",ot(`"${this.Label}"`)):this.Record?.Cells.length&&t.set("label",this.Record):this.Label&&t.set("label",this.IsHtmlLabel?new It(this.Label):this.Label),n===We.Polygon)for(let[s,r]of[["Sides","sides"],["Skew","skew"],["Distortion","distortion"]])this[s]!==0&&t.set(r,this[s]);return this.FixedSize&&(t.set("fixedsize",!0),this.Size.Height>0&&t.set("height",this.Size.Height),this.Size.Width>0&&t.set("width",this.Size.Width)),this.Style!==Gn.Unspecified&&t.set("style",ot(this.Style)),rt(this.StrokeColor,c.Black)||t.set("color",this.StrokeColor),rt(this.FillColor,c.White)||t.set("fillcolor",this.FillColor),this.Orientation>0&&t.set("orientation",this.Orientation),this.Regular&&t.set("regular",!0),this.Group!=null&&t.set("group",this.Group),this.Layer&&t.set("layer",this.Layer.Name),this.Peripheries>=0&&t.set("peripheries",this.Peripheries),this.Z>0&&t.set("z",this.Z),this.Position&&t.set("pos",`${this.Position.X},${this.Position.Y}!`),this.GenerateDot(t)}ToDot(){return this.InternalToDot()}},gr=class{constructor(){this.Angle=-25,this.Distance=1,this.Float=!0,this.Font=null,this.FontColor=c.Black,this.IsHtmlLabel=!1,this.Value=null}AddParameters(e,t=!0){W(e),this.Value!=null&&(Ie(e,"label",this.IsHtmlLabel?new It(this.Value):t?at.Escape(this.Value):this.Value),this.Angle!==-25&&Ie(e,"labelangle",this.Angle),this.Distance!==1&&Ie(e,"labeldistance",this.Distance),this.Float||Ie(e,"labelfloat",!1),this.Font&&(Ie(e,"labelfontname",this.Font.Name),Ie(e,"labelfontsize",this.Font.SizeInPoints)),rt(this.FontColor,c.Black)||Ie(e,"labelfontcolor",this.FontColor))}},Wi=class{constructor(e){this.IsHead=!!e,this.IsClipped=!0,this.IsHtmlLabel=!1,this.Label=null,this.ToolTip=null,this.Url=null,this.Logical=null,this.Same=null}AddParameters(e,t=!0){W(e);let n=this.IsHead?"head":"tail";this.Url!=null&&Ie(e,n+"URL",this.Url),this.IsClipped||Ie(e,n+"clip",!1),this.Label!=null&&Ie(e,n+"label",this.IsHtmlLabel?new It(this.Label):t?at.Escape(this.Label):this.Label),this.ToolTip!=null&&Ie(e,n+"tooltip",t?at.Escape(this.ToolTip):this.ToolTip),this.Logical!=null&&Ie(e,"l"+n,this.Logical),this.Same!=null&&Ie(e,"same"+n,this.Same)}},Ui=class extends vn{constructor(){super(),this.Comment=null,this.Label=new gr,this.ToolTip=null,this.Url=null,this.Direction=ka.Forward,this.Font=null,this.FontColor=c.Black,this.PenWidth=1,this.Head=new Wi(!0),this.HeadArrow=null,this.HeadPort=null,this.Tail=new Wi(!1),this.TailArrow=null,this.TailPort=null,this.IsConstrained=!0,this.IsDecorated=!1,this.Layer=null,this.StrokeColor=c.Black,this.Style=Ga.Unspecified,this.Weight=1,this.Length=1,this.MinLength=1}get Label(){return this._label}set Label(e){this._label=W(e,"Label")}get Head(){return this._head}set Head(e){if(!W(e,"Head").IsHead)throw new TypeError("Head must be a head extremity");this._head=e}get Tail(){return this._tail}set Tail(e){if(W(e,"Tail").IsHead)throw new TypeError("Tail must be a tail extremity");this._tail=e}ToDot(){let e=new y;this.Direction!==ka.Forward&&e.set("dir",ot(this.Direction)),this.Font&&(e.set("fontname",this.Font.Name),e.set("fontsize",this.Font.SizeInPoints)),rt(this.FontColor,c.Black)||e.set("fontcolor",this.FontColor),this.PenWidth!==1&&e.set("penwidth",this.PenWidth),this.Head.AddParameters(e,!1),this.HeadArrow&&e.set("arrowhead",this.HeadArrow.ToDot()),this.HeadPort!=null&&e.set("headport",at.EscapePort(this.HeadPort)),this.IsConstrained||e.set("constraint",!1),this.IsDecorated&&e.set("decorate",!0),this.Label.AddParameters(e,!1),this.Layer&&e.set("layer",this.Layer.Name),this.MinLength!==1&&e.set("minlen",this.MinLength),this.Length!==1&&e.set("len",this.Length),rt(this.StrokeColor,c.Black)||e.set("color",this.StrokeColor),this.Style!==Ga.Unspecified&&e.set("style",ot(this.Style)),this.Tail.AddParameters(e,!1),this.TailArrow&&e.set("arrowtail",this.TailArrow.ToDot()),this.TailPort!=null&&e.set("tailport",at.EscapePort(this.TailPort));for(let[t,n]of[["ToolTip","tooltip"],["Comment","comment"],["Url","URL"]])this[t]!=null&&e.set(n,this[t]);return this.Weight!==1&&e.set("weight",this.Weight),this.GenerateDot(e)}},Hi=class extends vn{constructor(){super(),this.Name="G",this.Comment=null,this.Url=null,this.BackgroundColor=c.White,this.ClusterRank=Va.Local,this.Font=null,this.FontColor=c.Black,this.PenWidth=1,this.IsCentered=!1,this.IsCompounded=!1,this.IsConcentrated=!1,this.IsLandscape=!1,this.IsNormalized=!1,this.IsReMinCross=!1,this.IsHtmlLabel=!1,this.Label=null,this.LabelJustification=Fa.C,this.LabelLocation=Ra.B,this.Layers=new zi,this.McLimit=1,this.NodeSeparation=.25,this.RankDirection=va.TB,this.RankSeparation=.5,this.NsLimit=-1,this.NsLimit1=-1,this.OutputOrder=Da.BreadthFirst,this.PageDirection=Pa.BL,this.PageSize=new ke,this.Quantum=0,this.Ratio=Na.Auto,this.Resolution=.96,this.Rotate=0,this.SamplePoints=8,this.SearchSize=30,this.Size=new ke,this.Splines=Ma.Spline,this.StyleSheet=null}get Name(){return this._name}set Name(e){this._name=W(e,"Name")}GenerateDot(e){let t=[...e instanceof globalThis.Map?e:Object.entries(e)].map(([n,s])=>s instanceof zi?s.ToDot():`${n}=${za(s)}`);return t.join("; ")+(t.length>1?";":"")}ToDot(){let e=new y;this.Url!=null&&e.set("URL",this.Url),rt(this.BackgroundColor,c.White)||e.set("bgcolor",this.BackgroundColor),this.IsCentered&&e.set("center",!0),this.ClusterRank!==Va.Local&&e.set("clusterrank",this.ClusterRank),this.Comment!=null&&e.set("comment",this.Comment),this.IsCompounded&&e.set("compound",!0),this.IsConcentrated&&e.set("concentrate",!0),this.Font&&(e.set("fontname",this.Font.Name),e.set("fontsize",this.Font.SizeInPoints)),rt(this.FontColor,c.Black)||e.set("fontcolor",this.FontColor),this.PenWidth!==1&&e.set("penwidth",this.PenWidth),this.Label!=null&&e.set("label",this.IsHtmlLabel?new It(this.Label):this.Label),this.LabelJustification!==Fa.C&&e.set("labeljust",this.LabelJustification),this.LabelLocation!==Ra.B&&e.set("labelloc",this.LabelLocation),this.Layers.length&&e.set("layers",this.Layers);for(let[t,n,s]of[["McLimit","mclimit",1],["NodeSeparation","nodesep",.25]])this[t]!==s&&e.set(n,this[t]);return this.RankDirection!==va.TB&&e.set("rankdir",ot(this.RankDirection)),this.RankSeparation!==.5&&e.set("ranksep",this.RankSeparation),this.IsNormalized&&e.set("normalize",!0),this.NsLimit>0&&e.set("nslimit",this.NsLimit),this.NsLimit1>0&&e.set("nslimit1",this.NsLimit1),this.OutputOrder!==Da.BreadthFirst&&e.set("outputorder",this.OutputOrder),this.PageSize.IsEmpty||e.set("page",`${this.PageSize.Width},${this.PageSize.Height}`),this.PageDirection!==Pa.BL&&e.set("pagedir",ot(this.PageDirection)),this.Quantum>0&&e.set("quantum",this.Quantum),this.Ratio!==Na.Auto&&e.set("ratio",this.Ratio),this.IsReMinCross&&e.set("remincross",!0),this.Resolution!==.96&&e.set("resolution",this.Resolution),this.Rotate?e.set("rotate",this.Rotate):this.IsLandscape&&e.set("orientation","[1L]*"),this.SamplePoints!==8&&e.set("samplepoints",this.SamplePoints),this.SearchSize!==30&&e.set("searchsize",this.SearchSize),this.Size.IsEmpty||e.set("size",`${this.Size.Width},${this.Size.Height}`),this.Splines!==Ma.Spline&&e.set("splines",ot(this.Splines)),this.StyleSheet!=null&&e.set("stylesheet",this.StyleSheet),this.GenerateDot(e)}},fr=class{constructor(e,t){this.Vertex=W(e,"vertex"),this.VertexFormat=W(t,"vertexFormat")}},mr=class{constructor(e,t){this.Edge=W(e,"edge"),this.EdgeFormat=W(t,"edgeFormat")}},xr=class{constructor(e,t){this.Cluster=W(e,"cluster"),this.GraphFormat=W(t,"graphFormat")}},Ht=class{constructor(e,t=ja.Png){this.VisitedGraph=e,this.ImageType=t,this.GraphFormat=new Hi,this.CommonVertexFormat=new $i,this.CommonEdgeFormat=new Ui,this.FormatVertex=new L,this.FormatEdge=new L,this.FormatCluster=new L,this.Output=null,this.ClusterCount=0}get VisitedGraph(){return this._graph}set VisitedGraph(e){this._graph=W(e,"graph")}Generate(e,t){if(arguments.length&&e==null)throw new TypeError("engine cannot be null");e&&Ut(t,"outputFilePath"),this.ClusterCount=0;let n=new y(Array.from(this.VisitedGraph.Vertices,(w,b)=>[w,b])),s=new _(n.keys()),r=new _(this.VisitedGraph.Edges),o=String(this.GraphFormat.Name),a=[`${this.VisitedGraph.IsDirected?"digraph":"graph"} ${/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(o)?o:Fn(o)} {`],h=this.GraphFormat.ToDot(),l=this.CommonVertexFormat.ToDot(),d=this.CommonEdgeFormat.ToDot();h&&a.push(h),l&&a.push(`node [${l}];`),d&&a.push(`edge [${d}];`);let u=w=>{let b=new $i;this.FormatVertex.emit(this,new fr(w,b));let m=b.InternalToDot(this.CommonVertexFormat);a.push(`${n.get(w)}${m?` [${m}]`:""};`),s.delete(w)},p=w=>{if(!n.has(w.Source)||!n.has(w.Target))throw new Error("Edge references vertex outside graph");let b=new Ui;this.FormatEdge.emit(this,new mr(w,b));let m=b.ToDot();a.push(`${n.get(w.Source)} ${this.VisitedGraph.IsDirected?"->":"--"} ${n.get(w.Target)}${m?` [${m}]`:""};`),r.delete(w)},x=w=>{for(let b of w.Clusters??[]){a.push(`subgraph cluster${++this.ClusterCount} {`);let m=new Hi;this.FormatCluster.emit(this,new xr(b,m));let E=m.ToDot();if(E&&a.push(E),x(b),w.Collapsed){for(let f of b.Vertices)s.delete(f);for(let f of b.Edges)r.delete(f)}else{for(let f of b.Vertices)s.has(f)&&u(f);for(let f of b.Edges)r.has(f)&&p(f)}a.push("}")}};x(this.VisitedGraph);for(let w of s)u(w);for(let w of r)p(w);return a.push("}"),this.Output=a.join(`
`),e?e.Run(this.ImageType,this.Output,t):this.Output}};function $a(i,e){if(arguments.length>1&&e===null)throw new TypeError("initAlgorithm cannot be null");let t=new Ht(i);return e&&e(t),t.Generate()}var Nh="https://rise4fun.com/rest/ask/Agl/";function Mh(i,e,t){W(i,"graphOrDot"),W(e,"SVG rendering engine");let n=typeof i=="string"?i:$a(i,t),s;if(typeof e=="function")s=e(n);else if(typeof e.renderString=="function")s=e.renderString(n,{format:"svg"});else if(typeof e.Run=="function")s=e.Run(ja.Svg,n,"graph.svg");else throw new TypeError("SVG engine must expose renderString, Run or be a callback");return s?.then?s.then(r=>r??""):s??""}var Cc=Object.freeze({ToGraphviz:$a,ToSvg:Mh,DotToSvgApiEndpoint:Nh}),Ba=class{constructor(e){this.WriteFile=W(e,"writeFile callback")}Run(e,t,n){Ut(t,"dot"),Ut(n,"outputFilePath");let s=/\.dot$/i.test(n)?n:n+".dot",r=this.WriteFile(s,t);return r?.then?r.then(()=>s):s}},Tc=Object.freeze({ParseSize(i){W(i,"svg");let e=String(i).match(/<svg\b[^>]*>/i)?.[0]??"",t=e.match(/\bwidth\s*=\s*["'](\d+(?:\.\d+)?)\s*(?:px)?["']/i),n=e.match(/\bheight\s*=\s*["'](\d+(?:\.\d+)?)\s*(?:px)?["']/i);return t&&n?new ht(+t[1],+n[1]):new ht(400,400)},DumpHtml(i,e,t){W(i),W(e);let s=`<!doctype html>
<html><body><object data="${(a=>String(a).replace(/[&<>"']/g,h=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"})[h]))(e)}" type="image/svg+xml" width="${i.Width}" height="${i.Height}"></object></body></html>`;if(!t)return s;let r=e+".html",o=t(r,s);return o?.then?o.then(()=>r):r},WrapSvg(i,e="image.svg",t){return this.DumpHtml(this.ParseSize(i),e,t)}}),yr=class{constructor(e){this.Graphviz=new Ht(e),Object.assign(this.Graphviz.CommonVertexFormat,{Style:Gn.Filled,FillColor:c.LightYellow,Font:new Rn("Tahoma",8.25),Shape:We.Box}),this.Graphviz.CommonEdgeFormat.Font=new Rn("Tahoma",8.25)}get VisitedGraph(){return this.Graphviz.VisitedGraph}Initialize(){}Clean(){}Generate(...e){this.Initialize();try{return this.Graphviz.Generate(...e)}finally{this.Clean()}}},wr=class extends yr{Initialize(){this._vertexFormatter=(e,t)=>{let n=t.Vertex;t.VertexFormat.Label=`${n.VertexCount}-${n.EdgeCount}
`+Array.from(n.Vertices,s=>`  ${s}
`).join("")+Array.from(n.Edges,s=>`  ${s}
`).join("")},this._edgeFormatter=(e,t)=>{let n=[...t.Edge.Edges];t.EdgeFormat.Label.Value=`${n.length}
`+n.map(s=>`  ${s}
`).join("")},this.Graphviz.FormatVertex.add(this._vertexFormatter),this.Graphviz.FormatEdge.add(this._edgeFormatter)}Clean(){this.Graphviz.FormatVertex.remove(this._vertexFormatter),this.Graphviz.FormatEdge.remove(this._edgeFormatter)}},qa=class extends wr{Initialize(){super.Initialize(),this.Graphviz.FormatVertex.remove(this._vertexFormatter),this._vertexFormatter=(e,t)=>{t.VertexFormat.Label=String(t.Vertex)},this.Graphviz.FormatVertex.add(this._vertexFormatter)}},Ic=Object.freeze({ToGraphvizColor:i=>i instanceof c?i:new c(i.A??255,i.R,i.G,i.B),ToFont:(i,e)=>i==null?null:e?e(i.Name,i.SizeInPoints):{Name:i.Name,SizeInPoints:i.SizeInPoints},ToGraphvizFont:i=>i==null?null:new Rn(i.Name,i.SizeInPoints),ToGraphvizPoint:i=>new ur(i.X,i.Y),ToGraphvizSize:i=>new ht(i.Width,i.Height),ToGraphvizSizeF:i=>new ke(i.Width,i.Height)});var D=Object.freeze({Boolean:1,Byte:2,Char:3,Decimal:5,Double:6,Int16:7,Int32:8,Int64:9,SByte:10,Single:11,TimeSpan:12,DateTime:13,UInt16:14,UInt32:15,UInt64:16,Null:17,String:18}),kt=Object.freeze({Primitive:0,String:1,Object:2,SystemClass:3,Class:4,ObjectArray:5,StringArray:6,PrimitiveArray:7}),I=D,K=kt,Wa=new TextEncoder,Ua=new TextDecoder("utf-8",{fatal:!0});var Nn=new Set(Object.values(I)),R=i=>{throw new te(i)};function Qa(i){for(let[e,t]of Object.entries(i))if(e.startsWith("max")&&(!Number.isSafeInteger(t)||t<0))throw new RangeError(`${e} must be a nonnegative safe integer`);return i}var be=class{constructor(e,t){if(!Nn.has(e)||e>=I.Null)throw new TypeError("Invalid boxed primitive type");this.Type=e,this.Value=t}valueOf(){return this.Value}toString(){return String(this.Value)}},te=class extends Error{constructor(e){super(e),this.name="NrbfFormatError"}},re=class{constructor(e){let t=String(e);if(!/^-?\d+(?:\.\d+)?$/.test(t))throw new TypeError("Invalid decimal");let n=t.startsWith("-"),[s,r=""]=t.replace(/^-/,"").split(".");s=s.replace(/^0+(?=\d)/,"");let o=()=>{throw new RangeError("Decimal is outside the CLR 96-bit coefficient and 28-digit scale")};s.length>29&&o(),r.length>28&&(/^0*$/.test(r.slice(28))||o(),r=r.slice(0,28));let a=(s+r).replace(/^0+/,"")||"0";a.length>29&&(r=r.replace(/0+$/,""),a=(s+r).replace(/^0+/,"")||"0"),a.length>29&&o();let h=BigInt(a);h>0xffffffffffffffffffffffffn&&r.endsWith("0")&&(r=r.replace(/0+$/,""),h=BigInt(s+r)),h>0xffffffffffffffffffffffffn&&o(),this.Value=(n?"-":"")+s+(r?"."+r:"")}toString(){return this.Value}},oe=class{constructor(e){if(this.Data=BigInt(e),this.Data<0n||this.Data>0xffffffffffffffffn)throw new RangeError("DateTime data")}get Ticks(){return this.Data&0x3fffffffffffffffn}get Kind(){return Number(this.Data>>62n)}},O=class{constructor(e,t={},n={},s=null){if(typeof e!="string"||!e)throw new TypeError("typeName");this.TypeName=e,this.LibraryName=s,this.Members=Object.assign(Object.create(null),t),this.MemberTypes=Object.assign(Object.create(null),n)}},Y=class{constructor(e=[],t={}){if(this.Values=Array.from(e),this.Lengths=t.lengths?Array.from(t.lengths):[this.Values.length],this.LowerBounds=t.lowerBounds?Array.from(t.lowerBounds):this.Lengths.map(()=>0),this.ArrayType=t.arrayType??(this.Lengths.length>1?2:0),this.ElementType=t.elementType??{type:K.Object},this.Lengths.length<1||this.Lengths.length!==this.LowerBounds.length||this.Lengths.some(n=>!Number.isSafeInteger(n)||n<0)||this.LowerBounds.some(n=>!Number.isInteger(n))||this.Lengths.reduce((n,s)=>n*s,1)!==this.Values.length)throw new RangeError("Invalid array shape")}GetValue(...e){if(e.length!==this.Lengths.length)throw new RangeError("Array rank");let t=0;for(let n=0;n<e.length;n++){let s=e[n]-this.LowerBounds[n];if(!Number.isInteger(s)||s<0||s>=this.Lengths[n])throw new RangeError("Array index");t=t*this.Lengths[n]+s}return this.Values[t]}[Symbol.iterator](){return this.Values[Symbol.iterator]()}},Vt=class{constructor(e,t=new Map,n=new Map){this.Root=e,this.Objects=t,this.Libraries=n}},Ki=class{constructor(e){this.id=e}},At=class{constructor(e){this.count=e}},Er=class{constructor(e,t){if(e instanceof ArrayBuffer&&(e=new Uint8Array(e)),!ArrayBuffer.isView(e))throw new TypeError("Expected binary bytes");this.bytes=new Uint8Array(e.buffer,e.byteOffset,e.byteLength),this.view=new DataView(e.buffer,e.byteOffset,e.byteLength),this.pos=0,this.options=Qa({maxBytes:64*1024*1024,maxObjects:1e6,maxArrayLength:1e7,maxTotalArrayLength:1e7,maxStringBytes:16*1024*1024,maxMembers:1e5,maxDepth:256,...t}),this.bytes.length>this.options.maxBytes&&R("Byte limit exceeded"),this.objects=new Map,this.libraries=new Map,this.metadata=new Map,this.refs=[],this.depth=0,this.records=0,this.totalArrayLength=0}need(e){(!Number.isSafeInteger(e)||e<0||this.pos+e>this.bytes.length)&&R(`Truncated NRBF record at byte ${this.pos}`)}u8(){return this.need(1),this.bytes[this.pos++]}num(e,t){this.need(t);let n=this.view[e](this.pos,!0);return this.pos+=t,n}i32(){return this.num("getInt32",4)}string(){let e=0,t=0;for(let n=0;n<5;n++){let s=this.u8();if(n===4&&s>7&&R("Invalid string length"),e+=(s&127)*2**t,!(s&128)){e>this.options.maxStringBytes&&R("String limit exceeded"),this.need(e);let r;try{r=Ua.decode(this.bytes.subarray(this.pos,this.pos+e))}catch{R("Invalid UTF-8")}return this.pos+=e,r}t+=7}R("Invalid string length")}count(e,t=this.options.maxArrayLength){return(e<0||e>t)&&R("Count limit exceeded"),e}register(e,t){return(!Number.isInteger(e)||e===0||this.objects.has(e))&&R(`Duplicate or invalid object ID ${e}`),this.objects.size>=this.options.maxObjects&&R("Object limit exceeded"),this.objects.set(e,t),t}primitive(e){switch(Nn.has(e)||R(`Unknown primitive type ${e}`),e){case I.Boolean:{let t=this.u8();return t>1&&R("Invalid Boolean"),t===1}case I.Byte:return this.u8();case I.Char:{let t=this.pos,n=this.u8(),s=n<128?1:n>=194&&n<=223?2:n>=224&&n<=239?3:0;s||R("Invalid UTF-8 Char"),this.need(s-1),this.pos+=s-1;try{let r=Ua.decode(this.bytes.subarray(t,this.pos));return r.length!==1&&R("Invalid Char"),r}catch{R("Invalid UTF-8 Char")}break}case I.Decimal:{let t=this.string();try{return new re(t)}catch{R("Invalid Decimal value")}break}case I.Double:return this.num("getFloat64",8);case I.Int16:return this.num("getInt16",2);case I.Int32:return this.i32();case I.Int64:case I.TimeSpan:return this.num("getBigInt64",8);case I.SByte:return this.num("getInt8",1);case I.Single:return this.num("getFloat32",4);case I.DateTime:return new oe(this.num("getBigUint64",8));case I.UInt16:return this.num("getUint16",2);case I.UInt32:return this.num("getUint32",4);case I.UInt64:return this.num("getBigUint64",8);case I.Null:return null;case I.String:return this.string()}}type(e){if((e<0||e>7)&&R(`Unknown binary type ${e}`),e===K.Primitive||e===K.PrimitiveArray){let t=this.u8();return(!Nn.has(t)||t>=I.Null)&&R("Invalid primitive metadata"),{type:e,primitive:t}}if(e===K.SystemClass)return{type:e,name:this.string()};if(e===K.Class){let t=this.string(),n=this.i32();return this.libraries.has(n)||R("Unknown library reference"),{type:e,name:t,library:this.libraries.get(n)}}return{type:e}}value(){for(;;){let e=this.record();if(e!==void 0)return e}}record(){++this.records>this.options.maxObjects*8&&R("Record limit exceeded"),++this.depth>this.options.maxDepth&&R("Nesting limit exceeded");try{let e=this.u8();switch(e){case 1:{let t=this.i32(),n=this.i32(),s=this.metadata.get(n);return s||R("Unknown class metadata reference"),this.classValue(t,s)}case 2:case 3:case 4:case 5:{let t=this.i32(),n=this.string(),s=this.count(this.i32(),this.options.maxMembers),r=[];for(let l=0;l<s;l++)r.push(this.string());new Set(r).size!==r.length&&R("Duplicate member names");let o;if(e>=4)o=Array.from({length:s},()=>this.u8()).map(d=>this.type(d));else{let l=this.options.resolveMemberTypes;l||R("Untyped class metadata requires resolveMemberTypes"),o=l(n,r),(!Array.isArray(o)||o.length!==s)&&R("Invalid resolved member metadata")}let a=null;if(e===3||e===5){let l=this.i32();this.libraries.has(l)||R("Unknown class library"),a=this.libraries.get(l)}let h={name:n,names:r,types:o,library:a};return this.metadata.set(t,h),this.classValue(t,h)}case 6:{let t=this.i32();return this.register(t,this.string())}case 7:{let t=this.i32(),n=this.u8();n>5&&R("Invalid BinaryArray type");let s=this.count(this.i32(),32);(s<1||n%3!==2&&s!==1)&&R("Invalid BinaryArray rank");let r=Array.from({length:s},()=>this.count(this.i32())),o=1;for(let l of r)o*=l,this.count(o);let a=n>=3?Array.from({length:s},()=>this.i32()):r.map(()=>0),h=this.type(this.u8());return this.arrayValue(t,o,{lengths:r,lowerBounds:a,arrayType:n,elementType:h})}case 8:{let t=this.u8();return t>=I.Null&&R("Invalid boxed primitive type"),new be(t,this.primitive(t))}case 9:{let t=new Ki(this.i32());return this.refs.push(t),t}case 10:return null;case 12:{let t=this.i32(),n=this.string();(t<=0||this.libraries.has(t))&&R("Duplicate or invalid library ID"),this.libraries.set(t,n);return}case 13:return new At(this.count(this.u8()));case 14:return new At(this.count(this.i32()));case 15:{let t=this.i32(),n=this.count(this.i32()),s=this.u8();return(!Nn.has(s)||s>=I.Null)&&R("Invalid array primitive"),this.arrayValue(t,n,{elementType:{type:K.Primitive,primitive:s}})}case 16:case 17:{let t=this.i32(),n=this.count(this.i32());return this.arrayValue(t,n,{elementType:{type:e===16?K.Object:K.String}})}case 21:case 22:R("Remoting method invocation records are not object graph data");default:R(`Unexpected record type ${e} at byte ${this.pos-1}`)}}finally{this.depth--}}classValue(e,t){let n=this.register(e,new O(t.name,{},Object.fromEntries(t.names.map((s,r)=>[s,t.types[r]])),t.library));n.IsValueType=e<0;for(let s=0;s<t.names.length;s++){let r=t.types[s].type===K.Primitive?this.primitive(t.types[s].primitive):this.value();r instanceof At&&R("Null run outside an array"),n.Members[t.names[s]]=r}return n}arrayValue(e,t,n){t>this.options.maxTotalArrayLength-this.totalArrayLength&&R("Total array length limit exceeded"),this.totalArrayLength+=t;let s=this.register(e,Object.create(Y.prototype));for(s.Values=[],s.Lengths=n.lengths??[t],s.LowerBounds=n.lowerBounds??[0],s.ArrayType=n.arrayType??0,s.ElementType=n.elementType;s.Values.length<t;){let r=s.ElementType.type===K.Primitive?this.primitive(s.ElementType.primitive):this.value();if(r instanceof At){(r.count===0||r.count>t-s.Values.length)&&R("Invalid null run length");for(let o=0;o<r.count;o++)s.Values.push(null)}else s.Values.push(r)}return s}read(){this.u8()!==0&&R("Missing SerializationHeaderRecord");let e=this.i32();for(this.i32(),(this.i32()!==1||this.i32()!==0)&&R("Unsupported NRBF version");this.pos<this.bytes.length&&this.bytes[this.pos]!==11;)this.record()instanceof At&&R("Null run outside an array");this.u8()!==11&&R("Missing MessageEnd"),this.pos!==this.bytes.length&&!this.options.allowTrailingBytes&&R("Trailing bytes after MessageEnd"),this.objects.has(e)||R("Root object not found");for(let t of this.refs)this.objects.has(t.id)||R(`Unresolved object reference ${t.id}`);for(let t of this.objects.values()){let n=t instanceof O?t.Members:t instanceof Y?t.Values:null;if(n)for(let s of Object.keys(n))n[s]instanceof Ki&&(n[s]=this.objects.get(n[s].id))}return new Vt(this.objects.get(e),this.objects,this.libraries)}};function Cr(i,e={}){return new Er(i,e).read()}var Sr=class{constructor(e={}){this.bytes=new Uint8Array(1024),this.pos=0,this.objects=new Map,this.libraries=new Map,this.metadata=new Map,this.pending=[],this.options=Qa({maxBytes:64*1024*1024,maxDepth:256,...e}),this.depth=0,this.nextId=1}need(e){if(this.pos+e>this.options.maxBytes)throw new RangeError("NRBF output byte limit exceeded");if(this.pos+e>this.bytes.length){let t=new Uint8Array(Math.max(this.pos+e,this.bytes.length*2));t.set(this.bytes),this.bytes=t}}u8(e){this.need(1),this.bytes[this.pos++]=e}num(e,t,n){this.need(t),new DataView(this.bytes.buffer)[e](this.pos,n,!0),this.pos+=t}i32(e){this.num("setInt32",4,e)}string(e){let t=Wa.encode(String(e)),n=t.length;for(;n>=128;)this.u8(n&127|128),n>>>=7;this.u8(n),this.need(t.length),this.bytes.set(t,this.pos),this.pos+=t.length}primitive(e,t){switch(e){case I.Boolean:if(typeof t!="boolean")throw new TypeError("Boolean primitive");this.u8(t?1:0);break;case I.Byte:this.integer("setUint8",1,t,0,255);break;case I.Char:{if(typeof t!="string"||t.length!==1||/^[\uD800-\uDFFF]$/.test(t))throw new TypeError("Char primitive");let n=Wa.encode(t);this.need(n.length),this.bytes.set(n,this.pos),this.pos+=n.length;break}case I.Decimal:this.string(t instanceof re?t.Value:new re(t).Value);break;case I.Double:this.num("setFloat64",8,Number(t));break;case I.Int16:this.integer("setInt16",2,t,-32768,32767);break;case I.Int32:this.integer("setInt32",4,t,-2147483648,2147483647);break;case I.Int64:case I.TimeSpan:{let n=BigInt(t);if(n<-(1n<<63n)||n>=1n<<63n)throw new RangeError("Int64 primitive");this.num("setBigInt64",8,n);break}case I.SByte:this.integer("setInt8",1,t,-128,127);break;case I.Single:this.num("setFloat32",4,Number(t));break;case I.DateTime:this.num("setBigUint64",8,t instanceof oe?t.Data:new oe(t).Data);break;case I.UInt16:this.integer("setUint16",2,t,0,65535);break;case I.UInt32:this.integer("setUint32",4,t,0,4294967295);break;case I.UInt64:{let n=BigInt(t);if(n<0n||n>=1n<<64n)throw new RangeError("UInt64 primitive");this.num("setBigUint64",8,n);break}default:throw new TypeError(`Unsupported primitive ${e}`)}}integer(e,t,n,s,r){if(!Number.isInteger(n)||n<s||n>r)throw new RangeError("Integer primitive");this.num(e,t,n)}type(e){if(e.type===K.Primitive||e.type===K.PrimitiveArray){if(!Nn.has(e.primitive)||e.primitive>=I.Null)throw new TypeError("Invalid primitive metadata");this.u8(e.primitive)}else if(e.type===K.SystemClass)this.string(e.name);else if(e.type===K.Class){if(this.string(e.name),!this.libraries.has(e.library))throw new TypeError("Unknown library");this.i32(this.libraries.get(e.library))}else if(e.type<0||e.type>7)throw new TypeError("Invalid member type")}collect(e){let t=[e],n=new Set;for(;t.length;){let s=t.pop();if(!s||typeof s!="object"||n.has(s))continue;n.add(s);let r=o=>{o&&!this.libraries.has(o)&&this.libraries.set(o,this.libraries.size+1)};if(s instanceof O){r(s.LibraryName);for(let o of Object.values(s.MemberTypes))r(o.library);for(let o of Object.values(s.Members))t.push(o)}else if(s instanceof Y){r(s.ElementType.library);for(let o of s.Values)t.push(o)}else if(Array.isArray(s))for(let o of s)t.push(o);else if(!(s instanceof be)&&!(s instanceof re)&&!(s instanceof oe)&&!ArrayBuffer.isView(s))throw new TypeError("Unregistered object: encode an NrbfClass or register a CLR schema")}}value(e,t=!1){if(++this.depth>this.options.maxDepth)throw new RangeError("NRBF output nesting limit exceeded");try{if(e instanceof be){this.u8(8),this.u8(e.Type),this.primitive(e.Type,e.Value);return}if(e==null){this.u8(10);return}if(typeof e=="number"||typeof e=="boolean"||typeof e=="bigint"||e instanceof re||e instanceof oe){let d=_r(e);this.u8(8),this.u8(d),this.primitive(d,e);return}if(this.objects.has(e)&&!t){this.u8(9),this.i32(this.objects.get(e));return}let n=this.objects.get(e);if(n===void 0&&(n=this.nextId++,e instanceof O&&e.IsValueType&&this.depth>1&&(n=-n),this.objects.set(e,n)),!t&&typeof e!="string"&&!(e instanceof O&&e.IsValueType)){this.pending.push(e),this.u8(9),this.i32(n);return}if(typeof e=="string"){this.u8(6),this.i32(n),this.string(e);return}if(e instanceof O){let d=Object.keys(e.Members),u=d.map(x=>e.MemberTypes[x]??Lh(e.Members[x])),p=JSON.stringify([e.TypeName,e.LibraryName,d,u]);if(this.metadata.has(p))this.u8(1),this.i32(n),this.i32(this.metadata.get(p));else{this.metadata.set(p,n),this.u8(e.LibraryName?5:4),this.i32(n),this.string(e.TypeName),this.i32(d.length);for(let x of d)this.string(x);for(let x of u)this.u8(x.type);for(let x of u)this.type(x);e.LibraryName&&this.i32(this.libraries.get(e.LibraryName))}for(let x=0;x<d.length;x++)u[x].type===K.Primitive?this.primitive(u[x].primitive,e.Members[d[x]]):this.value(e.Members[d[x]]);return}let s=e;if(ArrayBuffer.isView(e)?s=Oh(e):Array.isArray(e)&&(s=new Y(e)),!(s instanceof Y))throw new TypeError("Unsupported NRBF value");let{Values:r,ElementType:o,Lengths:a,LowerBounds:h}=s,l=a.length===1&&h[0]===0&&s.ArrayType===0;if(l&&[K.Primitive,K.Object,K.String].includes(o.type))this.u8(o.type===K.Primitive?15:o.type===K.Object?16:17),this.i32(n),this.i32(r.length),o.type===K.Primitive&&this.u8(o.primitive);else{this.u8(7),this.i32(n);let d=h.some(u=>u!==0)?s.ArrayType%3+3:s.ArrayType;this.u8(d),this.i32(a.length);for(let u of a)this.i32(u);if(d>=3)for(let u of h)this.i32(u);this.u8(o.type),this.type(o)}for(let d=0;d<r.length;d++)if(o.type===K.Primitive)this.primitive(o.primitive,r[d]);else if(r[d]==null){let u=d+1;for(;l&&u<r.length&&r[u]==null;)u++;let p=u-d;p===1?this.u8(10):p<=255?(this.u8(13),this.u8(p)):(this.u8(14),this.i32(p)),d=u-1}else this.value(r[d])}finally{this.depth--}}write(e){if(e instanceof Vt&&(e=e.Root),e==null)throw new TypeError("NRBF root cannot be null");if(e instanceof be?e=br(e.Type,e.Value):e instanceof re?e=br(I.Decimal,e):e instanceof oe&&(e=br(I.DateTime,e)),["number","boolean","bigint"].includes(typeof e)){let t=_r(e),n=Object.keys(I).find(s=>I[s]===t);e=new O("System."+n,{m_value:e},{m_value:{type:K.Primitive,primitive:t}})}this.collect(e),this.u8(0),this.i32(1),this.i32(-1),this.i32(1),this.i32(0);for(let[t,n]of this.libraries)this.u8(12),this.i32(n),this.string(t);this.value(e,!0);for(let t=0;t<this.pending.length;t++)this.value(this.pending[t],!0);return this.u8(11),this.bytes.slice(0,this.pos)}};function br(i,e){let t=s=>({type:K.Primitive,primitive:s});if(i===I.Decimal){let s=e instanceof re?e:new re(e),r=s.Value.startsWith("-"),[o,a=""]=s.Value.replace(/^-/,"").split("."),h=BigInt(o+a),l={flags:(r?2147483648:0)|a.length<<16|0,hi:Number(h>>64n)|0,lo:Number(h&0xffffffffn)|0,mid:Number(h>>32n&0xffffffffn)|0};return new O("System.Decimal",l,Object.fromEntries(Object.keys(l).map(d=>[d,t(I.Int32)])))}if(i===I.DateTime){let s=e instanceof oe?e:new oe(e);return new O("System.DateTime",{ticks:s.Ticks,dateData:s.Data},{ticks:t(I.Int64),dateData:t(I.UInt64)})}if(i===I.TimeSpan)return new O("System.TimeSpan",{_ticks:BigInt(e)},{_ticks:t(I.Int64)});let n=Object.keys(I).find(s=>I[s]===i);if(!n||i>=I.Null)throw new TypeError("Invalid root primitive");return new O("System."+n,{m_value:e},{m_value:t(i)})}function _r(i){return typeof i=="boolean"?I.Boolean:typeof i=="bigint"?i<0n?I.Int64:i>(1n<<63n)-1n?I.UInt64:I.Int64:i instanceof re?I.Decimal:i instanceof oe?I.DateTime:Number.isInteger(i)&&i>=-2147483648&&i<=2147483647?I.Int32:I.Double}function Lh(i){return typeof i=="number"||typeof i=="boolean"||typeof i=="bigint"||i instanceof re||i instanceof oe?{type:K.Primitive,primitive:_r(i)}:typeof i=="string"?{type:K.String}:{type:K.Object}}function Oh(i){let t={Int8Array:I.SByte,Uint8Array:I.Byte,Uint8ClampedArray:I.Byte,Int16Array:I.Int16,Uint16Array:I.UInt16,Int32Array:I.Int32,Uint32Array:I.UInt32,Float32Array:I.Single,Float64Array:I.Double,BigInt64Array:I.Int64,BigUint64Array:I.UInt64}[i.constructor.name];if(!t)throw new TypeError("Unsupported typed array");return new Y(i,{elementType:{type:K.Primitive,primitive:t}})}function Tr(i,e={}){return new Sr(e).write(i)}var Ha=class{constructor(){this.Types=new Map}Register(e,t){if(typeof e!="string"||!t||typeof t.create!="function"||typeof t.populate!="function")throw new TypeError("A schema needs create and populate callbacks");return this.Types.set(e,t),this}Materialize(e,t={}){let n=e instanceof Vt?e.Root:e,s=new Map,r=[],o=h=>{if(!h||typeof h!="object"||h instanceof re||h instanceof oe||h instanceof be)return h;if(s.has(h))return s.get(h);let l,d;if(h instanceof O)if(d=this.Types.get(h.TypeName)??t.resolveType?.(h.TypeName,h.LibraryName),d)l=d.create(h);else if(t.allowUnknownTypes)l=new O(h.TypeName,{},h.MemberTypes,h.LibraryName);else throw new TypeError(`Unregistered NRBF class ${h.TypeName}`);else if(h instanceof Y)l=[];else throw new TypeError("Invalid NRBF value");if(!l||typeof l!="object")throw new TypeError("Schema create must return an object");return s.set(h,l),r.push({value:h,target:l,schema:d}),l},a=o(n);for(let h=0;h<r.length;h++){let{value:l}=r[h];for(let d of l instanceof O?Object.values(l.Members):l.Values)o(d)}for(let{value:h,target:l,schema:d}of r)if(h instanceof Y){for(let u of h.Values)l.push(o(u));Object.defineProperty(l,"NrbfShape",{value:{lengths:h.Lengths,lowerBounds:h.LowerBounds,arrayType:h.ArrayType},enumerable:!1})}else{let u=Object.fromEntries(Object.entries(h.Members).map(([p,x])=>[p,o(x)]));d?d.populate(l,u,h):Object.assign(l.Members,u)}return a}},Ka=class{constructor(e={}){this.Options=e,this.Registry=e.registry??null}Serialize(e,t){let n=this.Options.toRecord?this.Options.toRecord(e):e,s=Tr(n,this.Options);if(t===void 0)return s;if(t===null||t.CanWrite===!1)throw new TypeError("Stream must be writable");if(typeof t.Write=="function")return t.Write(s,0,s.length),s;if(typeof t.write=="function")return t.write(s),s;throw new TypeError("Stream needs Write or write")}Deserialize(e){let t=e;if(e?.CanRead===!1)throw new TypeError("Stream must be readable");typeof e?.ToArray=="function"?t=e.ToArray():typeof e?.read=="function"&&(t=e.read());let n=Cr(t,this.Options);return this.Registry?this.Registry.Materialize(n,this.Options):n.Root}};var Ee="mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",Ln="QuikGraph, Version=2.5.0.0, Culture=neutral, PublicKeyToken=46bd58b0789759cb",Xa=new Set(["QuikGraphException","VertexNotFoundException","NegativeCycleGraphException","NegativeWeightException","ParallelEdgeNotAllowedException","NegativeCapacityException","NoPathFoundException","NonStronglyConnectedGraphException","NonAcyclicGraphException"]),Ya="QuikGraph.Graphviz, Version=2.5.0.0, Culture=neutral, PublicKeyToken=46bd58b0789759cb",ne=i=>({type:kt.Primitive,primitive:i}),Yi=new Set(["AdjacencyGraph","BidirectionalGraph","UndirectedGraph","EdgeListGraph","ArrayAdjacencyGraph","ArrayBidirectionalGraph","ArrayUndirectedGraph","BidirectionalAdapterGraph","ReversedBidirectionalGraph","UndirectedBidirectionalGraph","BidirectionalMatrixGraph","CompressedSparseRowGraph","ClusteredAdjacencyGraph"]),Ar=new Set(["Edge","EquatableEdge","SEdge","SEquatableEdge","UndirectedEdge","EquatableUndirectedEdge","SUndirectedEdge","TaggedEdge","EquatableTaggedEdge","STaggedEdge","SEquatableTaggedEdge","TaggedUndirectedEdge","STaggedUndirectedEdge","TermEdge","EquatableTermEdge","SReversedEdge"]),Kt=i=>i.TypeName.split("`")[0].split(".").at(-1),eh=i=>i.TypeName.split("[[")[0],J=i=>`<${i}>k__BackingField`;function V(i,...e){for(let t of e){if(Object.hasOwn(i.Members,t))return i.Members[t];let n=J(t);for(let s of Object.keys(i.Members))if(s===n||s.endsWith("+"+n)||s.endsWith("+"+t))return i.Members[s]}}function Ue(i){if(i==null)return[];if(i instanceof Y)return i.Values;if(!(i instanceof O))throw new te("Expected CLR list");let e=V(i,"_items","_array"),t=V(i,"_size");if(!(e instanceof Y)||!Number.isInteger(t)||t<0||t>e.Values.length)throw new te("Invalid CLR list state");if(Kt(i)==="Queue"){let n=V(i,"_head");if(!Number.isInteger(n)||n<0||t>0&&n>=e.Values.length)throw new te("Invalid CLR queue head");return Array.from({length:t},(s,r)=>e.Values[(n+r)%e.Values.length])}return e.Values.slice(0,t)}function Qi(i){if(!(i instanceof O))throw new te("Expected CLR dictionary");return Ue(V(i,"KeyValuePairs")).map(e=>[V(e,"key","Key"),V(e,"value","Value")])}function Xi(i){return i instanceof O&&i.TypeName.startsWith("QuikGraph.")&&Yi.has(Kt(i))&&!eh(i).includes("+")}var lt=new WeakMap;function Rc(i){return i&&typeof i=="object"?lt.get(i):void 0}function th(i,e=new Set){if(e.has(i))return"[Cyclic inner exception]";e.add(i);let n=(i.ClrTypeName??i.name)+(i.message?": "+i.message:"");i.cause&&(n+=" ---> "+(i.cause.ClrTypeName?th(i.cause,e):String(i.cause))+`
   --- End of inner exception stack trace ---`);let s=i.ClrStackTrace;return s&&(n+=`
`+s),n}var Vr=class{constructor(e={}){this.options=e,this.memo=new Map,this.activeGraphs=new Set,this.depth=0,this.totalVertices=0,this.totalEdges=0}read(e){if(this.memo.has(e))return this.memo.get(e);if(++this.depth>(this.options.maxDepth??256))throw new te("NRBF materialization nesting limit exceeded");try{return this.readValue(e)}finally{this.depth--}}account(e,t){if(this.totalVertices+=e,this.totalEdges+=t,this.totalVertices>(this.options.maxGraphVertices??1e6)||this.totalEdges>(this.options.maxGraphEdges??1e7))throw new te("Graph allocation limit exceeded")}readValue(e){if(e instanceof be)return e.Type===D.TimeSpan?e:e.Value;if(e==null||typeof e!="object"||e instanceof oe||e instanceof re)return e;if(this.memo.has(e))return this.memo.get(e);if(e instanceof Y){let r=[];this.memo.set(e,r);for(let o of e.Values)r.push(this.read(o));return Object.defineProperty(r,"NrbfShape",{value:{lengths:e.Lengths,lowerBounds:e.LowerBounds,arrayType:e.ArrayType},enumerable:!1}),lt.set(r,e),r}if(!(e instanceof O))throw new TypeError("Invalid NRBF object");if(Xi(e))return this.graph(e);let t=Kt(e),n=eh(e),s;if(e.TypeName.startsWith("QuikGraph.")&&Ar.has(t))if(s=Object.create(Re[t].prototype),this.memo.set(e,s),t==="SReversedEdge"){let r=this.read(V(e,"OriginalEdge"));Object.defineProperties(s,{OriginalEdge:{value:r,enumerable:!0},Source:{value:r?.Target??null,enumerable:!0},Target:{value:r?.Source??null,enumerable:!0}})}else{let r=this.read(V(e,"Source")),o=this.read(V(e,"Target"));Object.defineProperties(s,{Source:{value:r,enumerable:!0},Target:{value:o,enumerable:!0}}),t.includes("Tagged")&&(s._tag=this.read(V(e,"_tag","Tag")),s.TagChanged=new L),t.includes("Term")&&Object.defineProperties(s,{SourceTerminal:{value:V(e,"SourceTerminal"),enumerable:!0},TargetTerminal:{value:V(e,"TargetTerminal"),enumerable:!0}})}else if(e.TypeName==="QuikGraph.Graphviz.Dot.GraphvizColor")s=new c(V(e,"a"),V(e,"r"),V(e,"g"),V(e,"b"));else if(e.TypeName==="QuikGraph.Graphviz.Dot.GraphvizSize")s=new ht(V(e,"w"),V(e,"h"));else if(e.TypeName==="QuikGraph.Graphviz.Dot.GraphvizSizeF")s=new ke(V(e,"w"),V(e,"h"));else if(/^(?:QuikGraph\.[\w]+Exception|System\.[\w]+Exception)$/.test(n)){let r=Re[t]??Error;s=new r(V(e,"Message")??""),this.memo.set(e,s),s.ClrTypeName=V(e,"ClassName")??e.TypeName,s.ClrStackTrace=(V(e,"RemoteStackTraceString")??"")+(V(e,"StackTraceString")??""),s.cause=this.read(V(e,"InnerException")),s.HResult=V(e,"HResult"),s.Source=V(e,"Source"),s.Data=this.read(V(e,"Data")),s.ToString=()=>th(s)}else if(/^(?:QuikGraph\.Collections\.(?:VertexList|EdgeList)|System\.Collections\.Generic\.List)`/.test(n)){let r=mn[t];s=r?new r:[],this.memo.set(e,s);for(let o of Ue(e))typeof s.Add=="function"?s.Add(this.read(o)):s.push(this.read(o))}else if(/^(?:QuikGraph\.Collections\.Queue|System\.Collections\.Generic\.Queue)`/.test(n)){s=new yt,this.memo.set(e,s);for(let r of Ue(e))s.Enqueue(this.read(r))}else if(/^(?:QuikGraph\.Collections\.(?:VertexEdgeDictionary|EdgeEdgeDictionary)|System\.Collections\.Generic\.Dictionary)`/.test(n)){let r=mn[t];s=r?new r:new y,this.memo.set(e,s);for(let[o,a]of Qi(e))s.set(this.read(o),this.read(a))}else if(n==="System.Decimal"){let r=V(e,"flags"),o=r>>>16&255,a=BigInt(V(e,"hi")>>>0)<<64n|BigInt(V(e,"mid")>>>0)<<32n|BigInt(V(e,"lo")>>>0),h=String(a).padStart(o+1,"0");return o&&(h=h.slice(0,-o)+"."+h.slice(-o)),new re((r<0?"-":"")+h)}else{if(n==="System.DateTime")return new oe(V(e,"dateData")??V(e,"ticks"));if(n==="System.TimeSpan")return new be(D.TimeSpan,V(e,"_ticks"));if(/^System\.(Boolean|Byte|SByte|Char|Int16|Int32|Int64|UInt16|UInt32|UInt64|Single|Double)$/.test(n))return V(e,"m_value");{let r=this.options.registry?.Types?.get(e.TypeName)??this.options.resolveType?.(e.TypeName,e.LibraryName);if(r){if(s=r.create(e),!s||typeof s!="object")throw new TypeError("Registered create must return an object");this.memo.set(e,s);let o=Object.fromEntries(Object.entries(e.Members).map(([a,h])=>[a,this.read(h)]));r.populate(s,o,e)}else if(this.options.allowUnknownTypes){s=new O(e.TypeName,{},e.MemberTypes,e.LibraryName),this.memo.set(e,s);for(let[o,a]of Object.entries(e.Members))s.Members[o]=this.read(a)}else throw new TypeError(`Register an explicit schema for CLR type ${e.TypeName}`)}}return this.memo.set(e,s),lt.set(s,e),s}graph(e){this.activeGraphs.add(e);try{return this.graphValue(e)}finally{this.activeGraphs.delete(e)}}graphValue(e){let t=Kt(e),n=V(e,"AllowParallelEdges")??!0,s=Object.create(Re[t].prototype);this.memo.set(e,s);let r;if(t==="ClusteredAdjacencyGraph"){let o=V(e,"Wrapped");if(!Xi(o)||Kt(o)!=="AdjacencyGraph"||this.activeGraphs.has(o))throw new te("Invalid clustered wrapped graph");r=new an(this.read(o)),Object.assign(s,r),s.Parent=this.read(V(e,"Parent")),s.Collapsed=V(e,"Collapsed")??!1,s._clusters=Ue(V(e,"_clusters")).map(a=>{if(!Xi(a)||Kt(a)!=="ClusteredAdjacencyGraph"||this.activeGraphs.has(a))throw new te("Cyclic or invalid cluster hierarchy");return this.read(a)}),r=s}else if(["ReversedBidirectionalGraph","UndirectedBidirectionalGraph","BidirectionalAdapterGraph"].includes(t)){let o=V(e,"OriginalGraph","_baseGraph");if(!Xi(o)||this.activeGraphs.has(o))throw new te("Cyclic or invalid wrapped graph");let a=this.read(o);r=new Re[t](a)}else{if(t==="BidirectionalMatrixGraph"){let u=V(e,"VertexCount"),p=V(e,"_edges");if(!Number.isInteger(u)||u<0||!(p instanceof Y)||p.Lengths.length!==2||p.Lengths[0]!==u||p.Lengths[1]!==u||p.Values.length!==u*u||p.LowerBounds.some(x=>x!==0))throw new te("Invalid matrix graph shape");this.account(u,0)}let o=t==="UndirectedGraph"||t==="ArrayUndirectedGraph",a=t==="BidirectionalMatrixGraph"?new sn(V(e,"VertexCount")):o?new Fe(n):new Z(n),h=[],l=[];if(t==="BidirectionalMatrixGraph"){let u=V(e,"_edges");if(!(u instanceof Y)||u.Lengths.length!==2||u.Lengths[0]!==a.VertexCount||u.Lengths[1]!==a.VertexCount)throw new te("Invalid matrix graph shape");l=u.Values.filter(p=>p!==null),this.account(0,l.length)}else if(t==="EdgeListGraph")l=Qi(V(e,"_edges")).map(u=>u[0]),this.account(0,l.length);else if(t==="CompressedSparseRowGraph"){let u=Ue(V(e,"_outEdges")),p=Qi(V(e,"_outEdgeStartRanges")),x=p.map(([b,m])=>({v:b,start:V(m,"Start"),end:V(m,"End")}));for(let b of x)if(!Number.isInteger(b.start)||!Number.isInteger(b.end)||b.start<0||b.end<b.start||b.end>u.length)throw new te("Invalid CSR offsets");let w=0;for(let b of x.filter(m=>m.start!==m.end).sort((m,E)=>m.start-E.start)){if(b.start!==w)throw new te("Overlapping or incomplete CSR offsets");w=b.end}if(w!==u.length)throw new te("Incomplete CSR offsets");this.account(x.length,u.length);for(let{v:b,start:m,end:E}of x){h.push(b);for(let f=m;f<E;f++)l.push(new Pe(this.read(b),this.read(u[f])))}}else{let u=Qi(V(e,"_vertexEdges","_vertexOutEdges","AdjacentEdges","VertexEdges"));if(h=u.map(p=>p[0]),this.account(h.length,0),o)l=Ue(V(e,"Edges","_edges")),this.account(0,l.length);else for(let[,p]of u){let x=Ue(t==="ArrayBidirectionalGraph"?V(p,"OutEdges"):p);this.account(0,x.length);for(let w of x)l.push(w)}}if(t==="EdgeListGraph"){r=new en(V(e,"IsDirected")??!0,n);for(let u of l)r.AddEdge(this.read(u))}else{for(let u of h)a.AddVertex(this.read(u));for(let u of l){let p=u instanceof Q?u:this.read(u);if(!a.ContainsVertex(p.Source)||!a.ContainsVertex(p.Target))throw new te("Graph edge references an absent vertex");a.AddEdge(p)}a.EdgeCapacity=V(e,"EdgeCapacity")??0,r=["ArrayAdjacencyGraph","ArrayBidirectionalGraph","ArrayUndirectedGraph","CompressedSparseRowGraph"].includes(t)?new Re[t](a):t==="AdjacencyGraph"?Object.assign(new he(n),a):a}let d=V(e,"EdgeCount");if(d!==void 0&&r.EdgeCount!==d)throw new te("Graph edge count does not match its records")}return Object.assign(s,r),lt.set(s,e),s}};function nh(i,e={}){let t=i instanceof Vt?i.Root:i instanceof O||i instanceof Y?i:Cr(i,e).Root;return new Vr(e).read(t)}function Dc(i,e={}){let t=nh(i,e);if(!t||!Yi.has(t.constructor.name))throw new TypeError("NRBF root is not a supported QuikGraph graph");return t}var j=(i,e=Ee)=>({name:i,library:e}),Bh=i=>`${i.name}, ${i.library}`;function X(i,e,t=Ln){return j(i+"[["+e.map(Bh).join("],[")+"]]",t)}function le(i){return typeof i=="string"?j(i,i.startsWith("QuikGraph.")?Ln:Ee):i}function ae(i){if(i instanceof O)return j(i.TypeName,i.LibraryName??Ee);if(i instanceof Y){let e=i.ElementType;return j((e.name??"System.Object")+"[]",e.library??Ee)}if(typeof i=="string")return j("System.String");if(typeof i=="boolean")return j("System.Boolean");if(typeof i=="bigint")return j(i>=0n&&i>=1n<<63n?"System.UInt64":"System.Int64");if(typeof i=="number")return j(Number.isInteger(i)&&i>=-2147483648&&i<=2147483647?"System.Int32":"System.Double");if(i instanceof re)return j("System.Decimal");if(i instanceof oe)return j("System.DateTime");throw new TypeError("Cannot infer a CLR type; provide a registered record schema")}function Ir(i){let e=i.indexOf("[[");if(e<0)return[];let t=i.slice(e+2,-2),n=[],s=0,r=0;for(let o=0;o<t.length;o++)t[o]==="["?s++:t[o]==="]"&&(s===0&&t.slice(o,o+3)==="],["?(n.push(t.slice(r,o)),r=o+3,o+=2):s--);return n.push(t.slice(r)),n.map(o=>{let a=0;for(let h=0;h<o.length;h++)if(o[h]==="[")a++;else if(o[h]==="]")a--;else if(o[h]===","&&a===0)return j(o.slice(0,h),o.slice(h+1).trim());return j(o)})}function Gt(i){let e=i.name.replace(/^System\./,"");return D[e]&&D[e]<D.Null?ne(D[e]):i.name==="System.String"?{type:kt.String}:i.name==="System.Object"?{type:kt.Object}:i.library===Ee?{type:kt.SystemClass,name:i.name}:{type:kt.Class,name:i.name,library:i.library}}function pe(i,e,t={}){let n=new O(i.name,e,t,i.library===Ee?null:i.library);return n.IsValueType=/^(?:System.Collections.Generic.KeyValuePair`|QuikGraph.CompressedSparseRowGraph`1\+Range|QuikGraph.Graphviz.Dot.Graphviz(?:Color|Size)|QuikGraph.S(?:Edge|EquatableEdge|UndirectedEdge|TaggedEdge|EquatableTaggedEdge|TaggedUndirectedEdge|ReversedEdge)`)/.test(i.name),n}function Mn(i,e){return new Y(i,{elementType:Gt(e)})}function Za(i){return j(i.name+"[]",i.library)}var kr=class{constructor(e={}){this.options=e,this.memo=new Map,this.depth=0}value(e){if(this.memo.has(e))return this.memo.get(e);if(++this.depth>(this.options.maxDepth??256))throw new te("NRBF serialization nesting limit exceeded");try{return this.writeValue(e)}finally{this.depth--}}writeValue(e){if(e==null||typeof e!="object"||e instanceof re||e instanceof oe||e instanceof be)return e;if(this.memo.has(e))return this.memo.get(e);if(e instanceof O||e instanceof Y)return e;if(Yi.has(e.constructor?.name))return this.graph(e);if(Ar.has(e.constructor?.name))return this.edge(e);if(e instanceof Error)return this.exception(e);if(e instanceof et||e instanceof vt||e instanceof yt||e instanceof pn||e instanceof gn||e instanceof y)return this.collection(e);if(e instanceof c)return pe(j("QuikGraph.Graphviz.Dot.GraphvizColor",Ya),{a:e.A,r:e.R,g:e.G,b:e.B},{a:ne(D.Byte),r:ne(D.Byte),g:ne(D.Byte),b:ne(D.Byte)});if(e instanceof ht||e instanceof ke)return pe(j("QuikGraph.Graphviz.Dot."+e.constructor.name,Ya),{w:e.Width,h:e.Height},{w:ne(e.constructor===ke?D.Single:D.Int32),h:ne(e.constructor===ke?D.Single:D.Int32)});let t=lt.get(e);if(!t&&this.options.registry){for(let[n,s]of this.options.registry.Types)if(s.matches?.(e)){if(typeof s.serialize!="function")throw new TypeError("Registered fresh values need a serialize callback");let r=new O(n,{},s.memberTypes??{},s.library??null);this.memo.set(e,r);let o=s.serialize(e,a=>this.value(a),r);if(!(o instanceof O))throw new TypeError("Registered serialize must return NrbfClass");return Object.assign(r,o),r}}if(t instanceof O&&t.TypeName.startsWith("System.Collections.Generic.List`")){let n=Ir(t.TypeName)[0],s=pe(j(t.TypeName,t.LibraryName??Ee),{});return this.memo.set(e,s),Object.assign(s,this.list(Array.from(e,r=>this.value(r)),n,j(t.TypeName,t.LibraryName??Ee))),s}if(t instanceof Y){let n=new Y([]);return this.memo.set(e,n),n.Values=Array.from(e,(s,r)=>t.Values[r]instanceof be?new be(t.Values[r].Type,s instanceof be?s.Value:s):this.value(s)),n.ElementType=t.ElementType,n.Lengths=t.Lengths,n.LowerBounds=t.LowerBounds,n.ArrayType=t.ArrayType,n}if(t instanceof O){let n=this.options.registry?.Types?.get(t.TypeName)??this.options.resolveType?.(t.TypeName,t.LibraryName);if(n?.serialize){let r=n.serialize(e,o=>this.value(o),t);return this.memo.set(e,r),r}let s=new O(t.TypeName,{},t.MemberTypes,t.LibraryName);this.memo.set(e,s);for(let[r,o]of Object.entries(t.Members)){let a=r.match(/<([^>]+)>k__BackingField$/)?.[1]??r;s.Members[r]=Object.hasOwn(e,a)?this.value(e[a]):o}return s}if(typeof this.options.toRecord=="function"){let n=this.options.toRecord(e,s=>this.value(s),s=>{if(!(s instanceof O))throw new TypeError("Reserve an NrbfClass");return this.memo.set(e,s),s});if(!(n instanceof O))throw new TypeError("toRecord must return NrbfClass");return this.memo.set(e,n),n}if(Array.isArray(e)||ArrayBuffer.isView(e)){let n=new Y;return this.memo.set(e,n),n.Values=Array.from(e,s=>this.value(s)),n.Lengths=[n.Values.length],n}throw new TypeError("Custom data requires toRecord or a registered CLR schema")}collection(e){let t=lt.get(e),n=e.constructor.name,s=t?j(t.TypeName,t.LibraryName??Ee):null,r=t?Ir(t.TypeName):[],o=s?pe(s,{}):new O("pending");this.memo.set(e,o);let a;if(e instanceof yt||e instanceof vt||e instanceof et){let h=Array.from(e,d=>this.value(d)),l=r.at(-1)??le(this.options.valueType??(n==="EdgeList"?this.options.edgeType??(h.length?ae(h[0]):X("QuikGraph.Edge`1",[le(this.options.vertexType??j("System.Int32"))])):h.length?ae(h[0]):j("System.Int32")));if(n==="EdgeList"&&!s){let d=le(this.options.vertexType??(e.length?ae(this.value(e[0].Source)):j("System.Int32")));a=this.list(h,l,X("QuikGraph.Collections.EdgeList`2",[d,l]))}else if(n==="Queue"){let d=s??X("QuikGraph.Collections.Queue`1",[l]),u=Mn(h,l);a=pe(d,{"Queue`1+_array":u,"Queue`1+_head":0,"Queue`1+_tail":0,"Queue`1+_size":h.length,"Queue`1+_version":h.length},{"Queue`1+_head":ne(D.Int32),"Queue`1+_tail":ne(D.Int32),"Queue`1+_size":ne(D.Int32),"Queue`1+_version":ne(D.Int32)})}else a=this.list(h,l,s??X("QuikGraph.Collections.VertexList`1",[l]))}else{let h=r[1]??this.options.edgeType;if(n==="VertexEdgeDictionary"&&!h)for(let d of e.values()){let u=Array.from(d)[0];if(u){h=ae(this.value(u));break}}let l=Array.from(e,([d,u])=>{if(n==="VertexEdgeDictionary"&&u instanceof et&&u.length===0&&h){let p=r[0]??le(this.options.vertexType??ae(this.value(d)));return[this.value(d),this.list([],le(h),X("QuikGraph.Collections.EdgeList`2",[p,le(h)]))]}return[this.value(d),this.value(u)]});if(n==="VertexEdgeDictionary"){let d=r[0]??le(this.options.vertexType??(l.length?ae(l[0][0]):j("System.Int32"))),u=r[1]??le(h??(l.length&&Ue(l[0][1]).length?ae(Ue(l[0][1])[0]):X("QuikGraph.Edge`1",[d])));a=this.dictionary(l,d,X("QuikGraph.Collections.IEdgeList`2",[d,u]),s??X("QuikGraph.Collections.VertexEdgeDictionary`2",[d,u]))}else if(n==="EdgeEdgeDictionary"){let d=r[1]??(l.length?ae(l[0][0]):le(this.options.edgeType??X("QuikGraph.Edge`1",[j("System.Int32")]))),u=r[0]??le(this.options.vertexType??(e.size?ae(this.value(e.keys().next().value.Source)):j("System.Int32")));a=this.dictionary(l,d,d,s??X("QuikGraph.Collections.EdgeEdgeDictionary`2",[u,d]))}else{let d=r[0]??le(this.options.keyType??(l.length?ae(l[0][0]):j("System.Int32"))),u=r[1]??le(this.options.valueType??(l.length?ae(l[0][1]):j("System.Int32")));a=this.dictionary(l,d,u,s??void 0)}}return Object.assign(o,a),o}edge(e,t,n){let s=e.constructor.name;if(s==="SReversedEdge"){let w=this.value(e.OriginalEdge),b=t??this.options.vertexType??ae(this.value(e.Source)),m=X("QuikGraph.SReversedEdge`2",[le(b),ae(w)]),E=pe(m,{[J("OriginalEdge")]:w});return this.memo.set(e,E),E}let r=this.value(e.Source),o=this.value(e.Target),a=le(t??this.options.vertexType??ae(r)),h=[a];s.includes("Tagged")&&h.push(le(n??this.options.tagType??ae(this.value(e.Tag))));let l=X("QuikGraph."+s+"`"+h.length,h),d="";["EquatableEdge","TaggedEdge","TaggedUndirectedEdge"].includes(s)&&(d="Edge`1+"),s==="EquatableUndirectedEdge"&&(d="UndirectedEdge`1+"),s==="EquatableTaggedEdge"&&(d="Edge`1+"),s==="TaggedUndirectedEdge"&&(d="UndirectedEdge`1+"),s==="EquatableTermEdge"&&(d="TermEdge`1+");let u={[d+J("Source")]:r,[d+J("Target")]:o},p={[d+J("Source")]:Gt(a),[d+J("Target")]:Gt(a)};s.includes("Tagged")&&(u.TagChanged=null,u._tag=this.value(e.Tag),p._tag=Gt(h[1])),s.includes("Term")&&(u[d+J("SourceTerminal")]=e.SourceTerminal,u[d+J("TargetTerminal")]=e.TargetTerminal,p[d+J("SourceTerminal")]=ne(D.Int32),p[d+J("TargetTerminal")]=ne(D.Int32));let x=pe(l,u,p);return this.memo.set(e,x),x}list(e,t,n=X("System.Collections.Generic.List`1",[t],Ee)){let s=Mn(e,t),r={_items:s,_size:e.length,_version:e.length},o={_size:ne(D.Int32),_version:ne(D.Int32)};if(n.library===Ln)for(let a of["_items","_size","_version"])r["List`1+"+a]=r[a],o[a]&&(o["List`1+"+a]=o[a]);return pe(n,r,o)}dictionary(e,t,n,s=X("System.Collections.Generic.Dictionary`2",[t,n],Ee)){let r=X("System.Collections.Generic.KeyValuePair`2",[t,n],Ee),o=e.map(([l,d])=>pe(r,{key:l,value:d},{key:Gt(t),value:Gt(n)})),a=t.name.startsWith("System.")||t.name.includes(".Equatable")||t.name.includes(".SEquatable"),h=pe(X("System.Collections.Generic."+(a?"GenericEqualityComparer":"ObjectEqualityComparer")+"`1",[t],Ee),{});return pe(s,{Version:e.length,Comparer:h,HashSize:e.length?Math.max(3,e.length*2+1):0,KeyValuePairs:Mn(o,r)},{Version:ne(D.Int32),HashSize:ne(D.Int32)})}graph(e){let t=e.constructor.name,n=Array.from(e.Vertices),s=Array.from(e.Edges),r=n.map(C=>this.value(C)),o=lt.get(e),a=o?Ir(o.TypeName):[],h=le(this.options.vertexType??(t==="BidirectionalMatrixGraph"?j("System.Int32"):a[0])??(r.length?r.every(C=>typeof C=="number")?j(r.some(C=>!Number.isInteger(C)||C<-2147483648||C>2147483647)?"System.Double":"System.Int32"):ae(r[0]):j("System.Int32")));for(let C of r)if(h.name!=="System.Object"&&!(h.name==="System.Double"&&typeof C=="number")&&ae(C).name!==h.name)throw new TypeError("All vertices must match vertexType");let l=s.filter(C=>C.constructor.name.includes("Tagged")).map(C=>C.Tag),d=l.length&&l.every(C=>typeof C=="number")?j(l.some(C=>!Number.isInteger(C)||C<-2147483648||C>2147483647)?"System.Double":"System.Int32"):void 0,u=C=>Ar.has(C.constructor?.name)?this.edge(C,h,d):this.value(C),p=le(this.options.edgeType??(t==="BidirectionalMatrixGraph"?a[0]:a[1])??(s.length?ae(u(t==="ReversedBidirectionalGraph"?s[0].OriginalEdge:s[0])):X("QuikGraph.EquatableEdge`1",[h])));!this.options.edgeType&&!a[1]&&new Set(s.map(C=>C.constructor.name)).size>1&&(p=X("QuikGraph.IEdge`1",[h]));let x=t==="CompressedSparseRowGraph"?[h]:t==="BidirectionalMatrixGraph"?[p]:[h,p],w=X("QuikGraph."+t+"`"+x.length,x),b=pe(w,{});this.memo.set(e,b);let m=b.Members,E=b.MemberTypes,f=(C,ee,ue)=>{m[C]=ee,ue&&(E[C]=ne(ue))},S=C=>this.memo.get(C)??u(C),T=s.map(S),P=C=>Mn(C.map(S),p),M=X("QuikGraph.Collections.EdgeList`2",[h,p]),H=C=>this.list(C.map(S),p,M),z=X("QuikGraph.Collections.IEdgeList`2",[h,p]),fe=C=>this.dictionary(C,h,z,X("QuikGraph.Collections.VertexEdgeDictionary`2",[h,p])),Se=()=>{f(J("AllowParallelEdges"),e.AllowParallelEdges,D.Boolean),f(J("EdgeCount"),e.EdgeCount,D.Int32)};if(["ReversedBidirectionalGraph","UndirectedBidirectionalGraph"].includes(t))f(t==="UndirectedBidirectionalGraph"?"OriginalGraph":J("OriginalGraph"),this.value(e.OriginalGraph));else if(t==="BidirectionalAdapterGraph")f("_baseGraph",this.value(e.OriginalGraph)),f("_inEdges",this.dictionary(n.map(C=>[this.value(C),H(e.InEdges(C))]),h,M));else if(t==="ClusteredAdjacencyGraph"){f(J("Parent"),e.Parent?this.value(e.Parent):null),f(J("Wrapped"),this.value(e.Wrapped)),f(J("Collapsed"),e.Collapsed,D.Boolean);let C=j("QuikGraph.IClusteredGraph",Ln);f("_clusters",this.list(e.Clusters.map(ee=>this.value(ee)),C))}else if(t==="CompressedSparseRowGraph"){let C=X("QuikGraph.CompressedSparseRowGraph`1+Range",[h]),ee=0,ue=[],Xt=[];for(let xo of n){let ms=e.OutEdges(xo);Xt.push([this.value(xo),pe(C,{Start:ee,End:ee+ms.length},{Start:ne(D.Int32),End:ne(D.Int32)})]),ee+=ms.length,ue.push(...ms.map(Sh=>this.value(Sh.Target)))}f("_outEdges",Mn(ue,h)),f("_outEdgeStartRanges",this.dictionary(Xt,h,C))}else if(t==="BidirectionalMatrixGraph"){f(J("VertexCount"),e.VertexCount,D.Int32),f(J("EdgeCount"),e.EdgeCount,D.Int32);let C=Array(e.VertexCount**2).fill(null);for(let ee of s)C[ee.Source*e.VertexCount+ee.Target]=S(ee);f("_edges",new Y(C,{lengths:[e.VertexCount,e.VertexCount],arrayType:2,elementType:Gt(p)}));for(let ee of["EdgeAdded","EdgeRemoved"])f(ee,null)}else if(t==="EdgeListGraph"){f(J("IsDirected"),e.IsDirected,D.Boolean),f(J("AllowParallelEdges"),e.AllowParallelEdges,D.Boolean),f("_edges",this.dictionary(T.map(C=>[C,C]),p,p,X("QuikGraph.Collections.EdgeEdgeDictionary`2",[h,p])));for(let C of["EdgeAdded","EdgeRemoved"])f(C,null)}else if(t==="UndirectedGraph")f("AllowParallelEdges",e.AllowParallelEdges,D.Boolean),f("EdgeCapacity",e.EdgeCapacity??0,D.Int32),f("AdjacentEdges",fe(n.map(C=>[this.value(C),H(e.AdjacentEdges(C))]))),f("Edges",this.list(T,p));else if(t==="ArrayUndirectedGraph")f("AllowParallelEdges",e.AllowParallelEdges,D.Boolean),f("VertexEdges",this.dictionary(n.map(C=>[this.value(C),P(e.AdjacentEdges(C))]),h,Za(p))),f("Edges",this.list(T,p));else if(t==="ArrayAdjacencyGraph")Se(),f("_vertexOutEdges",this.dictionary(n.map(C=>[this.value(C),P(e.OutEdges(C))]),h,Za(p)));else if(t==="ArrayBidirectionalGraph"){Se();let C=X("QuikGraph.ArrayBidirectionalGraph`2+InOutEdges",[h,p]);f("_vertexEdges",this.dictionary(n.map(ee=>[this.value(ee),pe(C,{[J("OutEdges")]:P(e.OutEdges(ee)),[J("InEdges")]:P(e.InEdges(ee))})]),h,C))}else{Se(),f(J("EdgeCapacity"),e.EdgeCapacity??0,D.Int32),f(t==="AdjacencyGraph"?"_vertexEdges":"_vertexOutEdges",fe(n.map(C=>[this.value(C),H(e.OutEdges(C))]))),t==="BidirectionalGraph"&&f("_vertexInEdges",fe(n.map(C=>[this.value(C),H(e.InEdges(C))])));for(let C of["VertexAdded","VertexRemoved","EdgeAdded","EdgeRemoved"])f(C,null)}return b}exception(e){let t=e.constructor.name==="Error"?"Exception":e.constructor.name==="TypeError"?"ArgumentException":e.constructor.name==="RangeError"?"ArgumentOutOfRangeException":e.constructor.name==="SyntaxError"?"FormatException":e.constructor.name,n=lt.get(e),s=j(n?.TypeName??(Xa.has(e.constructor.name)?"QuikGraph.":"System.")+t,n?.LibraryName??(Xa.has(e.constructor.name)?Ln:Ee)),r=pe(s,{});return this.memo.set(e,r),Object.assign(r.Members,n?.Members??{ClassName:s.name,Message:e.message,Data:null,InnerException:null,HelpURL:null,StackTraceString:null,RemoteStackTraceString:null,RemoteStackIndex:0,ExceptionMethod:null,HResult:-2146233088,Source:null,WatsonBuckets:null}),Object.assign(r.MemberTypes,n?.MemberTypes??{RemoteStackIndex:ne(D.Int32),HResult:ne(D.Int32)}),r.Members.Message=e.message,r.Members.InnerException=e.cause?this.value(e.cause):null,r}};function qh(i,e={}){return new kr(e).value(i)}function ih(i,e={}){return Tr(qh(i,e),e)}function Pc(i,e={}){if(!i||!Yi.has(i.constructor.name))throw new TypeError("Expected a supported QuikGraph graph");return ih(i,e)}var On=class{constructor(e={}){this.Options=e}Serialize(e,t){let n=ih(e,this.Options);if(t===void 0)return n;if(t?.CanWrite===!1)throw new TypeError("Stream must be writable");if(typeof t?.Write=="function")t.Write(n,0,n.length);else if(typeof t?.write=="function")t.write(n);else throw new TypeError("Stream needs Write or write");return n}Deserialize(e){if(e?.CanRead===!1)throw new TypeError("Stream must be readable");return nh(jh(e,this.Options),this.Options)}};function jh(i,e){if(typeof i?.Read=="function"){let t=e.maxBytes??67108864,n=[],s=0;for(;;){let a=new Uint8Array(Math.min(65536,t-s+1)),h=i.Read(a,0,a.length);if(!Number.isInteger(h)||h<0||h>a.length)throw new TypeError("Read must synchronously return a valid byte count");if(h===0)break;if(s+=h,s>t)throw new te("Byte limit exceeded");n.push(a.subarray(0,h))}let r=new Uint8Array(s),o=0;for(let a of n)r.set(a,o),o+=a.length;return r}return typeof i?.ToArray=="function"?i.ToArray():typeof i?.read=="function"?i.read():i}var Ja=class{constructor(e=0,t={}){if(this._maxBytes=t.maxBytes??64*1024*1024,this._closed=!1,this._position=0,typeof e=="number"){if(!Number.isInteger(e)||e<0||e>this._maxBytes)throw new RangeError("Invalid stream capacity");this._buffer=new Uint8Array(e),this._length=0}else{let n=e instanceof ArrayBuffer?new Uint8Array(e):ArrayBuffer.isView(e)?new Uint8Array(e.buffer,e.byteOffset,e.byteLength):null;if(!n||n.length>this._maxBytes)throw new RangeError("Invalid stream bytes");this._buffer=n.slice(),this._length=n.length}}get CanRead(){return!this._closed}get CanWrite(){return!this._closed}get CanSeek(){return!this._closed}get Length(){return this._check(),this._length}get Position(){return this._check(),this._position}set Position(e){if(this._check(),!Number.isSafeInteger(e)||e<0||e>this._maxBytes)throw new RangeError("Invalid stream position");this._position=e}_check(){if(this._closed)throw new G("Stream is closed")}_range(e,t,n){if(!ArrayBuffer.isView(e)||!Number.isInteger(t)||!Number.isInteger(n)||t<0||n<0||t+n>e.byteLength)throw new RangeError("Invalid stream byte range");return new Uint8Array(e.buffer,e.byteOffset,e.byteLength)}_ensure(e){if(e>this._maxBytes)throw new RangeError("Stream byte limit exceeded");if(e>this._buffer.length){let t=new Uint8Array(Math.min(this._maxBytes,Math.max(e,256,this._buffer.length*2)));t.set(this._buffer),this._buffer=t}}Read(e,t,n){this._check();let s=this._range(e,t,n),r=Math.min(n,Math.max(0,this._length-this._position));return s.set(this._buffer.subarray(this._position,this._position+r),t),this._position+=r,r}Write(e,t=0,n=e.byteLength-t){this._check();let s=this._range(e,t,n),r=this._position+n;this._ensure(r),this._position>this._length&&this._buffer.fill(0,this._length,this._position),this._buffer.set(s.subarray(t,t+n),this._position),this._position=r,this._length=Math.max(this._length,r)}Seek(e,t=0){let n=t===0||t==="Begin"?e:t===1||t==="Current"?this.Position+e:t===2||t==="End"?this.Length+e:NaN;return this.Position=n,n}SetLength(e){if(this._check(),!Number.isSafeInteger(e)||e<0)throw new RangeError("Invalid stream length");this._ensure(e),e>this._length&&this._buffer.fill(0,this._length,e),this._length=e,this._position>e&&(this._position=e)}ToArray(){return this._buffer.slice(0,this._length)}Flush(){this._check()}Dispose(){this._closed=!0}Close(){this.Dispose()}};var F=(i,e="value")=>{if(i==null)throw new TypeError(`${e} cannot be null`);return i},Fr=i=>{if(typeof i!="string"||!/^[A-Za-z_][\w.:-]*$/.test(i))throw new TypeError(`Invalid XML name: ${i}`);return i},dh=i=>i===9||i===10||i===13||i>=32&&i<=55295||i>=57344&&i<=65533||i>=65536&&i<=1114111;function Hr(i){for(let e of i)if(!dh(e.codePointAt(0)))throw new TypeError("Invalid XML character");return i}function ge(i){return Hr(String(i)).replace(/[&<>"'\r\n\t]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;","\r":"&#13;","\n":"&#10;","	":"&#9;"})[e])}function sh(i){return Hr(i.replace(/&([^;]*);|&/g,(e,t)=>{let n={amp:"&",lt:"<",gt:">",quot:'"',apos:"'"};if(Object.hasOwn(n,t))return n[t];if(/^#(?:x[0-9a-f]+|[0-9]+)$/i.test(t)){let s=t[1].toLowerCase()==="x"?parseInt(t.slice(2),16):parseInt(t.slice(1),10);if(dh(s))return String.fromCodePoint(s)}throw new SyntaxError(`Invalid XML entity ${e}`)}))}var Kr=i=>typeof i=="string"?i:i?.ReadToEnd?i.ReadToEnd():i?.documentElement?.outerHTML??i?.outerHTML??i?.textContent??String(F(i,"reader")),hs=(i,e)=>{if(i==null)return e;if(typeof i=="function")i(e);else if(typeof i.Write=="function")i.Write(e);else if(typeof i.write=="function")i.write(e);else throw new TypeError("Writer must be a callback or expose Write/write");return e},Bn=class{constructor(e,t={},n=[],s=""){this.Name=e,this.LocalName=e.split(":").at(-1),this.Attributes=t,this.Children=n,this.Text=s,this.Content=s?[s,...n]:[...n],this.NamespaceURI=""}get Value(){return this.Content.map(e=>typeof e=="string"?e:e.Value).join("")}get textContent(){return this.Value}GetAttribute(e,t){if(t===void 0)return this.Attributes[e]??"";for(let[n,s]of Object.entries(this.Attributes)){let r=n.split(":"),o=r.at(-1),a=r.length>1?this._namespaces?.[r[0]]??"":"";if(o===e&&a===t)return s}return""}getAttribute(e){return this.Attributes[e]??null}Select(e){return this.Children.filter(t=>t.LocalName===e||t.Name===e)}ReadElementContentAsString(e=this.LocalName,t=this.NamespaceURI){if(e!==this.LocalName||t!==this.NamespaceURI)throw new SyntaxError("XML element name or namespace mismatch");return this.Value}};function ls(i){if(i instanceof Bn)return i;let e=Kr(i).replace(/^\uFEFF/,"").replace(/\r\n?/g,`
`);Hr(e);let t=new Bn("#document"),n=[t],s=0,r=/<!--[^]*?-->|<\?[^]*?\?>|<!\[CDATA\[[^]*?\]\]>|<\/[A-Za-z_][\w.:-]*\s*>|<[A-Za-z_][\w.:-]*(?:\s+[A-Za-z_][\w.:-]*\s*=\s*(?:"[^"<]*"|'[^'<]*'))*\s*\/?>|[^<]+/gy;for(;s<e.length;){r.lastIndex=s;let o=r.exec(e);if(!o)throw new SyntaxError(`Malformed or unsupported XML at ${s}`);let a=o[0];s=r.lastIndex;let h=n.at(-1);if(a.startsWith("<!--")){if(a.slice(4,-3).includes("--"))throw new SyntaxError("Invalid XML comment");continue}if(!a.startsWith("<?")){if(a.startsWith("<![CDATA[")){if(n.length===1)throw new SyntaxError("CDATA outside document");h.Text+=a.slice(9,-3),h.Content.push(a.slice(9,-3));continue}if(a.startsWith("</")){if(n.length===1||n.at(-1).Name!==a.slice(2,-1).trim())throw new SyntaxError("Mismatched XML closing tag");n.pop();continue}if(a.startsWith("<")){let l=a.match(/^<([\w.:-]+)/)[1],d=Object.create(null);for(let x of a.matchAll(/([\w.:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)){if(Object.hasOwn(d,x[1]))throw new SyntaxError("Duplicate XML attribute");d[x[1]]=sh((x[2]??x[3]).replace(/[\n\t]/g," "))}let u=new Bn(l,d);u.IsEmptyElement=a.endsWith("/>"),u._namespaces={...h._namespaces};for(let[x,w]of Object.entries(d))x==="xmlns"?u._namespaces[""]=w:x.startsWith("xmlns:")&&(u._namespaces[x.slice(6)]=w);let p=l.includes(":")?l.split(":")[0]:"";if(p&&!u._namespaces[p])throw new SyntaxError("Unbound XML namespace prefix");u.NamespaceURI=u._namespaces[p]??"",h.Children.push(u),h.Content.push(u),a.endsWith("/>")||n.push(u)}else{if(a.includes("]]>"))throw new SyntaxError("Invalid XML text");if(n.length===1&&a.trim())throw new SyntaxError("Text outside document");let l=sh(a);h.Text+=l,h.Content.push(l)}}}if(n.length!==1||t.Children.length!==1)throw new SyntaxError("Expected one complete XML document");return t.Children[0]}var Zi=class{constructor(){this._parts=[],this._stack=[],this._open=!1}_close(){this._open&&(this._parts.push(">"),this._open=!1)}Write(e){this._close(),this._parts.push(String(e))}write(e){this.Write(e)}WriteStartDocument(){if(this._parts.length)throw new Error("Document already started");this._parts.push('<?xml version="1.0" encoding="utf-8"?>')}WriteStartElement(e,t){this._close(),Fr(e),this._parts.push("<"+e),this._stack.push(e),this._open=!0,t&&this.WriteAttributeString("xmlns",t)}WriteAttributeString(e,...t){if(!this._open)throw new Error("Attributes require an open start tag");Fr(e),this._parts.push(` ${e}="${ge(t.at(-1))}"`)}WriteString(e){this._close(),this._parts.push(ge(e))}WriteValue(e){this.WriteString(e)}WriteEndElement(){if(!this._stack.length)throw new Error("No XML element to close");let e=this._stack.pop();this._open?(this._parts.push("/>"),this._open=!1):this._parts.push(`</${e}>`)}WriteEndDocument(){for(;this._stack.length;)this.WriteEndElement()}Flush(){}ToString(){return this._parts.join("")}toString(){return this.ToString()}},Qr="http://graphml.graphdrawing.org/xmlns",Ji=class{constructor(){this.EmitDocumentDeclaration=!1}};function Xr(i,e,t){let n=[...i.Vertices],s=[...i.Edges],r=new y,o=new _,a=new _;n.forEach((l,d)=>{let u=String(e?e(l):d);if(o.has(u))throw new Error(`Duplicate vertex identity ${u}`);o.add(u),r.set(l,u)});let h=new y;return s.forEach((l,d)=>{let u=String(t?t(l):d);if(a.has(u))throw new Error(`Duplicate edge identity ${u}`);if(a.add(u),!r.has(l.Source)||!r.has(l.Target))throw new Error("Edge endpoint does not exist");h.set(l,u)}),{vertices:n,edges:s,ids:r,edgeIds:h}}var rh=i=>typeof i=="boolean"?"boolean":typeof i=="bigint"?"long":typeof i=="number"?"double":typeof i=="string"||Array.isArray(i)?"string":null;function Gr(i,e,t){let n=i;if(n==null){n={};for(let s of e)if(s&&typeof s=="object")for(let[r,o]of Object.entries(s)){if(r==="Source"||r==="Target"||r.startsWith("_"))continue;let a=rh(o);a&&(n[r]=a)}}return Object.entries(n).map(([s,r],o)=>{let a=typeof r=="string"?{type:r}:{...r};if(a.property=s,a.name=a.name??s,a.id=a.id??`${t}_${o}`,a.type=a.type??rh(e.find(h=>h?.[s]!=null)?.[s])??"string",a.scope=t,Object.hasOwn(a,"default")&&(a.default===null||a.type.endsWith("[]")))throw new TypeError("Null and array GraphML defaults are unsupported");if(!["boolean","int","long","float","double","string"].includes(a.type.replace(/\[\]$/,"")))throw new TypeError(`Unsupported GraphML type ${a.type}`);return a})}function es(i,e){if(e.endsWith("[]")){if(i==null)return"null";let t=Array.from(i,n=>es(n,e.slice(0,-2)));return t.length?t.join(" ")+" ":""}if(e==="boolean"){if(typeof i!="boolean")throw new TypeError("Expected boolean");return i?"true":"false"}if(e==="long"){if(typeof i=="number"&&!Number.isSafeInteger(i))throw new RangeError("Use BigInt for GraphML long outside safe integer range");let t=BigInt(i);if(t<-(1n<<63n)||t>=1n<<63n)throw new RangeError("GraphML long is outside Int64");return String(t)}if(e==="int"){if(!Number.isInteger(i)||i<-2147483648||i>2147483647)throw new RangeError("GraphML int is outside Int32");return String(i)}if(e==="double"||e==="float"){if(typeof i!="number")throw new TypeError("Expected numeric value");return Number.isNaN(i)?"NaN":i===1/0?"INF":i===-1/0?"-INF":String(i)}if(typeof i!="string")throw new TypeError("Expected string");return i}var Yr=i=>i===""?[]:(i.endsWith(" ")?i.slice(0,-1):i).split(" ");function ct(i,e){if(e.endsWith("[]"))return i==="null"?null:Yr(i).map(t=>ct(t,e.slice(0,-2)));if(e==="string")return i;if(e==="boolean"){if(i==="true"||i==="1")return!0;if(i==="false"||i==="0")return!1;throw new SyntaxError("Invalid GraphML boolean")}if(e==="long"){if(!/^[+-]?\d+$/.test(i))throw new SyntaxError("Invalid GraphML long");let t=BigInt(i);if(t<-(1n<<63n)||t>=1n<<63n)throw new RangeError("GraphML long is outside Int64");return t}if(e==="int"){if(!/^[+-]?\d+$/.test(i))throw new SyntaxError("Invalid GraphML int");let t=Number(i);if(t<-2147483648||t>2147483647)throw new RangeError("GraphML int is outside Int32");return t}if(e==="float"||e==="double"){if(i==="NaN")return NaN;if(i==="INF")return 1/0;if(i==="-INF")return-1/0;if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?$/.test(i))throw new SyntaxError("Invalid GraphML number");return e==="float"?Math.fround(Number(i)):Number(i)}throw new TypeError(`Unsupported GraphML type ${e}`)}var ts=class extends Ji{constructor(e={}){super(),this.Options=e,this.EmitDocumentDeclaration=e.emitDocumentDeclaration??!1}Serialize(e,t,n,s){let r=e,o=t,a=this.Options;if(e?.Vertices!=null)o=e,r=null,a={...a,...t},n=a.vertexIdentity,s=a.edgeIdentity;else if(F(r,"writer"),n===null||s===null)throw new TypeError("Identity delegate cannot be null");F(o,"graph");let{vertices:h,edges:l,ids:d,edgeIds:u}=Xr(o,n,s),p=[...Gr(a.graphProperties??{},[o],"graph"),...Gr(a.vertexProperties,h,"node"),...Gr(a.edgeProperties,l,"edge")],x=new _;for(let m of p){if(x.has(m.id))throw new Error(`Duplicate GraphML key ${m.id}`);x.add(m.id)}let w=[];this.EmitDocumentDeclaration&&w.push('<?xml version="1.0" encoding="utf-8"?>'),w.push(`<graphml xmlns="${Qr}">`);for(let m of p){let E=`  <key id="${ge(m.id)}" for="${m.scope}" attr.name="${ge(m.name)}" attr.type="${m.type.endsWith("[]")?"string":m.type}">`;w.push(E+(Object.hasOwn(m,"default")?`<default>${ge(es(m.default,m.type))}</default>`:"")+"</key>")}let b=(m,E)=>p.filter(f=>f.scope===E).flatMap(f=>{let S=f.get?f.get(m):m?.[f.property];return S===void 0||Object.hasOwn(f,"default")&&Object.is(S,f.default)?[]:S===null&&f.type==="string"?[`<data key="${ge(f.id)}"/>`]:[`<data key="${ge(f.id)}">${ge(es(S,f.type))}</data>`]}).join("");w.push(`  <graph id="${ge(a.graphId??"G")}" edgedefault="${o.IsDirected?"directed":"undirected"}" parse.nodes="${h.length}" parse.edges="${l.length}" parse.order="nodesfirst" parse.nodeids="free" parse.edgeids="free">${b(o,"graph")}`);for(let m of h)w.push(`    <node id="${ge(d.get(m))}">${b(m,"node")}</node>`);for(let m of l)w.push(`    <edge id="${ge(u.get(m))}" source="${ge(d.get(m.Source))}" target="${ge(d.get(m.Target))}">${b(m,"edge")}</edge>`);return w.push("  </graph>","</graphml>"),hs(r,w.join(`
`))}};function zh(i,e={}){let t=Kr(i);e.allowLegacy&&(t=t.replace(/<!DOCTYPE\s+graphml\s+SYSTEM\s+(?:"[^"]*"|'[^']*')\s*>/i,""));let n=ls(t);if(n.LocalName!=="graphml"||n.NamespaceURI!==Qr&&!(e.allowLegacy&&!n.NamespaceURI))throw new SyntaxError("GraphML root/namespace not found");let s=n.Select("graph");if(s.length!==1)throw new SyntaxError("Exactly one GraphML graph is required");let r=s[0];if(r.Children.some(o=>["graph","hyperedge","port"].includes(o.LocalName))||r.Select("node").some(o=>o.Children.some(a=>["graph","port"].includes(a.LocalName))))throw new Error("Nested graphs, hyperedges and ports are not supported by QuikGraph GraphML");if(e.allowLegacy&&!r.GetAttribute("edgedefault")&&(r.Attributes.edgedefault="directed"),!["directed","undirected"].includes(r.GetAttribute("edgedefault")))throw new SyntaxError("Invalid edgedefault");for(let o of[n,r,...r.Children])if(o.NamespaceURI!==n.NamespaceURI)throw new SyntaxError("Inconsistent GraphML namespace");for(let o of r.Children)if(!["node","edge","data","desc"].includes(o.LocalName))throw new SyntaxError("Unknown GraphML graph element");return{root:n,graph:r}}var qn=class extends Ji{constructor(e={}){super(),this.Options=e}Deserialize(e,t,n=(r,o)=>Object.keys(o).length?{Id:r,...o}:r,s=(r,o,a,h)=>Object.assign(new Q(r,o),h)){let{root:r,graph:o}=zh(e,this.Options),a=o.GetAttribute("edgedefault")==="directed";if(t=t??(a?new he:new Fe),F(n,"vertexFactory"),F(s,"edgeFactory"),t.IsDirected!==a)throw new Error("Graph direction does not match GraphML");let h=new y;for(let m of r.Select("key")){let E=m.GetAttribute("id");if(!E||h.has(E))throw new SyntaxError("Missing or duplicate GraphML key id");let f=m.GetAttribute("for")||"all",S=m.GetAttribute("attr.name"),T=m.GetAttribute("attr.type")||"string";if(!["all","graph","node","edge"].includes(f)||!S||!["boolean","int","long","float","double","string"].includes(T))throw new SyntaxError("Invalid GraphML key declaration");let P=this.Options[f==="node"?"vertexProperties":f==="edge"?"edgeProperties":"graphProperties"],M=Object.entries(P??{}).find(([Se,C])=>(typeof C=="object"?C.name??Se:Se)===S),H=M?typeof M[1]=="string"?{type:M[1]}:M[1]:{},z={scope:f,name:S,property:M?.[0]??S,type:H.type??T,set:H.set},fe=m.Select("default");if(fe.length>1)throw new SyntaxError("Duplicate GraphML default");fe.length&&(z.default=ct(fe[0].Value,z.type)),h.set(E,z)}let l=(m,E)=>{let f=Object.create(null),S=new _;for(let T of h.values())(T.scope===E||T.scope==="all")&&Object.hasOwn(T,"default")&&(f[T.property]=T.default);for(let T of m.Select("data")){let P=T.GetAttribute("key"),M=h.get(P);if(!M||M.scope!==E&&M.scope!=="all")throw new SyntaxError("Unknown or wrongly scoped GraphML key");if(S.has(P))throw new SyntaxError("Duplicate GraphML data key");S.add(P),f[M.property]=T.IsEmptyElement&&M.type==="string"?null:ct(T.Value,M.type)}return f},d=(m,E,f)=>{if(!(m===null||typeof m!="object"))for(let[S,T]of Object.entries(E)){let P=[...h.values()].find(M=>(M.scope===f||M.scope==="all")&&M.property===S);if(P?.set)P.set(m,T);else if(["__proto__","constructor","prototype"].includes(S))Object.defineProperty(m,S,{value:T,writable:!0,enumerable:!0,configurable:!0});else if(!Reflect.set(m,S,T))throw new TypeError(`Property ${S} is not writable`)}},u=new y,p=[],x=[],w=new _;for(let m of o.Select("node")){let E=m.GetAttribute("id");if(!E||u.has(E))throw new SyntaxError("Missing or duplicate node id");let f=l(m,"node"),S=F(n(E,f),"vertex factory result");d(S,f,"node"),u.set(E,S),p.push(S)}for(let m of o.Select("edge")){let E=u.get(m.GetAttribute("source")),f=u.get(m.GetAttribute("target"));if(E===void 0||f===void 0)throw new SyntaxError("Edge references missing node");let S=m.GetAttribute("id")||String(x.length);if(w.has(S))throw new SyntaxError("Duplicate edge id");w.add(S);let T=m.GetAttribute("directed");if(T&&ct(T,"boolean")!==a)throw new Error("Mixed directed and undirected edges are unsupported");let P=l(m,"edge"),M=F(s(E,f,S,P),"edge factory result");d(M,P,"edge"),x.push(M)}let b=l(o,"graph");d(t,b,"graph"),t.AddVertexRange(p);for(let m of x)if(!t.AddEdge(m))throw new Error("Destination graph rejected GraphML edge");return t}};function $h(i,e={},t,n){if(F(i,"graph"),F(e,"optionsOrWriter"),typeof e=="string")throw new TypeError("File paths require a host writer callback");if(t===null||n===null)throw new TypeError("Identity delegate cannot be null");return typeof e=="function"||e?.Write||e?.write?new ts().Serialize(e,i,t,n):new ts(e).Serialize(i,e)}function Wh(i,e,t,n){return arguments.length>=3&&F(i,"graph"),arguments.length>=3||i?.AddVertex?new qn().Deserialize(e,i,t,n):new qn(e).Deserialize(i,e?.graph,e?.vertexFactory,e?.edgeFactory)}function Uh(i,e,t,n,s={}){if(F(i,"graph"),t===null||n===null)throw new TypeError("Factory cannot be null");let r=Kr(e),o=s.validateSchema;if(o!=null){if(typeof o!="function")throw new TypeError("validateSchema must be a synchronous function");let a=o.call(s,r);if(a!=null&&typeof a.then=="function"){try{Promise.prototype.then.call(a,void 0,()=>{})}catch{}throw new TypeError("validateSchema returned a Promise or thenable; use DeserializeAndValidateGraphML for asynchronous validation")}if(a===!1||a?.IsValid===!1){let h=new SyntaxError("GraphML schema validation failed");throw Array.isArray(a?.Errors)&&(h.Errors=a.Errors),h}}return new qn(s).Deserialize(r,i,t,n)}var Bc=Object.freeze({SerializeToGraphML:$h,DeserializeFromGraphML:Wh,DeserializeAndValidateFromGraphML:Uh}),Rr={"graphml.dtd":`<!-- ====================================================================== -->
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

</xs:schema>`},Hh=Object.freeze({GetResource(i){if(!Object.hasOwn(Rr,i))throw new Error("GraphML schema resource not found");return new TextEncoder().encode(Rr[i])}}),oh=class{static GraphMLNamespace=Qr;constructor(e={GetEntity(){throw new Error("An external XML resolver adapter is required for unknown URIs")}}){this.BaseResolver=F(e,"baseResolver")}set Credentials(e){}GetEntity(e,t=null,n=null){let s=String(F(e,"absoluteUri").AbsoluteUri??e),r=s.split("/").at(-1);return Object.hasOwn(Rr,r)?Hh.GetResource(r):this.BaseResolver.GetEntity(e,t,n)}},ah=class{constructor(e=null,t=null){this.Source=e,this.Target=t}},ns=class{constructor(e){this.Graph=F(e)}Add(e){return this.Graph.AddVertex(F(e))}[Symbol.iterator](){return this.Graph.Vertices[Symbol.iterator]()}GetEnumerator(){return this[Symbol.iterator]()}},is=class{constructor(e){this.Graph=F(e)}Add(e){return this.Graph.AddVerticesAndEdge(F(e))}[Symbol.iterator](){return this.Graph.Edges[Symbol.iterator]()}GetEnumerator(){return this[Symbol.iterator]()}},jn=class{constructor(e=new he){this.Graph=F(e,"graph"),this.Vertices=new ns(e),this.Edges=new is(e)}};jn.XmlVertexList=ns;jn.XmlEdgeList=is;function Kh(i,e=void 0,t,n,s="graph",r="node",o="edge",a="",h,l,d){if(F(i,"graph"),i instanceof jn)return Qh(i,e);if(e===null)throw new TypeError("writer cannot be null");if(t===null||n===null)throw new TypeError("Identity delegate cannot be null");for(let x of[s,r,o])Fr(x);let u=Xr(i,t,n),p=new Zi;p.WriteStartElement(s,F(a)),h&&h(p,i);for(let x of u.vertices)p.WriteStartElement(r),p.WriteAttributeString("id",u.ids.get(x)),l&&l(p,x),p.WriteEndElement();for(let x of u.edges)p.WriteStartElement(o),p.WriteAttributeString("id",u.edgeIds.get(x)),p.WriteAttributeString("source",u.ids.get(x.Source)),p.WriteAttributeString("target",u.ids.get(x.Target)),d&&d(p,x),p.WriteEndElement();return p.WriteEndElement(),hs(e,p.ToString())}function Qh(i,e,t={}){if(F(i,"graph"),e===null)throw new TypeError("writer cannot be null");let n=new Zi,s=new _;t.emitDocumentDeclaration!==!1&&n.WriteStartDocument(),n.WriteStartElement("graph"),n.WriteAttributeString("xmlns:xsi","http://www.w3.org/2001/XMLSchema-instance");let r=(o,a)=>{if(n.WriteStartElement(o),a==null)n.WriteAttributeString("xsi:nil","true");else if(typeof a=="object"&&!(a instanceof Date)){if(s.has(a))throw new TypeError("XML object graphs cannot contain cycles");if(s.add(a),Array.isArray(a))for(let h of a)r("item",h);else for(let[h,l]of Object.entries(a))!h.startsWith("_")&&typeof l!="function"&&r(h,l);s.delete(a)}else n.WriteString(a instanceof Date?a.toISOString():String(a));n.WriteEndElement()};n.WriteStartElement("vertices");for(let o of i.Vertices)r("vertex",o);n.WriteEndElement(),n.WriteStartElement("edges");for(let o of i.Edges)r("edge",o);return n.WriteEndElement(),n.WriteEndElement(),hs(e,n.ToString())}function Dr(i){let e=[],t=[i];for(;t.length;){let n=t.pop();e.push(n),t.push(...n.Children.slice().reverse())}return e}function hh(i,e,t=!1){if(F(e,"XPath"),!e)throw new TypeError("XPath cannot be empty");if(/[\[\]()@|]/.test(e))throw new TypeError("Complex XPath expressions require a host XPath adapter; use predicate callbacks");let n=e.startsWith("//"),s=e.replace(/^\.?\/+/,"").split("/").filter(Boolean);if(!s.length)return[i];let r=(a,h)=>h==="*"||a.Name===h||a.LocalName===h,o;n?o=Dr(i).filter(a=>r(a,s.shift())):t||e.startsWith("/")?o=r(i,s.shift())?[i]:[]:o=[i];for(let a of s)a!=="."&&(o=o.flatMap(h=>h.Children.filter(l=>r(l,a))));return o}function Xh(i,e=a=>a.LocalName==="graph",t=a=>a.LocalName==="node",n=a=>a.LocalName==="edge",s=()=>new he,r=a=>a.GetAttribute("id"),o){if(arguments.length>=8){let p=F(s,"namespaceUri");s=r,r=o,o=arguments[7];for(let w of[e,t,n])if(F(w,"XML selector"),w==="")throw new TypeError("XML selector cannot be empty");let x=w=>b=>b.LocalName===w&&b.NamespaceURI===p;e=x(e),t=x(t),n=x(n)}if(o===null)throw new TypeError("edgeFactory cannot be null");let a=ls(i);for(let p of[e,t,n,s,r])F(p,"XML selector or factory");let h=typeof e=="function"?Dr(a).find(e):hh(a,e,!0)[0];if(!h)throw new Error("Graph XML element not found");let l=p=>typeof p=="function"?Dr(h).slice(1).filter(p):hh(h,p),d=F(s(h),"graph factory result"),u=new y;for(let p of l(t)){let x=F(r(p),"vertex factory result");u.set(p.GetAttribute("id"),x),d.AddVertex(x)}for(let p of l(n)){let x=o?o(p):new Q(F(u.get(p.GetAttribute("source")),"source vertex"),F(u.get(p.GetAttribute("target")),"target vertex"));d.AddEdge(F(x,"edge factory result"))}return d}function Yh(i,e,t=new On){if(F(i,"graph"),F(e,"stream"),e.CanWrite===!1)throw new TypeError("Stream must be writable");if(typeof t?.Serialize!="function")throw new TypeError("Binary adapter must implement Serialize");return t.Serialize(i,e)}function Zh(i,e=new On){if(F(i,"stream"),i.CanRead===!1)throw new TypeError("Stream must be readable");if(typeof e?.Deserialize!="function")throw new TypeError("Binary adapter must implement Deserialize");return e.Deserialize(i)}var qc=Object.freeze({SerializeToXml:Kh,DeserializeFromXml:Xh,SerializeToBinary:Yh,DeserializeFromBinary:Zh}),Jh=(i,e)=>{let t=e===null?null:Array.from(e,s=>typeof s=="boolean"?s?"True":"False":String(s)),n=t===null?"null":t.length?t.join(" ")+" ":"";return i?i.WriteString(n):n},lh=(i,e)=>{let t=typeof i=="string"?i:i.ReadElementContentAsString();return t==="null"?null:Yr(t).map(n=>e==="string"?n:ct(e==="boolean"?n.toLowerCase():n,e))},jc=Object.freeze(Object.fromEntries(["Boolean","Int32","Int64","Single","Double","String",""].map(i=>["Write"+i+"Array",Jh]))),Pr=(i,e,t)=>{if(F(i,"reader"),F(e,"localName"),F(t,"namespaceURI"),!e)throw new TypeError("localName cannot be empty");let n=typeof i=="string"?ls(i):i;return{node:n,value:n.ReadElementContentAsString(e,t)}},vr={ReadElementAsNullableString(i,e,t){let{node:n,value:s}=Pr(i,e,t);return n.IsEmptyElement?null:s},ReadElementContentAsArray(i,e,t,n=String){let{value:s}=Pr(i,e,t);return s==="null"?null:Yr(s).map(n)}};for(let[i,e]of[["Boolean","boolean"],["Int32","int"],["Int64","long"],["Single","float"],["Double","double"],["String","string"]])vr["Read"+i+"Array"]=t=>lh(t,e),vr["ReadElementContentAs"+i+"Array"]=(t,n,s)=>lh(Pr(t,n,s).value,e);var zc=Object.freeze(vr),$c=Object.freeze({Left:"Left",Center:"Center",Right:"Right"}),Wc=Object.freeze({Top:"Top",Center:"Center",Bottom:"Bottom"}),Uc=Object.freeze({Expanded:"Expanded",Collapsed:"Collapsed"}),Hc=Object.freeze({True:"True",False:"False",true:"true",false:"false"}),Kc=Object.freeze({Visible:"Visible",Hidden:"Hidden",Collapsed:"Collapsed"}),Qc=Object.freeze({Normal:"Normal",Italic:"Italic",Oblique:"Oblique"}),Xc=Object.freeze({Black:"Black",Bold:"Bold",DemiBold:"DemiBold",ExtraBlack:"ExtraBlack",ExtraBold:"ExtraBold",ExtraLight:"ExtraLight",Heavy:"Heavy",Light:"Light",Medium:"Medium",Normal:"Normal",Regular:"Regular",Semibold:"Semibold",Thin:"Thin",UltraBlack:"UltraBlack",UltraBold:"UltraBold",UltraLight:"UltraLight"}),Yc=Object.freeze({Conditional:"Conditional",Clause:"Clause",Loop:"Loop",Call:"Call"}),Zc=Object.freeze({ArrowHeadSize:"ArrowHeadSize",ArrowHeadWidth:"ArrowHeadWidth",Background:"Background",FontFamily:"FontFamily",FontSize:"FontSize",FontStyle:"FontStyle",FontWeight:"FontWeight",Foreground:"Foreground",HorizontalAlignment:"HorizontalAlignment",Icon:"Icon",Image:"Image",SelectedStroke:"SelectedStroke",ShadowDepth:"ShadowDepth",Shape:"Shape",Stroke:"Stroke",StrokeDashArray:"StrokeDashArray",StrokeThickness:"StrokeThickness",Style:"Style"}),Jc=Object.freeze({Node:"Node",Link:"Link"}),ed=Object.freeze({TopToBottom:"TopToBottom",BottomToTop:"BottomToTop",LeftToRight:"LeftToRight",RightToLeft:"RightToLeft"}),td=Object.freeze({None:"None",Sugiyama:"Sugiyama",ForceDirected:"ForceDirected",DependencyMatrix:"DependencyMatrix"}),ss=class{constructor(e={}){this.Nodes=null,this.Links=null,this.Categories=null,this.Properties=null,this.QualifiedNames=null,this.IdentifierAliases=null,this.Styles=null,this.Paths=null,this.Title=null,this.Background=null,this.BackgroundImage=null,this.GraphDirection="TopToBottom",this.GraphDirectionSpecified=!1,this.Layout="None",this.LayoutSpecified=!1,this.ButterflyMode="True",this.ButterflyModeSpecified=!1,this.NeighborhoodDistance=null,this.ZoomLevel=null,Object.assign(this,e)}WriteXml(e){return as(this,e)}},rs=class{constructor(e={}){this.Category=null,this.Id=null,this.Category1=null,this.Icon=null,this.Shape=null,this.Style=null,this.HorizontalAlignment="Left",this.HorizontalAlignmentSpecified=!1,this.VerticalAlignment="Top",this.VerticalAlignmentSpecified=!1,this.Description=null,this.Group="Expanded",this.GroupSpecified=!1,this.IsVertical="True",this.IsVerticalSpecified=!1,this.Reference=null,this.Label=null,this.Visibility="Visible",this.VisibilitySpecified=!1,this.Background=null,this.FontSize=0,this.FontSizeSpecified=!1,this.FontFamily=null,this.FontStyle="Normal",this.FontStyleSpecified=!1,this.FontWeight="Black",this.FontWeightSpecified=!1,this.Access=null,this.Assembly=null,this.FilePath=null,this.FunctionTypeFlags=null,this.IsAbstract="True",this.IsAbstractSpecified=!1,this.IsCodeType="True",this.IsCodeTypeSpecified=!1,this.IsHub="True",this.IsHubSpecified=!1,this.IsOverloaded="True",this.IsOverloadedSpecified=!1,this.IsOverridable="True",this.IsOverridableSpecified=!1,this.Language=null,this.Location=null,this.LinesOfCode=0,this.LinesOfCodeSpecified=!1,this.Namespace=null,this.MustImplement=null,this.TypeName=null,this.IsDocumentation="True",this.IsDocumentationSpecified=!1,this.CodeGenSourceName=null,this.CodeGenTargetName=null,this.CodeGenIncoming="True",this.CodeGenIncomingSpecified=!1,this.CodeSchemaProperty_CallSequenceNumber=0,this.CodeSchemaProperty_CallSequenceNumberSpecified=!1,this.CodeSchemaProperty_DisableEnabledErrorHandler="True",this.CodeSchemaProperty_DisableEnabledErrorHandlerSpecified=!1,this.CodeSchemaProperty_DisableEnabledException="True",this.CodeSchemaProperty_DisableEnabledExceptionSpecified=!1,this.CodeSchemaProperty_EndColumn=0,this.CodeSchemaProperty_EndColumnSpecified=!1,this.CodeSchemaProperty_EndLine=0,this.CodeSchemaProperty_EndLineSpecified=!1,this.CodeSchemaProperty_FrameDepth=0,this.CodeSchemaProperty_FrameDepthSpecified=!1,this.CodeSchemaProperty_FrameKind="Conditional",this.CodeSchemaProperty_FrameKindSpecified=!1,this.CodeSchemaProperty_Icon=null,this.CodeSchemaProperty_InstanceTrackingInformation=null,this.CodeSchemaProperty_IsAbstract="True",this.CodeSchemaProperty_IsAbstractSpecified=!1,this.CodeSchemaProperty_IsAnonymous="True",this.CodeSchemaProperty_IsAnonymousSpecified=!1,this.CodeSchemaProperty_IsArray="True",this.CodeSchemaProperty_IsArraySpecified=!1,this.CodeSchemaProperty_IsByReference="True",this.CodeSchemaProperty_IsByReferenceSpecified=!1,this.CodeSchemaProperty_IsCallToThis="True",this.CodeSchemaProperty_IsCallToThisSpecified=!1,this.CodeSchemaProperty_IsConstructor="True",this.CodeSchemaProperty_IsConstructorSpecified=!1,this.CodeSchemaProperty_IsDo="True",this.CodeSchemaProperty_IsDoSpecified=!1,this.CodeSchemaProperty_IsFinal="True",this.CodeSchemaProperty_IsFinalSpecified=!1,this.CodeSchemaProperty_IsFor="True",this.CodeSchemaProperty_IsForSpecified=!1,this.CodeSchemaProperty_IsForEach="True",this.CodeSchemaProperty_IsForEachSpecified=!1,this.CodeSchemaProperty_IsGeneric="True",this.CodeSchemaProperty_IsGenericSpecified=!1,this.CodeSchemaProperty_IsGenericInstance="True",this.CodeSchemaProperty_IsGenericInstanceSpecified=!1,this.CodeSchemaProperty_IsInternal="True",this.CodeSchemaProperty_IsInternalSpecified=!1,this.CodeSchemaProperty_IsHideBySignature="True",this.CodeSchemaProperty_IsHideBySignatureSpecified=!1,this.CodeSchemaProperty_IsOperator="True",this.CodeSchemaProperty_IsOperatorSpecified=!1,this.CodeSchemaProperty_IsOut="True",this.CodeSchemaProperty_IsOutSpecified=!1,this.CodeSchemaProperty_IsParameterArray="True",this.CodeSchemaProperty_IsParameterArraySpecified=!1,this.CodeSchemaProperty_IsPrivate="True",this.CodeSchemaProperty_IsPrivateSpecified=!1,this.CodeSchemaProperty_IsProtected="True",this.CodeSchemaProperty_IsProtectedSpecified=!1,this.CodeSchemaProperty_IsProtectedOrInternal="True",this.CodeSchemaProperty_IsProtectedOrInternalSpecified=!1,this.CodeSchemaProperty_IsPropertyGet="True",this.CodeSchemaProperty_IsPropertyGetSpecified=!1,this.CodeSchemaProperty_IsPropertySet="True",this.CodeSchemaProperty_IsPropertySetSpecified=!1,this.CodeSchemaProperty_IsPrototype="True",this.CodeSchemaProperty_IsPrototypeSpecified=!1,this.CodeSchemaProperty_IsPublic="True",this.CodeSchemaProperty_IsPublicSpecified=!1,this.CodeSchemaProperty_IsSpecialName="True",this.CodeSchemaProperty_IsSpecialNameSpecified=!1,this.CodeSchemaProperty_IsStatic="True",this.CodeSchemaProperty_IsStaticSpecified=!1,this.CodeSchemaProperty_IsUntilLoop="True",this.CodeSchemaProperty_IsUntilLoopSpecified=!1,this.CodeSchemaProperty_IsVirtual="True",this.CodeSchemaProperty_IsVirtualSpecified=!1,this.CodeSchemaProperty_IsWhile="True",this.CodeSchemaProperty_IsWhileSpecified=!1,this.CodeSchemaProperty_PreserveData="True",this.CodeSchemaProperty_PreserveDataSpecified=!1,this.CodeSchemaProperty_SingleInstanceSourceLink="True",this.CodeSchemaProperty_SingleInstanceSourceLinkSpecified=!1,this.CodeSchemaProperty_SingleInstanceTargetLink="True",this.CodeSchemaProperty_SingleInstanceTargetLinkSpecified=!1,this.CodeSchemaProperty_SourceText=null,this.CodeSchemaProperty_StartColumn=0,this.CodeSchemaProperty_StartColumnSpecified=!1,this.CodeSchemaProperty_StartLine=0,this.CodeSchemaProperty_StartLineSpecified=!1,this.CodeSchemaProperty_StatementKind=null,this.CodeSchemaProperty_StatementNumber=0,this.CodeSchemaProperty_StatementNumberSpecified=!1,this.CodeSchemaProperty_StatementType=null,Object.assign(this,e)}},Nr=class{constructor(e={}){this.Ref=null,Object.assign(this,e)}},os=class{constructor(e={}){this.Category=null,this.Label=null,this.Visibility="Visible",this.VisibilitySpecified=!1,this.Background=null,this.FontSize=0,this.FontSizeSpecified=!1,this.FontFamily=null,this.FontStyle="Normal",this.FontStyleSpecified=!1,this.FontWeight="Black",this.FontWeightSpecified=!1,this.Source=null,this.Target=null,this.Category1=null,this.Stroke=null,this.StrokeDashArray=null,this.Seeder="True",this.SeederSpecified=!1,this.AttractConsumers="True",this.AttractConsumersSpecified=!1,Object.assign(this,e)}},Mr=class{constructor(e={}){this.Ref=null,Object.assign(this,e)}},Lr=class{constructor(e={}){this.Id=null,this.BasedOn=null,this.Label=null,this.Visibility="Visible",this.VisibilitySpecified=!1,this.Background=null,this.FontSize=0,this.FontSizeSpecified=!1,this.FontFamily=null,this.FontStyle="Normal",this.FontStyleSpecified=!1,this.FontWeight="Black",this.FontWeightSpecified=!1,this.Icon=null,this.Shape=null,this.Style=null,this.HorizontalAlignment="Left",this.HorizontalAlignmentSpecified=!1,this.VerticalAlignment="Top",this.VerticalAlignmentSpecified=!1,this.Stroke=null,this.StrokeDashArray=null,this.CanLinkedNodesBeDataDriven=null,this.CanBeDataDriven=null,this.DefaultAction=null,this.IncomingActionLabel=null,this.IsProviderRoot="True",this.IsProviderRootSpecified=!1,this.IsContainment="True",this.IsContainmentSpecified=!1,this.IsTag="True",this.IsTagSpecified=!1,this.NavigationActionLabel=null,this.OutgoingActionLabel=null,this.SourceCategory=null,this.TargetCategory=null,this.Details=null,this.InboundName=null,this.OutboundName=null,Object.assign(this,e)}},Or=class{constructor(e={}){this.Id=null,this.IsReference="True",this.IsReferenceSpecified=!1,this.Label=null,this.DataType=null,this.Description=null,this.Group=null,this.ReferenceTemplate=null,Object.assign(this,e)}},Br=class{constructor(e={}){this.Id=null,this.Label=null,this.ValueType=null,this.Formatter=null,Object.assign(this,e)}},qr=class{constructor(e={}){this.n=0,this.Uri=null,this.Id=null,Object.assign(this,e)}},jr=class{constructor(e={}){this.Condition=null,this.Setter=null,this.TargetType="Node",this.IsEnabled="True",this.IsEnabledSpecified=!1,this.GroupLabel=null,this.ValueLabel=null,this.ToolTip=null,Object.assign(this,e)}},zr=class{constructor(e={}){this.Expression=null,Object.assign(this,e)}},$r=class{constructor(e={}){this.Property="ArrowHeadSize",this.Value=null,this.Expression=null,Object.assign(this,e)}},Wr=class{constructor(e={}){this.Id=null,this.Value=null,Object.assign(this,e)}},uh={DirectedGraph:{Nodes:{type:"DirectedGraphNode[]",kind:"array",tag:"Node"},Links:{type:"DirectedGraphLink[]",kind:"array",tag:"Link"},Categories:{type:"DirectedGraphCategory[]",kind:"array",tag:"Category"},Properties:{type:"DirectedGraphProperty[]",kind:"array",tag:"Property"},QualifiedNames:{type:"DirectedGraphName[]",kind:"array",tag:"Name"},IdentifierAliases:{type:"DirectedGraphAlias[]",kind:"array",tag:"Alias"},Styles:{type:"DirectedGraphStyle[]",kind:"array",tag:"Style"},Paths:{type:"DirectedGraphPath[]",kind:"array",tag:"Path"},Title:{type:"string",kind:"attribute"},Background:{type:"string",kind:"attribute"},BackgroundImage:{type:"string",kind:"attribute"},GraphDirection:{type:"GraphDirectionEnum",kind:"attribute"},GraphDirectionSpecified:{type:"bool",kind:"ignore"},Layout:{type:"LayoutEnum",kind:"attribute"},LayoutSpecified:{type:"bool",kind:"ignore"},ButterflyMode:{type:"ClrBoolean",kind:"attribute"},ButterflyModeSpecified:{type:"bool",kind:"ignore"},NeighborhoodDistance:{type:"string",kind:"attribute"},ZoomLevel:{type:"string",kind:"attribute"}},DirectedGraphNode:{Category:{type:"DirectedGraphNodeCategory[]",kind:"elements",tag:"Category"},Id:{type:"string",kind:"attribute"},Category1:{type:"string",kind:"attribute",name:"Category"},Icon:{type:"string",kind:"attribute"},Shape:{type:"string",kind:"attribute"},Style:{type:"string",kind:"attribute"},HorizontalAlignment:{type:"HorizontalAlignmentEnum",kind:"attribute"},HorizontalAlignmentSpecified:{type:"bool",kind:"ignore"},VerticalAlignment:{type:"VerticalAlignmentEnum",kind:"attribute"},VerticalAlignmentSpecified:{type:"bool",kind:"ignore"},Description:{type:"string",kind:"attribute"},Group:{type:"GroupEnum",kind:"attribute"},GroupSpecified:{type:"bool",kind:"ignore"},IsVertical:{type:"ClrBoolean",kind:"attribute"},IsVerticalSpecified:{type:"bool",kind:"ignore"},Reference:{type:"string",kind:"attribute"},Label:{type:"string",kind:"attribute"},Visibility:{type:"VisibilityEnum",kind:"attribute"},VisibilitySpecified:{type:"bool",kind:"ignore"},Background:{type:"string",kind:"attribute"},FontSize:{type:"double",kind:"attribute"},FontSizeSpecified:{type:"bool",kind:"ignore"},FontFamily:{type:"string",kind:"attribute"},FontStyle:{type:"FontStyleEnum",kind:"attribute"},FontStyleSpecified:{type:"bool",kind:"ignore"},FontWeight:{type:"FontWeightEnum",kind:"attribute"},FontWeightSpecified:{type:"bool",kind:"ignore"},Access:{type:"string",kind:"attribute"},Assembly:{type:"string",kind:"attribute"},FilePath:{type:"string",kind:"attribute"},FunctionTypeFlags:{type:"string",kind:"attribute"},IsAbstract:{type:"ClrBoolean",kind:"attribute"},IsAbstractSpecified:{type:"bool",kind:"ignore"},IsCodeType:{type:"ClrBoolean",kind:"attribute"},IsCodeTypeSpecified:{type:"bool",kind:"ignore"},IsHub:{type:"ClrBoolean",kind:"attribute"},IsHubSpecified:{type:"bool",kind:"ignore"},IsOverloaded:{type:"ClrBoolean",kind:"attribute"},IsOverloadedSpecified:{type:"bool",kind:"ignore"},IsOverridable:{type:"ClrBoolean",kind:"attribute"},IsOverridableSpecified:{type:"bool",kind:"ignore"},Language:{type:"string",kind:"attribute"},Location:{type:"string",kind:"attribute"},LinesOfCode:{type:"int",kind:"attribute"},LinesOfCodeSpecified:{type:"bool",kind:"ignore"},Namespace:{type:"string",kind:"attribute"},MustImplement:{type:"string",kind:"attribute"},TypeName:{type:"string",kind:"attribute"},IsDocumentation:{type:"ClrBoolean",kind:"attribute"},IsDocumentationSpecified:{type:"bool",kind:"ignore"},CodeGenSourceName:{type:"string",kind:"attribute"},CodeGenTargetName:{type:"string",kind:"attribute"},CodeGenIncoming:{type:"ClrBoolean",kind:"attribute"},CodeGenIncomingSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_CallSequenceNumber:{type:"int",kind:"attribute"},CodeSchemaProperty_CallSequenceNumberSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_DisableEnabledErrorHandler:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_DisableEnabledErrorHandlerSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_DisableEnabledException:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_DisableEnabledExceptionSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_EndColumn:{type:"int",kind:"attribute"},CodeSchemaProperty_EndColumnSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_EndLine:{type:"int",kind:"attribute"},CodeSchemaProperty_EndLineSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_FrameDepth:{type:"int",kind:"attribute"},CodeSchemaProperty_FrameDepthSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_FrameKind:{type:"FrameKindEnum",kind:"attribute"},CodeSchemaProperty_FrameKindSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_Icon:{type:"string",kind:"attribute"},CodeSchemaProperty_InstanceTrackingInformation:{type:"string",kind:"attribute"},CodeSchemaProperty_IsAbstract:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsAbstractSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsAnonymous:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsAnonymousSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsArray:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsArraySpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsByReference:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsByReferenceSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsCallToThis:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsCallToThisSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsConstructor:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsConstructorSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsDo:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsDoSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsFinal:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsFinalSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsFor:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsForSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsForEach:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsForEachSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsGeneric:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsGenericSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsGenericInstance:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsGenericInstanceSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsInternal:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsInternalSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsHideBySignature:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsHideBySignatureSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsOperator:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsOperatorSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsOut:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsOutSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsParameterArray:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsParameterArraySpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsPrivate:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsPrivateSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsProtected:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsProtectedSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsProtectedOrInternal:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsProtectedOrInternalSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsPropertyGet:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsPropertyGetSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsPropertySet:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsPropertySetSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsPrototype:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsPrototypeSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsPublic:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsPublicSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsSpecialName:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsSpecialNameSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsStatic:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsStaticSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsUntilLoop:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsUntilLoopSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsVirtual:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsVirtualSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_IsWhile:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_IsWhileSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_PreserveData:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_PreserveDataSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_SingleInstanceSourceLink:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_SingleInstanceSourceLinkSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_SingleInstanceTargetLink:{type:"ClrBoolean",kind:"attribute"},CodeSchemaProperty_SingleInstanceTargetLinkSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_SourceText:{type:"string",kind:"attribute"},CodeSchemaProperty_StartColumn:{type:"int",kind:"attribute"},CodeSchemaProperty_StartColumnSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_StartLine:{type:"int",kind:"attribute"},CodeSchemaProperty_StartLineSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_StatementKind:{type:"string",kind:"attribute"},CodeSchemaProperty_StatementNumber:{type:"int",kind:"attribute"},CodeSchemaProperty_StatementNumberSpecified:{type:"bool",kind:"ignore"},CodeSchemaProperty_StatementType:{type:"string",kind:"attribute"}},DirectedGraphNodeCategory:{Ref:{type:"string",kind:"attribute"}},DirectedGraphLink:{Category:{type:"DirectedGraphLinkCategory[]",kind:"elements",tag:"Category"},Label:{type:"string",kind:"attribute"},Visibility:{type:"VisibilityEnum",kind:"attribute"},VisibilitySpecified:{type:"bool",kind:"ignore"},Background:{type:"string",kind:"attribute"},FontSize:{type:"double",kind:"attribute"},FontSizeSpecified:{type:"bool",kind:"ignore"},FontFamily:{type:"string",kind:"attribute"},FontStyle:{type:"FontStyleEnum",kind:"attribute"},FontStyleSpecified:{type:"bool",kind:"ignore"},FontWeight:{type:"FontWeightEnum",kind:"attribute"},FontWeightSpecified:{type:"bool",kind:"ignore"},Source:{type:"string",kind:"attribute"},Target:{type:"string",kind:"attribute"},Category1:{type:"string",kind:"attribute",name:"Category"},Stroke:{type:"string",kind:"attribute"},StrokeDashArray:{type:"string",kind:"attribute"},Seeder:{type:"ClrBoolean",kind:"attribute"},SeederSpecified:{type:"bool",kind:"ignore"},AttractConsumers:{type:"ClrBoolean",kind:"attribute"},AttractConsumersSpecified:{type:"bool",kind:"ignore"}},DirectedGraphLinkCategory:{Ref:{type:"string",kind:"attribute"}},DirectedGraphCategory:{Id:{type:"string",kind:"attribute"},BasedOn:{type:"string",kind:"attribute"},Label:{type:"string",kind:"attribute"},Visibility:{type:"VisibilityEnum",kind:"attribute"},VisibilitySpecified:{type:"bool",kind:"ignore"},Background:{type:"string",kind:"attribute"},FontSize:{type:"double",kind:"attribute"},FontSizeSpecified:{type:"bool",kind:"ignore"},FontFamily:{type:"string",kind:"attribute"},FontStyle:{type:"FontStyleEnum",kind:"attribute"},FontStyleSpecified:{type:"bool",kind:"ignore"},FontWeight:{type:"FontWeightEnum",kind:"attribute"},FontWeightSpecified:{type:"bool",kind:"ignore"},Icon:{type:"string",kind:"attribute"},Shape:{type:"string",kind:"attribute"},Style:{type:"string",kind:"attribute"},HorizontalAlignment:{type:"HorizontalAlignmentEnum",kind:"attribute"},HorizontalAlignmentSpecified:{type:"bool",kind:"ignore"},VerticalAlignment:{type:"VerticalAlignmentEnum",kind:"attribute"},VerticalAlignmentSpecified:{type:"bool",kind:"ignore"},Stroke:{type:"string",kind:"attribute"},StrokeDashArray:{type:"string",kind:"attribute"},CanLinkedNodesBeDataDriven:{type:"string",kind:"attribute"},CanBeDataDriven:{type:"string",kind:"attribute"},DefaultAction:{type:"string",kind:"attribute"},IncomingActionLabel:{type:"string",kind:"attribute"},IsProviderRoot:{type:"ClrBoolean",kind:"attribute"},IsProviderRootSpecified:{type:"bool",kind:"ignore"},IsContainment:{type:"ClrBoolean",kind:"attribute"},IsContainmentSpecified:{type:"bool",kind:"ignore"},IsTag:{type:"ClrBoolean",kind:"attribute"},IsTagSpecified:{type:"bool",kind:"ignore"},NavigationActionLabel:{type:"string",kind:"attribute"},OutgoingActionLabel:{type:"string",kind:"attribute"},SourceCategory:{type:"string",kind:"attribute"},TargetCategory:{type:"string",kind:"attribute"},Details:{type:"string",kind:"attribute"},InboundName:{type:"string",kind:"attribute"},OutboundName:{type:"string",kind:"attribute"}},DirectedGraphProperty:{Id:{type:"string",kind:"attribute"},IsReference:{type:"ClrBoolean",kind:"attribute"},IsReferenceSpecified:{type:"bool",kind:"ignore"},Label:{type:"string",kind:"attribute"},DataType:{type:"string",kind:"attribute"},Description:{type:"string",kind:"attribute"},Group:{type:"string",kind:"attribute"},ReferenceTemplate:{type:"string",kind:"attribute"}},DirectedGraphName:{Id:{type:"string",kind:"attribute"},Label:{type:"string",kind:"attribute"},ValueType:{type:"string",kind:"attribute"},Formatter:{type:"string",kind:"attribute"}},DirectedGraphAlias:{n:{type:"byte",kind:"attribute"},Uri:{type:"string",kind:"attribute"},Id:{type:"string",kind:"attribute"}},DirectedGraphStyle:{Condition:{type:"DirectedGraphStyleCondition",kind:"element"},Setter:{type:"DirectedGraphStyleSetter[]",kind:"elements",tag:"Setter"},TargetType:{type:"TargetTypeEnum",kind:"attribute"},IsEnabled:{type:"ClrBoolean",kind:"attribute"},IsEnabledSpecified:{type:"bool",kind:"ignore"},GroupLabel:{type:"string",kind:"attribute"},ValueLabel:{type:"string",kind:"attribute"},ToolTip:{type:"string",kind:"attribute"}},DirectedGraphStyleCondition:{Expression:{type:"string",kind:"attribute"}},DirectedGraphStyleSetter:{Property:{type:"PropertyType",kind:"attribute"},Value:{type:"string",kind:"attribute"},Expression:{type:"string",kind:"attribute"}},DirectedGraphPath:{Id:{type:"string",kind:"attribute"},Value:{type:"string",kind:"attribute"}}},ch={DirectedGraph:ss,DirectedGraphNode:rs,DirectedGraphNodeCategory:Nr,DirectedGraphLink:os,DirectedGraphLinkCategory:Mr,DirectedGraphCategory:Lr,DirectedGraphProperty:Or,DirectedGraphName:Br,DirectedGraphAlias:qr,DirectedGraphStyle:jr,DirectedGraphStyleCondition:zr,DirectedGraphStyleSetter:$r,DirectedGraphPath:Wr};function el(i,e){if(["double","float","int"].includes(e))return es(i,e);if(e==="byte"){if(!Number.isInteger(i)||i<0||i>255)throw new RangeError("Expected byte");return String(i)}return String(i)}function tl(i,e){if(["double","float","int"].includes(e))return ct(i,e);if(e==="byte"){let t=ct(i,"int");if(t<0||t>255)throw new RangeError("Expected byte");return t}return i}function as(i,e){if(F(i,"graph"),e===null)throw new TypeError("writer cannot be null");let t=(n,s,r)=>{let o=uh[r]??{},a=[],h=[];for(let[l,d]of Object.entries(o)){let u=n[l];if(u!=null&&["array","elements"].includes(d.kind)&&(typeof u=="string"||typeof u[Symbol.iterator]!="function"))throw new TypeError(`DGML ${l} must be an iterable of schema objects`);u==null||d.kind==="ignore"||Object.hasOwn(o,l+"Specified")&&!n[l+"Specified"]||(d.kind==="attribute"?a.push(` ${d.name??l}="${ge(el(u,d.type))}"`):d.kind==="array"?h.push(`<${l}>${Array.from(u,p=>t(p,d.tag,d.type.replace("[]",""))).join("")}</${l}>`):d.kind==="elements"?h.push(...Array.from(u,p=>t(p,d.tag,d.type.replace("[]","")))):typeof u=="object"?h.push(t(u,l,d.type)):h.push(`<${l}>${ge(u)}</${l}>`))}return`<${s}${s==="DirectedGraph"?' xmlns="http://schemas.microsoft.com/vs/2009/dgml"':""}${a.join("")}>${h.join("")}</${s}>`};return hs(e,t(i,"DirectedGraph","DirectedGraph"))}function nl(i){let e=ls(i);if(e.LocalName!=="DirectedGraph"||e.NamespaceURI!=="http://schemas.microsoft.com/vs/2009/dgml")throw new SyntaxError("Invalid DGML document");let t=(n,s)=>{let r=new ch[s],o=uh[s];for(let[a,h]of Object.entries(o))if(h.kind==="attribute"&&Object.hasOwn(n.Attributes,h.name??a))r[a]=tl(n.Attributes[h.name??a],h.type),Object.hasOwn(o,a+"Specified")&&(r[a+"Specified"]=!0);else if(h.kind==="array"){let l=n.Select(a)[0];l&&(r[a]=l.Select(h.tag).map(d=>t(d,h.type.replace("[]",""))))}else if(h.kind==="elements")r[a]=n.Select(h.tag).map(l=>t(l,h.type.replace("[]","")));else if(h.kind==="element"){let l=n.Select(a)[0];l&&(r[a]=ch[h.type]?t(l,h.type):l.Value)}return r};return t(e,"DirectedGraph")}var Ur=class extends B{constructor(e,t,n){super(e),this.VertexIdentity=F(t,"vertexIdentity"),this.EdgeIdentity=F(n,"edgeIdentity"),this.FormatNode=new L,this.FormatEdge=new L,this.FormatGraph=new L,this.DirectedGraph=null}InternalCompute(){let e=new ss;e.Nodes=Array.from(this.VisitedGraph.Vertices,t=>{this.ThrowIfCancellationRequested();let n=new rs({Id:String(this.VertexIdentity(t))});return this.FormatNode.emit(t,n),n}),e.Links=Array.from(this.VisitedGraph.Edges,t=>{this.ThrowIfCancellationRequested();let n=new os({Label:String(this.EdgeIdentity(t)),Source:String(this.VertexIdentity(t.Source)),Target:String(this.VertexIdentity(t.Target))});return this.FormatEdge.emit(t,n),n}),this.DirectedGraph=e,this.FormatGraph.emit(this.VisitedGraph,e)}};function ph(i,e,t,n,s){F(i,"graph");let r={};e&&typeof e=="object"?r=e:arguments.length===2?(F(e,"verticesColors"),r.vertexColors=e):(r={vertexIdentity:e,edgeIdentity:t,formatNode:n,formatEdge:s},arguments.length>=3&&(F(e,"vertexIdentity"),F(t,"edgeIdentity")));let o=Xr(i,r.vertexIdentity,r.edgeIdentity),a=new Ur(i,h=>o.ids.get(h),h=>o.edgeIds.get(h));return r.vertexColors&&a.FormatNode.add((h,l)=>{l.Background=["White","LightGray","Black"][r.vertexColors(h)]??null}),r.formatNode&&a.FormatNode.add(r.formatNode),r.formatEdge&&a.FormatEdge.add(r.formatEdge),r.formatGraph&&a.FormatGraph.add(r.formatGraph),a.Compute(),a.DirectedGraph}function il(i,e,t={}){if(typeof e!="function")throw new TypeError("OpenAsDGML requires a callback receiving (xml, filename)");let n=as(ph(i,t));return e(n,t.filename??"graph.dgml")}var nd=Object.freeze({ToDirectedGraphML:ph,WriteXml:as,OpenAsDGML:il,DirectedGraphSerializer:Object.freeze({Serialize:as,Deserialize:nl})});var dt=(i,e="value")=>{if(i==null)throw new TypeError(`${e} cannot be null`);return i},cs=class extends Array{static get[Symbol.species](){return Array}get Count(){return this.length}Add(e){this.push(e)}AddRange(e){for(let t of e)this.push(t)}Clear(){this.length=0}Remove(e){let t=this.IndexOf(e);return t<0?!1:(this.splice(t,1),!0)}Contains(e){return this.IndexOf(e)>=0}IndexOf(e){return this.findIndex(t=>k(t,e))}get IsReadOnly(){return!1}Insert(e,t){if(!Number.isInteger(e)||e<0||e>this.length)throw new RangeError("Index out of range");this.splice(e,0,t)}RemoveAt(e){if(!Number.isInteger(e)||e<0||e>=this.length)throw new RangeError("Index out of range");this.splice(e,1)}CopyTo(e,t=0){if(t<0||e.length-t<this.length)throw new RangeError("Destination array is too small");for(let n=0;n<this.length;n++)e[t+n]=this[n]}},Jr=class{Evaluate(e){return dt(e,"markings")}},eo=class{IsEnabled(){return!0}},ds=class{constructor(e){this.Name=dt(e,"name"),this.Marking=new cs}ToString(){return`P(${this.Name}|${this.Marking.length})`}toString(){return this.ToString()}ToStringWithMarking(){return this.ToString()+(this.Marking.length?`
	`+this.Marking.map(e=>e?.constructor?.name??typeof e).join(`
	`):"")}},to=class{constructor(e){this.Name=dt(e,"name"),this.Condition=new eo}get Condition(){return this._condition}set Condition(e){this._condition=dt(e,"Condition")}ToString(){return`T(${this.Name})`}toString(){return this.ToString()}},no=class extends Q{constructor(e,t){dt(e),dt(t);let n=e instanceof ds||"Marking"in e,s=n?e:t,r=n?t:e;super(s,r),this.Place=s,this.Transition=r,this.IsInputArc=n,this.Annotation=new Jr}get Annotation(){return this._annotation}set Annotation(e){this._annotation=dt(e,"Annotation")}ToString(){return this.IsInputArc?`${this.Place} -> ${this.Transition}`:`${this.Transition} -> ${this.Place}`}toString(){return this.ToString()}},io=class extends Z{constructor(){super(!0)}},gh=class i{constructor(){this._places=[],this._transitions=[],this._arcs=[],this.Graph=new io}get Places(){return this._places.values()}get Transitions(){return this._transitions.values()}get Arcs(){return this._arcs.values()}AddPlace(e){let t=new ds(e);return this.Graph.AddVertex(t),this._places.push(t),t}AddTransition(e){let t=new to(e);return this.Graph.AddVertex(t),this._transitions.push(t),t}AddArc(e,t){let n=new no(e,t);if(!this._places.includes(n.Place)||!this._transitions.includes(n.Transition))throw new Error("Arc endpoints must belong to this net");return this.Graph.AddEdge(n),this._arcs.push(n),n}Clone(){let e=new i;return e._places.push(...this._places),e._transitions.push(...this._transitions),e._arcs.push(...this._arcs),e.Graph.AddVertexRange(this.Graph.Vertices),e.Graph.AddEdgeRange(this.Graph.Edges),e}ToString(){return`-----------------------------------------------
Places (${this._places.length})
`+this._places.map(e=>`	${e.ToStringWithMarking()}

`).join("")+`Transitions (${this._transitions.length})
`+this._transitions.map(e=>`	${e}

`).join("")+`Arcs
`+this._arcs.map(e=>`	${e}
`).join("")}toString(){return this.ToString()}},Zr=(i,e)=>typeof i=="function"?i(e):i.Evaluate(e),sl=(i,e)=>typeof i=="function"?i(e):i.IsEnabled(e),fh=class{constructor(e){this.Net=dt(e,"net"),this._buffers=new y}Initialize(){this._buffers.clear();for(let e of this.Net.Transitions)this._buffers.set(e,{Tokens:new cs,Enabled:!1})}SimulateStep(){let e=[...this.Net.Transitions],t=[...this.Net.Arcs];for(let n of e)if(!this._buffers.has(n))throw new Error("Initialize simulator after changing transitions");for(let n of t)n.IsInputArc&&this._buffers.get(n.Transition).Tokens.AddRange(Zr(n.Annotation,n.Place.Marking));for(let n of e){let s=this._buffers.get(n);s.Enabled=!!sl(n.Condition,s.Tokens)}for(let n of t){let s=this._buffers.get(n.Transition);if(s.Enabled)if(n.IsInputArc){let r=Zr(n.Annotation,n.Place.Marking);if(r===n.Place.Marking)n.Place.Marking.length=0;else{let o=[...r];for(let a of o){let h=n.Place.Marking.findIndex(l=>k(l,a));h>=0&&n.Place.Marking.splice(h,1)}}}else for(let r of Zr(n.Annotation,s.Tokens))n.Place.Marking.push(r)}for(let n of this._buffers.values())n.Tokens.length=0,n.Enabled=!1}};var ho=(i,e="value")=>{if(i==null)throw new TypeError(`${e} cannot be null`);return i},so=class{constructor(e){this.Relation=ho(e,"relation")}get Source(){return this.Relation.ParentTable}get Target(){return this.Relation.ChildTable}},ro=class extends Z{constructor(e){super(),this.DataSet=ho(e,"dataSet")}},oo=class extends B{constructor(e,t){super(e),this.DataSet=ho(t,"dataSet")}InternalCompute(){for(let e of this.DataSet.Tables)this.ThrowIfCancellationRequested(),this.VisitedGraph.AddVertex(e);for(let e of this.DataSet.Relations)this.ThrowIfCancellationRequested(),this.VisitedGraph.AddEdge(new so(e))}},ao=class extends Ht{constructor(e,t){super(e,t),this.CommonVertexFormat.Style=Gn.Solid,this.CommonVertexFormat.Shape=We.Record,this.FormatVertex.add((n,s)=>this.FormatTable(n,s)),this.FormatEdge.add((n,s)=>this.FormatRelation(n,s))}FormatTable(e,t){let n=t.Vertex,s=t.VertexFormat;s.Shape=We.Record,s.Record.Cells.Add(new Pn(n.TableName)),s.Record.Cells.Add(new Pn(Array.from(n.Columns??[],r=>`+ ${r.ColumnName} : ${r.DataType?.Name??r.DataType?.name??r.DataType??"Object"}${r.Unique?" unique":""}`).join(`
`)))}FormatRelation(e,t){t.EdgeFormat.Label.Value=t.Edge.Relation.RelationName}};function rl(i){let e=new ro(i);return new oo(e,i).Compute(),e}function ol(i){return new ao(i).Generate()}var dd=Object.freeze({ToGraph:rl,ToGraphviz:ol});var Le=(i,e="value")=>{if(i==null)throw new TypeError(`${e} cannot be null`);return i},lo=class{constructor(e){this.Id=String(Le(e,"id")),this.LabelText=this.Id,this.Attr={Shape:"Ellipse"},this.UserData=null}},co=class{constructor(e,t){this.Source=e,this.Target=t,this.Attr={},this.LabelText="",this.UserData=null}},uo=class{constructor(e=""){this.Id=e,this.Directed=!0,this._nodes=new y,this._edges=[],this.Attr={}}get Nodes(){return this._nodes.values()}get Edges(){return this._edges.values()}get NodeCount(){return this._nodes.size}get EdgeCount(){return this._edges.length}AddNode(e){return e=String(Le(e,"id")),this._nodes.has(e)||this._nodes.set(e,new lo(e)),this._nodes.get(e)}FindNode(e){return this._nodes.get(String(e))}AddEdge(e,t){let n=this.AddNode(e),s=this.AddNode(t),r=new co(n.Id,s.Id);return this._edges.push(r),r}Layout(e,t={}){if(!e||typeof e.Layout!="function")throw new TypeError("MSAGL layout requires an adapter implementing Layout(graph, options)");return e.Layout(this,t)}},po=class{constructor(e,t){this.Vertex=Le(e,"vertex"),this.Node=Le(t,"node")}},go=class{constructor(e,t){this.Edge=Le(e,"edge"),this.MsaglEdge=Le(t,"msaglEdge")}},us=class extends B{constructor(e,t=()=>new uo){super(e),this.GraphFactory=t,this.MsaglGraph=null,this.NodeAdded=new L,this.EdgeAdded=new L}OnNodeAdded(e){this.NodeAdded.emit(this,e)}OnEdgeAdded(e){this.EdgeAdded.emit(this,e)}InternalCompute(){this.MsaglGraph=this.GraphFactory(),this.MsaglGraph.Directed=this.VisitedGraph.IsDirected;for(let e of this.VisitedGraph.Vertices){this.ThrowIfCancellationRequested();let t=this.AddNode(e);t.UserData=e,this.OnNodeAdded(new po(e,t))}for(let e of this.VisitedGraph.Edges){this.ThrowIfCancellationRequested();let t=this.AddEdge(e);t.UserData=e,this.OnEdgeAdded(new go(e,t))}}AddNode(){throw new Error("Override AddNode in a graph populator")}AddEdge(){throw new Error("Override AddEdge in a graph populator")}},zn=class extends us{Initialize(){this._verticesIds=new y}Clean(){this._verticesIds=null}GetVertexId(){return String(this._verticesIds.size)}GetVertexLabel(e,t){return`${e}: ${t}`}AddNode(e){Le(e,"vertex");let t=String(this.GetVertexId(e));this._verticesIds.set(e,t);let n=this.MsaglGraph.AddNode(t);return n.Attr.Shape="Box",n.LabelText=this.GetVertexLabel(t,e),n}AddEdge(e){return Le(e,"edge"),this.MsaglGraph.AddEdge(this._verticesIds.get(e.Source),this._verticesIds.get(e.Target))}},ps=class extends us{constructor(e,t,n){super(e,n),this.VertexIdentity=Le(t,"vertexIdentity")}AddNode(e){return this.MsaglGraph.AddNode(this.VertexIdentity(e))}AddEdge(e){return this.MsaglGraph.AddEdge(this.VertexIdentity(e.Source),this.VertexIdentity(e.Target))}},fo=class extends zn{constructor(e,t=null,n=null,s){super(e,s),this.Format=t??"{0}",this.FormatProvider=n}FormatValue(e,t){let n=this.FormatProvider;if(typeof n=="function")return n(e,t);let s=n?.GetFormat?.("ICustomFormatter");return s?.Format?s.Format(t,e,n):String(e)}GetVertexId(e){return this.Format.replace(/\{0(?::([^}]+))?\}/g,(t,n)=>this.FormatValue(e,n))}};function al(i,e,t){return arguments.length>1&&Le(e,"formatOrIdentity"),typeof e=="function"?new ps(i,e):arguments.length>1?new fo(i,e,t):new zn(i)}function hl(i,e=null,t=null,n={}){let s=n.vertexIdentity?new ps(i,n.vertexIdentity,n.graphFactory):new zn(i,n.graphFactory);return e&&s.NodeAdded.add(e),t&&s.EdgeAdded.add(t),s.Compute(),s.MsaglGraph}var xd=Object.freeze({CreateMsaglPopulator:al,ToMsaglGraph:hl});var U=(i,e)=>{if(i==null)throw new TypeError(`${e} is required.`);return i};function mh(i){return U(i,"dictionary"),e=>{if(i instanceof globalThis.Map){if(!i.has(e))throw new Error("Key not found.");return i.get(e)}if(!Object.hasOwn(i,e))throw new Error("Key not found.");return i[e]}}function xh(i){let e=new y,t=new y,n=0;return s=>{if(U(s,"identity value"),e.has(s))return e.get(s);let r=typeof s,o=i&&["string","number","boolean","bigint"].includes(r)?r==="boolean"?s?"True":"False":String(s):void 0;if(o===void 0||t.has(o))do o=String(n++);while(t.has(o));return e.set(s,o),t.set(o,s),o}}function ll(i){U(i,"graph");let e=new _([...i.Vertices].map(n=>typeof n)),t=e.size<=1&&![...e].some(n=>!["string","number","boolean","bigint"].includes(n));return xh(t)}function cl(i){return U(i,"graph"),xh(!1)}function Qt(i,e,t=!1){U(e,"root");let n=t?new wi:new jt,s=n.Attach(i);try{i.Compute(e)}finally{(s.Dispose??s.dispose??s.unsubscribe).call(s)}let r=o=>n.TryGetPath(o);return r.algorithm=i,r.predecessors=n.VerticesPredecessors,r}function dl(i,e){return Qt(new Lt(i),e)}function ul(i,e){return Qt(new bt(i),e)}function pl(i,e,t=new Wt){let n=new Oi(i,t);n.Compute(U(e,"root"));let s=r=>{U(r,"vertex");let o=[],a=new _,h=r;for(;!v(h,e);){if(a.has(h))throw new Error("The final successor tree contains a cycle.");a.add(h);let l=n.Successors.get(h);if(!l)return;o.push(l),h=l.Target}return o.length?o:void 0};return s.algorithm=n,s.successors=n.Successors,s}function gl(i,e,t){return U(i,"graph"),Qt(i.IsDirected?new Bt(i,e):new pi(i,e),t,!i.IsDirected)}function fl(i,e,t,n){return Qt(new gi(i,e,t),n)}function ml(i,e,t){let n=Qt(new fi(i,e),t);return Object.assign(n,{hasNegativeCycle:n.algorithm.FoundNegativeCycle})}function xl(i,e,t){return Qt(new mi(i,e),t)}function yl(i,e,t,n,s=3){let r=new yi(i,e);return r.ShortestPathCount=s,r.Compute(t,n),r.ComputedShortestPaths}function wl(i){return U(i,"graph"),[...i.Vertices].filter(e=>i.OutDegree(e)===0)}function bl(i){U(i,"graph");let e=new _([...i.Edges].map(t=>t.Target));return[...i.Vertices].filter(t=>!e.has(t))}function El(i){U(i,"graph");let e=new _;for(let t of i.Edges)e.add(t.Source),e.add(t.Target);return[...i.Vertices].filter(t=>!e.has(t))}function yh(i,e,t){let n=new e(i);n.Compute();let s=[...n.SortedVertices];return t?(t.push(...s),t):s}function Sl(i,e=void 0){return U(i,"graph"),yh(i,i.IsDirected?St:_i,e)}function _l(i,e=void 0){return U(i,"graph"),yh(i,i.IsDirected?Tn:Ti,e)}function Cl(i,e=0,t=void 0){Array.isArray(e)&&(t=e,e=0);let n=new Ci(i,e);n.Compute();let s=[...n.SortedVertices];return t?(t.push(...s),t):s}function mo(i,e,t=new y){let n=new e(i,t);if(n.Compute(),n.Components!==t){t.clear();for(let s of n.Components)t.set(...s)}return n.ComponentCount}function Tl(i,e=new y){return mo(i,Sn,e)}function Il(i,e=new y){return mo(i,Cn,e)}function Al(i,e=new y){return mo(i,_n,e)}function Vl(i){let e=new Si(i);return e.Compute(),e}function kl(i,e=void 0){let t=e===void 0?new _t(i):new _t(i,e);return t.StronglyConnected=!0,t.Compute(),t.CondensedGraph}function Gl(i,e=void 0){let t=e===void 0?new _t(i):new _t(i,e);return t.StronglyConnected=!1,t.Compute(),t.CondensedGraph}function Fl(i,e=()=>!0){let t=new Gi(i,new Z,e);return t.Compute(),t.CondensedGraph}function Rl(i){U(i,"graph");let e=new y([...i.Vertices].map(t=>[t,0]));for(let t of i.Edges)e.set(t.Source,e.get(t.Source)+1),e.set(t.Target,e.get(t.Target)-1);return[...e].filter(([,t])=>t%2!==0).map(([t])=>t)}function wh(i,e){if(U(i,"graph or edges"),i.Vertices!==void 0&&i.Edges!==void 0)return i;let t=new e;return t.AddVerticesAndEdgeRange(i),t}function Dl(i){let e=wh(i,he);try{return new St(e).Compute(),!0}catch(t){if(t.name==="NonAcyclicGraphException")return!1;throw t}}function Pl(i){let e=wh(i,Fe),t=new Nt;for(let n of e.Vertices)t.MakeSet(n);for(let n of e.Edges)if(!t.Union(n.Source,n.Target))return!1;return!0}function vl(i,e,t){U(i,"predecessors"),U(e,"weights"),U(t,"vertex");let n=typeof e=="function"?e:mh(e),s=0,r=new _;for(;i.has(t);){if(r.has(t))throw new Error("Predecessors contain a cycle.");r.add(t);let o=i.get(t);s+=n(o),t=o.Source}return s}function Nl(i){U(i,"graph");let e=new Nt;for(let t of i.Vertices)e.MakeSet(t);for(let t of i.Edges)e.Union(t.Source,t.Target);return e}function bh(i,e,t){U(i,"graph"),U(e,"weights");let n=new t(i,e),s=[];return n.TreeEdge.add(r=>s.push(r)),n.Compute(),s}function Ml(i,e){return bh(i,e,Vi)}function Ll(i,e){return bh(i,e,Ai)}function Ol(i,e,t){U(t,"pairs");let n=[...t],s=new Di(i);return s.Compute(e,n),r=>s.Ancestors.get(U(r,"pair"))}function Bl(i,e,t,n,s=(o,a)=>new Q(o,a),r){if(U(t,"source"),U(n,"sink"),v(t,n))throw new Error("Source and sink must differ.");if(r===null)throw new TypeError("augmentor is required.");let o=r===void 0?new An(i,e,s):new An(i,e,s,r);return o.Compute(t,n),{value:o.MaxFlow,predecessors:a=>o.Predecessors.get(a),algorithm:o}}function ql(i){let e=new Ri(i);return e.Compute(),e.TransitiveReduction}function jl(i,e=(t,n)=>new Q(t,n)){let t=new Fi(i,e);return t.Compute(),t.TransitiveClosure}function zl(i,e,t,n){if(U(i,"graph"),U(e,"vertexCloner"),U(t,"edgeCloner"),U(n,"clone"),i===n)throw new Error("Clone destination must differ from source.");n.Clear();let s=new y;for(let r of i.Vertices){let o=e(r);n.AddVertex(o),s.set(r,o)}for(let r of i.Edges)n.AddEdge(t(r,s.get(r.Source),s.get(r.Target)));return n}var bd=Object.freeze({GetIndexer:mh,GetVertexIdentity:ll,GetEdgeIdentity:cl,TreeBreadthFirstSearch:dl,TreeDepthFirstSearch:ul,TreeCyclePoppingRandom:pl,ShortestPathsDijkstra:gl,ShortestPathsAStar:fl,ShortestPathsBellmanFord:ml,ShortestPathsDag:xl,RankedShortestPathHoffmanPavley:yl,Sinks:wl,Roots:bl,IsolatedVertices:El,TopologicalSort:Sl,SourceFirstTopologicalSort:_l,SourceFirstBidirectionalTopologicalSort:Cl,ConnectedComponents:Tl,IncrementalConnectedComponents:Vl,StronglyConnectedComponents:Il,WeaklyConnectedComponents:Al,CondensateStronglyConnected:kl,CondensateWeaklyConnected:Gl,CondensateEdges:Fl,OddVertices:Rl,IsDirectedAcyclicGraph:Dl,IsUndirectedAcyclicGraph:Pl,ComputePredecessorCost:vl,ComputeDisjointSet:Nl,MinimumSpanningTreePrim:Ml,MinimumSpanningTreeKruskal:Ll,OfflineLeastCommonAncestor:Ol,MaximumFlow:Bl,ComputeTransitiveReduction:ql,ComputeTransitiveClosure:jl,Clone:zl});var Eh=class{constructor(e){this._buffer=new Uint32Array(1)}_uint(){return globalThis.crypto.getRandomValues(this._buffer),this._buffer[0]}Next(e,t){if(arguments.length===0)return this._uint()&2147483647;if(arguments.length===1&&(t=e,e=0),!Number.isInteger(e)||!Number.isInteger(t)||e<-2147483648||t>2147483647||e>t)throw new RangeError("Expected ordered Int32 bounds.");if(e===t)return e;let n=t-e,s=4294967296-4294967296%n,r;do r=this._uint();while(r>=s);return e+r%n}NextDouble(){return this._uint()/4294967296}NextBytes(e){if(e==null)throw new TypeError("buffer is required.");let t=e instanceof Uint8Array?e:new Uint8Array(e.length);for(let n=0;n<t.length;n+=65536)globalThis.crypto.getRandomValues(t.subarray(n,n+65536));if(t!==e)for(let n=0;n<t.length;n++)e[n]=t[n]}},_d=Object.freeze({Equate(i,e,t=v,n=v){let s=(l,d)=>{if(typeof l=="function")return l;if(typeof l?.Equals=="function")return l.Equals.bind(l);throw new TypeError(`${d} is required.`)},r=s(t,"vertexEquality"),o=s(n,"edgeEquality");if(i==null)return e==null;if(e==null)return!1;if(i===e)return!0;if(i.IsDirected!==e.IsDirected||i.VertexCount!==e.VertexCount||i.EdgeCount!==e.EdgeCount)return!1;let a=[...e.Vertices];for(let l of i.Vertices){let d=a.findIndex(u=>r(l,u));if(d<0)return!1;a.splice(d,1)}let h=[...e.Edges];for(let l of i.Edges){let d=h.findIndex(u=>o(u,l));if(d<0)return!1;h.splice(d,1)}return!0}}),Cd=Object.freeze({ForEach(i,e){if(i==null||typeof e!="function")throw new TypeError("values and action are required.");for(let t of i)e(t)}}),Td=Object.freeze({Combine(...i){if(i.length<2||i.length>4)throw new RangeError("Two to four hashes expected.");let e=-2128831035;for(let t of i){if(!Number.isInteger(t)||t<-2147483648||t>2147483647)throw new RangeError("Hash values must be Int32 integers.");for(let n=0;n<32;n+=8)e=Math.imul(e,16777619)^t>>>n&255}return e}}),Id=Object.freeze({ToTryFunc(i){if(typeof i!="function")throw new TypeError("Function required.");return e=>i(e)??void 0}});var $l=globalThis.HTMLElement??class{},gs=v,ut=i=>String(i).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"})[e]),fs=class extends $l{constructor(){if(super(),this._graph=null,this.Positions=new y,this.VertexColors=new y,this.HighlightedEdges=new _,this.VertexLabel=r=>String(r),this.EdgeLabel=r=>r.Tag==null?"":String(r.Tag),this._scale=1,this._pan={x:0,y:0},this._subscriptions=[],this._frame=0,this._selected=null,this._selectedEdge=null,this._inspectionMode="vertices",this._inspectionIndex=0,this._inspectionQuery="",this._inspectionDirty=!0,this._revision=0,this._layoutGeneration=0,this._pathCache=new WeakMap,!this.attachShadow)return;let e=this.attachShadow({mode:"open"});e.innerHTML='<style>:host{display:block;min-height:240px;position:relative;contain:content;background:var(--graph-bg,#f8fafc);color:var(--graph-text,#334155);border-radius:inherit}canvas{display:block;width:100%;height:100%;min-height:240px;outline:none;touch-action:none}canvas:focus-visible{outline:2px solid #0f8b8d;outline-offset:-3px}.hint{position:absolute;bottom:12px;left:16px;font:11px system-ui;opacity:.65;pointer-events:none}.a11y{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}</style><canvas tabindex="0" role="img" aria-label="Interactive graph. Drag vertices to arrange them. Drag the background to pan. Use plus and minus to zoom; zero to fit."></canvas><div class="hint">Drag to arrange \xB7 Scroll to zoom \xB7 0 to fit</div><div class="a11y" aria-live="polite"></div>',this._canvas=e.querySelector("canvas"),this._ctx=this._canvas.getContext("2d"),this._canvas.setAttribute("role","group"),this._canvas.setAttribute("aria-describedby","graph-help");let t=document.createElement("span");t.id="graph-help",t.className="a11y",t.textContent="Arrow keys navigate vertices. Shift and arrows move the selected vertex. Control and arrows pan. Enter selects a vertex. Delete requests removal. Plus and minus zoom; zero fits. Open Inspect graph for searchable vertex and edge lists.",e.append(t);let n=document.createElement("details");n.className="inspection",n.innerHTML='<summary>Inspect graph</summary><div class="inspection-body"><label>Show<select aria-label="Graph item type"><option value="vertices">Vertices</option><option value="edges">Edges</option></select></label><label>Find<input type="search" aria-label="Find graph items" placeholder="Label or endpoint"></label><div class="inspection-list" role="listbox" tabindex="0" aria-label="Graph vertices"></div><div class="inspection-pages"><button type="button" data-page="-1" aria-label="Previous graph items">Previous</button><span class="inspection-range"></span><button type="button" data-page="1" aria-label="Next graph items">Next</button></div><p class="inspection-help">Arrows: navigate \xB7 Enter: select \xB7 Delete: remove<br>Home / End: first / last \xB7 Page Up / Down: browse</p></div>',e.append(n);let s=document.createElement("style");s.textContent=".inspection{position:absolute;top:10px;left:10px;z-index:1;max-width:min(340px,calc(100% - 20px));font:12px system-ui;background:var(--graph-node,#fff);border:1px solid var(--graph-edge,#a8b6c8);border-radius:7px;box-shadow:0 2px 8px #0001}.inspection summary{cursor:pointer;padding:7px 10px}.inspection-body{padding:0 10px 9px}.inspection-body label{display:flex;align-items:center;gap:8px;margin:7px 0}.inspection input,.inspection select,.inspection button{font:inherit;color:inherit;background:var(--graph-bg,#f8fafc);border:1px solid var(--graph-edge,#a8b6c8);border-radius:4px;padding:5px;min-width:0}.inspection input,.inspection select{flex:1;width:100%}.inspection-list{max-height:180px;overflow:auto;min-height:35px;outline-offset:2px}.inspection-option{padding:7px 6px;cursor:pointer;border-radius:4px;overflow-wrap:anywhere}.inspection-option[aria-selected=true]{background:#0d9c9224;box-shadow:inset 3px 0 #0d9c92}.inspection-pages{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:8px}.inspection button:disabled{opacity:.45;cursor:default}.inspection-range,.inspection-help{font-size:10px}.inspection-help{line-height:1.5;margin:8px 0 0;opacity:.8}.inspection :focus-visible{outline:2px solid #0d9c92;outline-offset:1px}",e.append(s),this._inspection=n,this._inspectionList=n.querySelector("[role=listbox]"),n.addEventListener("toggle",()=>{n.open&&this._refreshInspection()}),n.querySelector("select").addEventListener("change",r=>{this._inspectionMode=r.target.value,this._inspectionIndex=0,this._inspectionFiltered=null,this._refreshInspection()}),n.querySelector("input").addEventListener("input",r=>{this._inspectionQuery=r.target.value,this._inspectionIndex=0,this._inspectionFiltered=null,this._refreshInspection()});for(let r of n.querySelectorAll("[data-page]"))r.addEventListener("click",()=>this._navigateInspection(Number(r.dataset.page)*50));this._inspectionList.addEventListener("keydown",r=>this._inspectionKey(r)),this._inspectionList.addEventListener("click",r=>{let o=r.target.closest("[data-index]");o&&(this._inspectionIndex=Number(o.dataset.index),this._activateInspection(),this._inspectionList.focus())}),this._canvas.addEventListener("pointerdown",r=>this._down(r)),this._canvas.addEventListener("pointermove",r=>this._move(r)),this._canvas.addEventListener("pointerup",r=>this._up(r)),this._canvas.addEventListener("pointercancel",r=>this._up(r)),this._canvas.addEventListener("wheel",r=>{r.preventDefault();let o=this._point(r);this.Zoom(Math.exp(-r.deltaY*.001),o.x,o.y)},{passive:!1}),this._canvas.addEventListener("dblclick",r=>{let o=this._world(this._point(r));this.dispatchEvent(new CustomEvent("graph-create-vertex",{detail:o,bubbles:!0,composed:!0}))}),this._canvas.addEventListener("keydown",r=>this._canvasKey(r))}connectedCallback(){this._attach(),this._resize?.disconnect(),globalThis.ResizeObserver&&(this._resize=new ResizeObserver(()=>this._resizeViewport()),this._resize.observe(this)),this.Refresh()}disconnectedCallback(){this._resize?.disconnect(),this._frame&&cancelAnimationFrame(this._frame),this._frame=0,this._detach(),this.CancelLayout()}get Graph(){return this._graph}set Graph(e){this.CancelLayout(),this._detach(),this._graph=e,this._selected=null,this._selectedEdge=null,this._inspectionIndex=0,this._invalidateGraph(),this.Positions.clear(),this.HighlightedEdges.clear(),this.VertexColors.clear(),this._attach(),this.Layout("circle")}_attach(){this._detach();let e=this._graph;if(e)for(let t of["VertexAdded","VertexRemoved","EdgeAdded","EdgeRemoved"])e[t]?.subscribe&&this._subscriptions.push(e[t].subscribe(()=>{this._invalidateGraph(),this.CancelLayout(),this.Refresh()}))}_detach(){for(let e of this._subscriptions)e.dispose?.();this._subscriptions=[]}Layout(e="circle"){this.CancelLayout(),this.LayoutResult=null,this._layoutEdgeRoutes=null,this._layoutNodeRoutes=null,this._layoutClusters=null,this.Positions.clear();let t=[...this._graph?.Vertices??[]],n=t.length,s=Math.max(1,Math.ceil(Math.sqrt(n))),r=Math.max(120,Math.min(500,n*13));t.forEach((o,a)=>this.Positions.set(o,e==="grid"?{x:(a%s-(s-1)/2)*90,y:(Math.floor(a/s)-(Math.ceil(n/s)-1)/2)*80}:{x:Math.cos(2*Math.PI*a/n-Math.PI/2)*r,y:Math.sin(2*Math.PI*a/n-Math.PI/2)*r})),this.Fit()}CancelLayout(){this._layoutGeneration++,this._layoutController?.abort(),this._layoutController=null}async LayoutAsync(e,t={}){let n=typeof e=="function"?e:e?.LayoutAsync??e?.Layout;if(typeof n!="function")throw new TypeError("Layout requires a function or an adapter with LayoutAsync or Layout.");this.CancelLayout();let s=this._layoutGeneration,r=this._graph,o=this._revision,a=new AbortController;this._layoutController=a;let h=()=>new DOMException("Layout was cancelled.","AbortError"),l=()=>a.abort(t.signal?.reason);t.signal?.aborted?l():t.signal?.addEventListener("abort",l,{once:!0});let d,u=new Promise((p,x)=>{d=()=>x(h()),a.signal.addEventListener("abort",d,{once:!0})});try{if(a.signal.aborted)throw h();let p=await Promise.race([Promise.resolve().then(()=>n.call(e,r,{...t,signal:a.signal})),u]);if(a.signal.aborted||s!==this._layoutGeneration||r!==this._graph||o!==this._revision)throw h();let x=p?.Positions??p;if(!x||typeof x[Symbol.iterator]!="function")throw new TypeError("Layout must return a Positions map.");let w=new y(x),b=new y;for(let m of r?.Vertices??[]){let E=w.get(m);if(!E||!Number.isFinite(E.x)||!Number.isFinite(E.y))throw new TypeError("Layout must provide finite x and y coordinates for every vertex.");b.set(m,{x:E.x,y:E.y})}return this.Positions=b,this.LayoutResult=p,this._layoutEdgeRoutes=new y((p.Edges??[]).map(m=>[m.Edge,m])),this._layoutNodeRoutes=new y((p.Nodes??[]).map(m=>[m.Vertex,m])),this._layoutClusters=[...p.Clusters??[]].sort((m,E)=>E.Bounds.width*E.Bounds.height-m.Bounds.width*m.Bounds.height),this.Fit(),this._emit("graph-layout-change",{positions:this.Positions,result:p}),p}finally{a.signal.removeEventListener("abort",d),t.signal?.removeEventListener("abort",l),s===this._layoutGeneration&&(this._layoutController=null)}}_emit(e,t){this.dispatchEvent&&this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}_announce(e){let t=this.shadowRoot?.querySelector(".a11y");t&&(t.textContent=e)}_invalidateGraph(){this._revision++,this._inspectionDirty=!0,this._inspectionFiltered=null,this.LayoutResult=null,this._layoutEdgeRoutes=null,this._layoutNodeRoutes=null,this._layoutClusters=null}_inspectionItems(){if(this._inspectionDirty||!this._inspectionData){let e=[...this._graph?.Vertices??[]],t=[...this._graph?.Edges??[]],n=new y(e.map(s=>[s,{incoming:0,outgoing:0}]));for(let s of t){let r=n.get(s.Source),o=n.get(s.Target);r&&r.outgoing++,o&&o.incoming++}this._inspectionData={vertices:e,edges:t,degrees:n},this._inspectionDirty=!1}if(!this._inspectionFiltered){let e=this._inspectionQuery.toLocaleLowerCase(),t=this._inspectionData[this._inspectionMode];this._inspectionFiltered=e?t.filter(n=>this._itemDescription(n).toLocaleLowerCase().includes(e)):t}return this._inspectionFiltered}_itemDescription(e){if(this._inspectionMode==="edges"){let n=String(this.EdgeLabel(e)??"");return`${this.VertexLabel(e.Source)} ${this._graph?.IsDirected?"to":"connected to"} ${this.VertexLabel(e.Target)}${n?`, ${n}`:""}`}let t=this._inspectionData?.degrees.get(e)??{incoming:0,outgoing:0};return`${this.VertexLabel(e)}; ${this._graph?.IsDirected?`${t.incoming} incoming, ${t.outgoing} outgoing`:`${t.incoming+t.outgoing} incident edges`}`}_refreshInspection(){if(!this._inspection?.open)return;let e=this._inspectionItems(),t=this._inspectionList;this._inspectionIndex=Math.max(0,Math.min(this._inspectionIndex,e.length-1));let n=Math.floor(this._inspectionIndex/50)*50,s=Math.min(n+50,e.length),r=document.createDocumentFragment();for(let o=n;o<s;o++){let a=document.createElement("div");a.className="inspection-option",a.id=`graph-item-${o}`,a.dataset.index=String(o),a.setAttribute("role","option"),a.setAttribute("aria-selected",String(o===this._inspectionIndex)),a.setAttribute("aria-posinset",String(o+1)),a.setAttribute("aria-setsize",String(e.length)),a.textContent=this._itemDescription(e[o]),r.append(a)}t.replaceChildren(r),t.setAttribute("aria-label",`Graph ${this._inspectionMode}`),e.length?t.setAttribute("aria-activedescendant",`graph-item-${this._inspectionIndex}`):(t.removeAttribute("aria-activedescendant"),t.textContent="No matching graph items."),this._inspection.querySelector(".inspection-range").textContent=e.length?`${n+1}\u2013${s} of ${e.length}`:"0 items",this._inspection.querySelector('[data-page="-1"]').disabled=n===0,this._inspection.querySelector('[data-page="1"]').disabled=s===e.length,this.shadowRoot.activeElement===t&&t.querySelector("[aria-selected=true]")?.scrollIntoView({block:"nearest"})}_navigateInspection(e){let t=this._inspectionItems();this._inspectionIndex=Math.max(0,Math.min(t.length-1,this._inspectionIndex+e)),this._refreshInspection()}_activateInspection(){let e=this._inspectionItems()[this._inspectionIndex];e!==void 0&&(this._inspectionMode==="vertices"?this.SelectVertex(e):this.SelectEdge(e),this._refreshInspection())}_inspectionKey(e){let t=!0;e.key==="ArrowDown"||e.key==="ArrowRight"?this._navigateInspection(1):e.key==="ArrowUp"||e.key==="ArrowLeft"?this._navigateInspection(-1):e.key==="PageDown"?this._navigateInspection(50):e.key==="PageUp"?this._navigateInspection(-50):e.key==="Home"?(this._inspectionIndex=0,this._refreshInspection()):e.key==="End"?(this._inspectionIndex=this._inspectionItems().length-1,this._refreshInspection()):e.key==="Enter"||e.key===" "?this._activateInspection():e.key==="Delete"?(this._activateInspection(),this._inspectionMode==="vertices"&&this._selected!=null?this._emit("graph-delete-vertex",{vertex:this._selected}):this._selectedEdge&&this._emit("graph-delete-edge",{edge:this._selectedEdge})):e.key==="Escape"?this._canvas.focus():t=!1,t&&e.preventDefault()}SelectVertex(e){if(this._syncPositions(),!this.Positions.has(e))throw new RangeError("The vertex is not present in this graph.");this._selected=e,this._selectedEdge=null;let t=this.Positions.get(e),n=this.clientWidth||800,s=this.clientHeight||480,r=t.x*this._scale+n/2+this._pan.x,o=t.y*this._scale+s/2+this._pan.y;(r<35||r>n-35||o<35||o>s-35)&&(this._pan.x=-t.x*this._scale,this._pan.y=-t.y*this._scale),this._announce(`Selected vertex ${this.VertexLabel(e)}`),this._emit("graph-select",{vertex:e}),this.Refresh()}SelectEdge(e){let t=Array.from(this._graph?.Edges??[]).find(r=>v(r,e));if(t===void 0)throw new RangeError("The edge is not present in this graph.");e=t,this._selectedEdge=e,this._selected=null;let n=this.Positions.get(e.Source),s=this.Positions.get(e.Target);n&&s&&(this._pan.x=-(n.x+s.x)/2*this._scale,this._pan.y=-(n.y+s.y)/2*this._scale),this._announce(`Selected edge ${this.VertexLabel(e.Source)} to ${this.VertexLabel(e.Target)}${this.EdgeLabel(e)?`, ${this.EdgeLabel(e)}`:""}`),this._emit("graph-select-edge",{edge:e}),this.Refresh()}_canvasKey(e){let t={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]},n=t[e.key];if(n)if(e.ctrlKey||e.metaKey)this._pan.x+=n[0]*30,this._pan.y+=n[1]*30,this.Refresh();else if(e.shiftKey&&this._selected!=null){this.CancelLayout(),this.LayoutResult=null,this._layoutEdgeRoutes=null,this._layoutNodeRoutes=null,this._layoutClusters=null;let s=this.Positions.get(this._selected);if(s){let r={x:s.x+n[0]*10/this._scale,y:s.y+n[1]*10/this._scale};this.Positions.set(this._selected,r),this._emit("graph-layout-change",{vertex:this._selected,position:r}),this._announce(`Moved ${this.VertexLabel(this._selected)} to ${Math.round(r.x)}, ${Math.round(r.y)}`),this.Refresh()}}else{let s=this._syncPositions(),r=s.findIndex(a=>gs(a,this._selected)),o=n[0]+n[1]>0?1:-1;s.length&&this.SelectVertex(s[r<0?o>0?0:s.length-1:(r+o+s.length)%s.length])}else if(e.key==="0")this.Fit();else if(e.key==="+"||e.key==="=")this.Zoom(1.2);else if(e.key==="-")this.Zoom(1/1.2);else if(e.key==="Delete"&&this._selected!=null)this._emit("graph-delete-vertex",{vertex:this._selected});else if(e.key==="Enter"||e.key===" "){let s=this._selected??this._syncPositions()[0];s!==void 0&&this.SelectVertex(s)}else if(e.key==="Home"||e.key==="End"){let s=this._syncPositions(),r=e.key==="Home"?s[0]:s.at(-1);r!==void 0&&this.SelectVertex(r)}else return;e.preventDefault()}Fit(){if(!this.Positions.size){this._scale=1,this._pan={x:0,y:0},this.Refresh();return}let e=1/0,t=1/0,n=-1/0,s=-1/0;for(let h of this.Positions.values())e=Math.min(e,h.x),t=Math.min(t,h.y),n=Math.max(n,h.x),s=Math.max(s,h.y);let r=this.LayoutResult?.Bounds;r&&(e=Math.min(e,r.x),t=Math.min(t,r.y),n=Math.max(n,r.x+r.width),s=Math.max(s,r.y+r.height));let o=this.clientWidth||800,a=this.clientHeight||480;this._viewport={width:o,height:a},this._scale=Math.min(2,(o-100)/Math.max(100,n-e),(a-100)/Math.max(100,s-t)),this._scale=Math.max(.03,this._scale),this._pan={x:-(e+n)/2*this._scale,y:-(t+s)/2*this._scale},this.Refresh()}_resizeViewport(){let e=this.clientWidth||800,t=this.clientHeight||480,n=this._viewport;if(this._viewport={width:e,height:t},n&&n.width>0&&n.height>0&&this.Positions.size){let s=1/0,r=1/0,o=-1/0,a=-1/0;for(let u of this.Positions.values())s=Math.min(s,u.x),r=Math.min(r,u.y),o=Math.max(o,u.x),a=Math.max(a,u.y);let h=this.LayoutResult?.Bounds;h&&(s=Math.min(s,h.x),r=Math.min(r,h.y),o=Math.max(o,h.x+h.width),a=Math.max(a,h.y+h.height));let l=(u,p)=>Math.max(.03,Math.min(2,(u-100)/Math.max(100,o-s),(p-100)/Math.max(100,a-r))),d=l(e,t)/l(n.width,n.height);this._scale=Math.max(.03,Math.min(8,this._scale*d)),this._pan={x:this._pan.x*d,y:this._pan.y*d}}this.Refresh()}Zoom(e,t=(this.clientWidth||800)/2,n=(this.clientHeight||480)/2){if(!Number.isFinite(e)||e<=0||!Number.isFinite(t)||!Number.isFinite(n))throw new RangeError("Zoom factor and coordinates must be finite; factor must be positive.");let s=this._world({x:t,y:n}),r=Math.max(.03,Math.min(8,this._scale*e));this._scale=r,this._pan={x:t-(this.clientWidth||800)/2-s.x*r,y:n-(this.clientHeight||480)/2-s.y*r},this.Refresh()}Refresh(){this._frame||!this.isConnected||(this._frame=requestAnimationFrame(()=>{this._frame=0,this._draw()}))}_point(e){let t=this._canvas.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}_world(e){return{x:(e.x-(this.clientWidth||800)/2-this._pan.x)/this._scale,y:(e.y-(this.clientHeight||480)/2-this._pan.y)/this._scale}}_hit(e){let t=this._world(e);for(let[n,s]of this.Positions){let r=this._layoutNodeRoutes?.get(n)?.Bounds;if(r?t.x>=r.x&&t.x<=r.x+r.width&&t.y>=r.y&&t.y<=r.y+r.height:Math.hypot(t.x-s.x,t.y-s.y)<Math.max(20,12/this._scale))return n}}_down(e){if(this._drag||e.isPrimary===!1||e.button>0)return;this._syncPositions();let t=this._point(e),n=this._hit(t),s=this._world(t),r=this.Positions.get(n);this._drag={vertex:n,point:t,pointerId:e.pointerId,offset:r?{x:s.x-r.x,y:s.y-r.y}:{x:0,y:0},moved:!1},this._canvas.setPointerCapture(e.pointerId),n!==void 0&&(this._selected=n,this._selectedEdge=null,this.dispatchEvent(new CustomEvent("graph-select",{detail:{vertex:n},bubbles:!0,composed:!0})),this.shadowRoot.querySelector(".a11y").textContent=`Selected ${this.VertexLabel(n)}`),this.Refresh()}_move(e){if(!this._drag||e.pointerId!==this._drag.pointerId)return;let t=this._point(e),n=t.x-this._drag.point.x,s=t.y-this._drag.point.y;if(this._drag.moved||=Math.abs(n)+Math.abs(s)>2,this._drag.vertex!==void 0){this.CancelLayout(),this.LayoutResult=null,this._layoutEdgeRoutes=null,this._layoutNodeRoutes=null,this._layoutClusters=null;let r=this._world(t);this.Positions.set(this._drag.vertex,{x:r.x-this._drag.offset.x,y:r.y-this._drag.offset.y})}else this._pan.x+=n,this._pan.y+=s;this._drag.point=t,this.Refresh()}_up(e){!this._drag||e.pointerId!==this._drag.pointerId||(this._drag?.vertex!==void 0&&this._drag.moved&&this.dispatchEvent(new CustomEvent("graph-layout-change",{detail:{vertex:this._drag.vertex,position:this.Positions.get(this._drag.vertex)},bubbles:!0,composed:!0})),this._drag=null,this._canvas.hasPointerCapture(e.pointerId)&&this._canvas.releasePointerCapture(e.pointerId))}_syncPositions(){let e=Array.from(this._graph?.Vertices??[]),t=new _(e),n=0;for(let s of e){if(!this.Positions.has(s)){let r=n*Math.PI*(3-Math.sqrt(5)),o=70+Math.sqrt(n)*35;this.Positions.set(s,{x:Math.cos(r)*o,y:Math.sin(r)*o})}++n}for(let s of this.Positions.keys())t.has(s)||(this.Positions.delete(s),this.VertexColors.delete(s));return this._selected!=null&&!t.has(this._selected)&&(this._selected=null),e}_edgeGeometry(e){let t=new y(Array.from(this.Positions.keys(),(r,o)=>[r,o])),n=new y;for(let r of e){let o=this.Positions.get(r.Source),a=this.Positions.get(r.Target);if(!o||!a)continue;let h=t.get(r.Source),l=t.get(r.Target),d=`${Math.min(h,l)}:${Math.max(h,l)}`;n.has(d)||n.set(d,[]),n.get(d).push({edge:r,a:o,b:a,source:h,target:l})}let s=[];for(let r of n.values())for(let o=0;o<r.length;++o){let a=r[o];if(gs(a.edge.Source,a.edge.Target)){s.push({...a,loop:!0,radius:19+o*9,cx:a.a.x+17,cy:a.a.y-22});continue}let h=a.b.x-a.a.x,l=a.b.y-a.a.y,d=Math.hypot(h,l)||1,u=(o-(r.length-1)/2)*38*(a.source<=a.target?1:-1),p=(a.a.x+a.b.x)/2-l/d*u,x=(a.a.y+a.b.y)/2+h/d*u,w=Math.hypot(p-a.a.x,x-a.a.y)||1,b=Math.hypot(a.b.x-p,a.b.y-x)||1,m=Math.min(20,d/3),E=Math.min(24,d/3);s.push({...a,loop:!1,cx:p,cy:x,sx:a.a.x+(p-a.a.x)/w*m,sy:a.a.y+(x-a.a.y)/w*m,tx:a.b.x-(a.b.x-p)/b*E,ty:a.b.y-(a.b.y-x)/b*E,ux:(a.b.x-p)/b,uy:(a.b.y-x)/b})}return s}_arrowPoints(e){if(!e?.Tip||!e?.Base)return null;let t=e.Tip,n=e.Base,s=Math.hypot(t.x-n.x,t.y-n.y)||1,r=(e.Width??8)/2,o=(t.x-n.x)/s,a=(t.y-n.y)/s;return[t,{x:n.x-a*r,y:n.y+o*r},{x:n.x+a*r,y:n.y-o*r}]}_nativePath(e){if(!e?.Path||typeof globalThis.Path2D!="function")return null;let t=this._pathCache.get(e);return(!t||t.source!==e.Path)&&(t={source:e.Path,path:new Path2D(e.Path)},this._pathCache.set(e,t)),t.path}_drawClusters(e,t,n,s){if(typeof globalThis.Path2D=="function")for(let r of this._layoutClusters??[]){let o=this._nativePath(r);o&&(e.fillStyle=n,e.strokeStyle=t,e.lineWidth=1/Math.max(.5,this._scale),e.fill(o),e.stroke(o),r.Label?.Text&&(e.fillStyle=s,e.fillText(r.Label.Text,r.Label.Center.x,r.Label.Center.y)))}}_drawRoute(e,t,n,s,r,o){let a=this._nativePath(n);if(!a)return!1;e.stroke(a);for(let l of[n.SourceArrowhead,n.TargetArrowhead]){let d=this._arrowPoints(l);d&&(e.beginPath(),e.moveTo(d[0].x,d[0].y),e.lineTo(d[1].x,d[1].y),e.lineTo(d[2].x,d[2].y),e.closePath(),e.fill())}let h=String(this.EdgeLabel(t)??"");if(o&&h&&n.Label?.Center){let{x:l,y:d}=n.Label.Center,u=e.measureText(h).width;e.fillStyle=r,e.fillRect(l-u/2-5,d-9,u+10,18),e.fillStyle=s,e.fillText(h,l,d)}return!0}_routeSvg(e,t,n){let s=`<path d="${ut(t.Path)}" fill="none" stroke="${n}"/>`;for(let r of[t.SourceArrowhead,t.TargetArrowhead]){let o=this._arrowPoints(r);o&&(s+=`<polygon points="${o.map(a=>`${a.x},${a.y}`).join(" ")}" fill="${n}"/>`)}if(t.Label?.Center){let{x:r,y:o}=t.Label.Center;s+=`<text x="${r}" y="${o}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="12">${ut(this.EdgeLabel(e)??"")}</text>`}return s}_draw(){let e=this._canvas,t=this._ctx;if(!t)return;let n=this.clientWidth,s=this.clientHeight,r=Math.min(2,globalThis.devicePixelRatio||1);(e.width!==Math.round(n*r)||e.height!==Math.round(s*r))&&(e.width=Math.round(n*r),e.height=Math.round(s*r)),t.setTransform(r,0,0,r,0,0),t.clearRect(0,0,n,s);let o=getComputedStyle(this),a=o.getPropertyValue("--graph-text").trim()||"#334155",h=o.getPropertyValue("--graph-edge").trim()||"#a8b6c8",l=o.getPropertyValue("--graph-node").trim()||"#fff";t.fillStyle=o.getPropertyValue("--graph-dot").trim()||"#dce3eb";let d=24;t.beginPath();for(let f=n/2%d;f<n;f+=d)for(let S=s/2%d;S<s;S+=d)t.moveTo(f+.7,S),t.arc(f,S,.7,0,Math.PI*2);if(t.fill(),this._inspectionDirty&&this._refreshInspection(),!this._graph)return;let u=this._syncPositions();t.translate(n/2+this._pan.x,s/2+this._pan.y),t.scale(this._scale,this._scale),t.font="12px system-ui",t.textAlign="center",t.textBaseline="middle";let p=u.length<250&&this._scale>.25,x=[...this._graph.Edges],w=(-n/2-this._pan.x)/this._scale-50,b=(n/2-this._pan.x)/this._scale+50,m=(-s/2-this._pan.y)/this._scale-50,E=(s/2-this._pan.y)/this._scale+50;this._drawClusters(t,h,l,a);for(let f of this._edgeGeometry(x)){let{edge:S,a:T,b:P}=f;if(!this._layoutEdgeRoutes?.has(S)&&(Math.max(T.x,P.x,f.cx)<w||Math.min(T.x,P.x,f.cx)>b||Math.max(T.y,P.y,f.cy)<m||Math.min(T.y,P.y,f.cy)>E))continue;let M=this.HighlightedEdges.has(S)||S===this._selectedEdge;if(t.strokeStyle=M?"#0d9c92":h,t.fillStyle=t.strokeStyle,t.lineWidth=(M?3:1.5)/Math.max(.5,this._scale),this._drawRoute(t,S,this._layoutEdgeRoutes?.get(S),a,l,p))continue;t.beginPath();let H,z,fe,Se,C,ee;if(f.loop){let ue=Math.PI*1.9;t.arc(f.cx,f.cy,f.radius,.25,ue),H=f.cx+Math.cos(ue)*f.radius,z=f.cy+Math.sin(ue)*f.radius,fe=-Math.sin(ue),Se=Math.cos(ue),C=f.cx,ee=f.cy-f.radius-8}else t.moveTo(f.sx,f.sy),t.quadraticCurveTo(f.cx,f.cy,f.tx,f.ty),H=f.tx,z=f.ty,fe=f.ux,Se=f.uy,C=.25*f.sx+.5*f.cx+.25*f.tx,ee=.25*f.sy+.5*f.cy+.25*f.ty;if(t.stroke(),this._graph.IsDirected&&(t.beginPath(),t.moveTo(H,z),t.lineTo(H-fe*9-Se*4,z-Se*9+fe*4),t.lineTo(H-fe*9+Se*4,z-Se*9-fe*4),t.closePath(),t.fill()),p){let ue=String(this.EdgeLabel(S)??"");if(ue){let Xt=t.measureText(ue).width;t.fillStyle=l,t.fillRect(C-Xt/2-5,ee-9,Xt+10,18),t.fillStyle=a,t.fillText(ue,C,ee)}}}for(let[f,S]of this.Positions){let T=S.x*this._scale+n/2+this._pan.x,P=S.y*this._scale+s/2+this._pan.y,M=this._layoutNodeRoutes?.get(f),H=M?.Bounds;if(H?H.x+H.width<w||H.x>b||H.y+H.height<m||H.y>E:T<-30||P<-30||T>n+30||P>s+30)continue;let z=this._nativePath(M);t.beginPath(),z||t.arc(S.x,S.y,u.length>1e3?4:19,0,Math.PI*2),t.fillStyle=this.VertexColors.get(f)||l,z?t.fill(z):t.fill(),t.lineWidth=(gs(f,this._selected)?3:1.7)/Math.max(.65,this._scale),t.strokeStyle=gs(f,this._selected)?"#0d9c92":h,z?t.stroke(z):t.stroke(),p&&(t.fillStyle=a,t.fillText(M?String(this.VertexLabel(f)):String(this.VertexLabel(f)).slice(0,18),S.x,S.y))}e.setAttribute("aria-label",`Graph with ${u.length} vertices and ${x.length} edges. Arrow keys select vertices; Shift and arrows move; Control and arrows pan. Plus/minus zoom; zero fits. Inspect graph lists individual vertices and edges.`)}ToSvg(){this._syncPositions();let e=this._edgeGeometry(Array.from(this._graph?.Edges??[])),t=-200,n=-200,s=200,r=200;for(let h of this.Positions.values())t=Math.min(t,h.x-40),n=Math.min(n,h.y-40),s=Math.max(s,h.x+40),r=Math.max(r,h.y+40);for(let h of e){let l=h.loop?h.radius:0;t=Math.min(t,h.cx-l-30),n=Math.min(n,h.cy-l-30),s=Math.max(s,h.cx+l+30),r=Math.max(r,h.cy+l+30)}let o=this.LayoutResult?.Bounds;o&&(t=Math.min(t,o.x-30),n=Math.min(n,o.y-30),s=Math.max(s,o.x+o.width+30),r=Math.max(r,o.y+o.height+30));let a=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${t} ${n} ${s-t} ${r-n}"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="context-stroke"/></marker></defs>`;for(let h of this._layoutClusters??[])a+=`<path d="${ut(h.Path)}" fill="#eff6ff" stroke="#94a3b8"/><text x="${h.Label?.Center.x??0}" y="${h.Label?.Center.y??0}" text-anchor="middle" font-family="sans-serif" font-size="12">${ut(h.Label?.Text??"")}</text>`;for(let h of e){let l=this.HighlightedEdges.has(h.edge)||h.edge===this._selectedEdge?"#0d9c92":"#64748b",d=this._layoutEdgeRoutes?.get(h.edge);if(d?.Path){a+=this._routeSvg(h.edge,d,l);continue}let u,p,x;if(h.loop){let b=Math.PI*1.9;u=`M${h.cx+Math.cos(.25)*h.radius} ${h.cy+Math.sin(.25)*h.radius} A${h.radius} ${h.radius} 0 1 1 ${h.cx+Math.cos(b)*h.radius} ${h.cy+Math.sin(b)*h.radius}`,p=h.cx,x=h.cy-h.radius-8}else u=`M${h.sx} ${h.sy} Q${h.cx} ${h.cy} ${h.tx} ${h.ty}`,p=.25*h.sx+.5*h.cx+.25*h.tx,x=.25*h.sy+.5*h.cy+.25*h.ty;a+=`<path d="${u}" fill="none" stroke="${l}"${this._graph.IsDirected?' marker-end="url(#arrow)"':""}/><text x="${p}" y="${x-5}" text-anchor="middle" font-family="sans-serif" font-size="12">${ut(this.EdgeLabel(h.edge)??"")}</text>`}for(let[h,l]of this.Positions){let d=this._layoutNodeRoutes?.get(h),u=ut(this.VertexColors.get(h)||"#fff");a+=(d?.Path?`<path d="${ut(d.Path)}" fill="${u}" stroke="#64748b"/>`:`<circle cx="${l.x}" cy="${l.y}" r="19" fill="${u}" stroke="#64748b"/>`)+`<text x="${l.x}" y="${l.y+4}" font-family="sans-serif" font-size="12" text-anchor="middle">${ut(this.VertexLabel(h))}</text>`}return a+"</svg>"}};function kd(i="quikgraph-viewer"){if(!globalThis.customElements)throw new Error("Custom elements require a browser.");return customElements.get(i)||customElements.define(i,i==="quikgraph-viewer"?fs:class extends fs{}),customElements.get(i)}export{gi as AStarShortestPathAlgorithm,he as AdjacencyGraph,B as AlgorithmBase,bd as AlgorithmExtensions,ve as AlgorithmHeap,Ys as AlgorithmServices,ra as AllVerticesGraphAugmentorAlgorithm,eo as AlwaysTrueConditionExpression,no as Arc,xe as ArgumentException,Xe as ArgumentNullException,Ae as ArgumentOutOfRangeException,tn as ArrayAdjacencyGraph,nn as ArrayBidirectionalGraph,Kn as ArrayUndirectedGraph,Ic as BasicStructuresExtensions,fi as BellmanFordShortestPathAlgorithm,jo as BestFirstFrontierSearchAlgorithm,Qn as BidirectionalAdapterGraph,Oo as BidirectionalDepthFirstSearchAlgorithm,Z as BidirectionalGraph,sn as BidirectionalMatrixGraph,ai as BinaryHeap,Hs as BinaryQueue,aa as BipartiteToMaximumFlowGraphAugmentorAlgorithm,Lt as BreadthFirstSearchAlgorithm,wa as BronKerboschMaximumCliqueAlgorithm,tt as CancelManager,zl as Clone,Ta as CloneableVertexGraphExplorerAlgorithm,Hc as ClrBoolean,an as ClusteredAdjacencyGraph,bc as ComponentWithEdges,Xn as CompressedSparseRowGraph,Te as ComputationState,Nl as ComputeDisjointSet,vl as ComputePredecessorCost,jl as ComputeTransitiveClosure,ql as ComputeTransitiveReduction,Fl as CondensateEdges,kl as CondensateStronglyConnected,Gl as CondensateWeaklyConnected,wr as CondensatedGraphRenderer,_t as CondensationGraphAlgorithm,ir as CondensedEdge,Tl as ConnectedComponents,Sn as ConnectedComponentsAlgorithm,al as CreateMsaglPopulator,Eh as CryptoRandom,Oi as CyclePoppingRandomTreeAlgorithm,mi as DagShortestPathAlgorithm,so as DataRelationEdge,ro as DataSetGraph,dd as DataSetGraphExtensions,oo as DataSetGraphPopulatorAlgorithm,ao as DataSetGraphvizAlgorithm,rl as DataSetToGraph,ol as DataSetToGraphviz,Cr as DecodeNrbf,Bi as DefaultFinishedPredicate,Yn as DelegateBidirectionalIncidenceGraph,rn as DelegateImplicitGraph,Zn as DelegateImplicitUndirectedGraph,Rt as DelegateIncidenceGraph,Jn as DelegateUndirectedGraph,on as DelegateVertexAndEdgeListGraph,bt as DepthFirstSearchAlgorithm,Uh as DeserializeAndValidateFromGraphML,Zh as DeserializeFromBinary,Wh as DeserializeFromGraphML,Xh as DeserializeFromXml,nh as DeserializeNrbf,Dc as DeserializeNrbfGraph,Bt as DijkstraShortestPathAlgorithm,ss as DirectedGraph,qr as DirectedGraphAlias,Lr as DirectedGraphCategory,os as DirectedGraphLink,Mr as DirectedGraphLinkCategory,Ur as DirectedGraphMLAlgorithm,nd as DirectedGraphMLExtensions,Br as DirectedGraphName,rs as DirectedGraphNode,Nr as DirectedGraphNodeCategory,Wr as DirectedGraphPath,Or as DirectedGraphProperty,jr as DirectedGraphStyle,zr as DirectedGraphStyleCondition,$r as DirectedGraphStyleSetter,Ne as DistanceRelaxers,at as DotEscapers,Nh as DotToSvgApiEndpoint,Q as Edge,Zs as EdgeDepthFirstSearchAlgorithm,gn as EdgeEdgeDictionary,Wn as EdgeEventArgs,Ih as EdgeExtensions,et as EdgeList,en as EdgeListGraph,qa as EdgeMergeCondensatedGraphRenderer,Gi as EdgeMergeCondensationGraphAlgorithm,ea as EdgePredecessorRecorderObserver,Zo as EdgeRecorderObserver,An as EdmondsKarpMaximumFlowAlgorithm,Tr as EncodeNrbf,Cd as EnumerableHelpers,y as EqualityMap,_ as EqualitySet,Un as EquatableEdge,Vs as EquatableTaggedEdge,Ds as EquatableTermEdge,Is as EquatableUndirectedEdge,_d as EquateGraphs,ge as EscapeXml,ma as EulerianTrailAlgorithm,L as EventHook,li as FibonacciHeap,hi as FibonacciHeapCell,fn as FibonacciHeapLinkedList,Ks as FibonacciQueue,Ba as FileDotEngine,Ls as FilteredBidirectionalGraph,Ms as FilteredEdgeListGraph,hn as FilteredGraph,ei as FilteredImplicitGraph,ln as FilteredImplicitVertexSet,ti as FilteredIncidenceGraph,Os as FilteredUndirectedGraph,Ns as FilteredVertexAndEdgeListGraph,cn as FilteredVertexListGraph,Wo as FloydWarshallAllShortestPathAlgorithm,Qc as FontStyleEnum,Xc as FontWeightEnum,Nt as ForestDisjointSet,xr as FormatClusterEventArgs,mr as FormatEdgeEventArgs,fr as FormatVertexEventArgs,Yc as FrameKindEnum,cl as GetEdgeIdentity,mh as GetIndexer,Rc as GetNrbfMetadata,Je as GetOtherVertex,_o as GetUndirectedVertexEquality,ll as GetVertexIdentity,Vn as GraphAugmentorAlgorithmBase,ha as GraphBalancerAlgorithm,Ce as GraphColor,ed as GraphDirectionEnum,No as GraphExtensions,qn as GraphMLDeserializer,Bc as GraphMLExtensions,Hh as GraphMLResourceResolver,ts as GraphMLSerializer,oh as GraphMLXmlResolver,yr as GraphRendererBase,Ht as GraphvizAlgorithm,Oa as GraphvizArrow,dr as GraphvizArrowClipping,Aa as GraphvizArrowFilling,_c as GraphvizArrowShape,Va as GraphvizClusterMode,c as GraphvizColor,Ui as GraphvizEdge,ka as GraphvizEdgeDirection,Wi as GraphvizEdgeExtremity,gr as GraphvizEdgeLabel,Ga as GraphvizEdgeStyle,Cc as GraphvizExtensions,Rn as GraphvizFont,Hi as GraphvizGraph,ja as GraphvizImageType,Fa as GraphvizLabelJustification,Ra as GraphvizLabelLocation,La as GraphvizLayer,zi as GraphvizLayerCollection,Da as GraphvizOutputMode,Pa as GraphvizPageDirection,ur as GraphvizPoint,va as GraphvizRankDirection,Na as GraphvizRatioMode,Dn as GraphvizRecord,Pn as GraphvizRecordCell,pr as GraphvizRecordCellCollection,ht as GraphvizSize,ke as GraphvizSizeF,Ma as GraphvizSplineType,$i as GraphvizVertex,We as GraphvizVertexShape,Gn as GraphvizVertexStyle,Uc as GroupEnum,Ws as HasCycles,Td as HashCodeHelpers,un as HeapConstants,Xs as HeapDirection,yi as HoffmanPavleyRankedShortestPathAlgorithm,$c as HorizontalAlignmentEnum,It as HtmlString,ca as HungarianAlgorithm,hr as HungarianIteration,or as HungarianSteps,Jr as IdentityExpression,Bo as ImplicitDepthFirstSearchAlgorithm,qo as ImplicitEdgeDepthFirstSearchAlgorithm,Bs as InDictionaryVertexPredicate,Vl as IncrementalConnectedComponents,Si as IncrementalConnectedComponentsAlgorithm,G as InvalidOperationException,Qe as IsAdjacent,Dl as IsDirectedAcyclicGraph,ga as IsEulerianGraphAlgorithm,fa as IsHamiltonianGraphAlgorithm,$s as IsPath,bo as IsPathWithoutCycles,Eo as IsPredecessor,_e as IsSelfEdge,Pl as IsUndirectedAcyclicGraph,qs as IsolatedVertexPredicate,El as IsolatedVertices,ua as KernighanLinAlgorithm,Ai as KruskalMinimumSpanningTreeAlgorithm,td as LayoutEnum,Mi as MarkovEdgeChainBase,la as MaximumBipartiteMatchingAlgorithm,lr as MaximumCliqueAlgorithmBase,Bl as MaximumFlow,ar as MaximumFlowAlgorithm,ki as MergedEdge,Ll as MinimumSpanningTreeKruskal,Ml as MinimumSpanningTreePrim,ya as MinimumVertexCoverApproximationAlgorithm,zn as MsaglDefaultGraphPopulator,uo as MsaglDrawingGraph,co as MsaglEdge,go as MsaglEdgeEventArgs,xd as MsaglGraphExtensions,us as MsaglGraphPopulator,ps as MsaglIdentifiableGraphPopulator,lo as MsaglNode,fo as MsaglToStringGraphPopulator,po as MsaglVertexEventArgs,oa as MultiSourceSinkGraphAugmentorAlgorithm,Yt as NegativeCapacityException,bs as NegativeCycleGraphException,Es as NegativeWeightException,_s as NoPathFoundException,Oe as NonAcyclicGraphException,Cs as NonStronglyConnectedGraphException,Wt as NormalizedMarkovEdgeChain,$n as NotSupportedException,Y as NrbfArray,kt as NrbfBinaryType,O as NrbfClass,oe as NrbfDateTime,re as NrbfDecimal,Vt as NrbfDocument,te as NrbfFormatError,Ka as NrbfFormatter,Ja as NrbfMemoryStream,be as NrbfPrimitive,D as NrbfPrimitiveType,Ha as NrbfTypeRegistry,Rl as OddVertices,Ol as OfflineLeastCommonAncestor,il as OpenAsDGML,di as OperationCanceledException,ta as PageRankAlgorithm,Ss as ParallelEdgeNotAllowedException,ls as ParseXml,Ni as Partition,wc as PartitionHelpers,io as PetriGraph,gh as PetriNet,fh as PetriNetSimulator,ds as Place,Vi as PrimMinimumSpanningTreeAlgorithm,Zc as PropertyType,yt as Queue,Ge as QuikGraphException,Id as QuikGraphHelpers,On as QuikGraphNrbfFormatter,fs as QuikGraphViewer,na as RandomGraphFactory,_a as RandomWalkAlgorithm,er as RankedShortestPathAlgorithmBase,yl as RankedShortestPathHoffmanPavley,nl as ReadDirectedGraphXml,ni as ResidualEdgePredicate,Co as ReverseEdges,Ps as ReversedBidirectionalGraph,sa as ReversedEdgeAugmentorAlgorithm,zs as ReversedResidualEdgePredicate,ce as RootedAlgorithmBase,Mt as RootedSearchAlgorithmBase,bl as Roots,ba as RoundRobinEdgeChain,Ft as SEdge,Pe as SEquatableEdge,Gs as SEquatableTaggedEdge,mt as SReversedEdge,ks as STaggedEdge,Rs as STaggedUndirectedEdge,Jt as SUndirectedEdge,qc as SerializationExtensions,ih as SerializeNrbf,Pc as SerializeNrbfGraph,Yh as SerializeToBinary,$h as SerializeToGraphML,Kh as SerializeToXml,Qh as SerializeXmlSerializableGraph,Ji as SerializerBase,nt as ShortestPathAlgorithmBase,fl as ShortestPathsAStar,ml as ShortestPathsBellmanFord,xl as ShortestPathsDag,gl as ShortestPathsDijkstra,js as SinkVertexPredicate,wl as Sinks,Qs as SoftHeap,xi as SortedPath,Dt as SortedVertexEquality,Cl as SourceFirstBidirectionalTopologicalSort,Ci as SourceFirstBidirectionalTopologicalSortAlgorithm,_l as SourceFirstTopologicalSort,Tn as SourceFirstTopologicalSortAlgorithm,Il as StronglyConnectedComponents,Cn as StronglyConnectedComponentsAlgorithm,Tc as SvgHtmlWrapper,pa as TSP,As as TaggedEdge,Fs as TaggedUndirectedEdge,Jc as TargetTypeEnum,Di as TarjanOfflineLeastCommonAncestorAlgorithm,da as TaskPriority,Hn as TermEdge,To as ToAdjacencyGraph,Vo as ToArrayAdjacencyGraph,ko as ToArrayBidirectionalGraph,Go as ToArrayUndirectedGraph,Io as ToBidirectionalGraph,Fo as ToCompressedRowGraph,Do as ToDelegateBidirectionalIncidenceGraph,Ro as ToDelegateIncidenceGraph,vo as ToDelegateUndirectedGraph,Po as ToDelegateVertexAndEdgeListGraph,ph as ToDirectedGraphML,$a as ToGraphviz,hl as ToMsaglGraph,qh as ToNrbfRecord,Mh as ToSvg,Ao as ToUndirectedGraph,Us as ToVertexPair,cs as TokenList,Sl as TopologicalSort,St as TopologicalSortAlgorithm,Et as TopologicalSortDirection,to as Transition,Ca as TransitionFactoryImplicitGraph,Fi as TransitiveClosureAlgorithm,Ri as TransitiveReductionAlgorithm,dl as TreeBreadthFirstSearch,pl as TreeCyclePoppingRandom,ul as TreeDepthFirstSearch,So as TryGetPath,vs as UndirectedBidirectionalGraph,Mo as UndirectedBreadthFirstSearchAlgorithm,Lo as UndirectedDepthFirstSearchAlgorithm,pi as UndirectedDijkstraShortestPathAlgorithm,Be as UndirectedEdge,Ye as UndirectedEdgeEventArgs,Ti as UndirectedFirstTopologicalSortAlgorithm,Fe as UndirectedGraph,$o as UndirectedShortestPathAlgorithmBase,_i as UndirectedTopologicalSortAlgorithm,Qo as UndirectedVertexDistanceRecorderObserver,je as UndirectedVertexEquality,wi as UndirectedVertexPredecessorRecorderObserver,Sa as VanishingWeightedMarkovEdgeChain,xa as VertexColoringAlgorithm,tr as VertexDistanceRecorderObserver,pn as VertexEdgeDictionary,Ts as VertexEventArgs,vt as VertexList,$ as VertexNotFoundException,Jo as VertexPredecessorPathRecorderObserver,jt as VertexPredecessorRecorderObserver,Yo as VertexRecorderObserver,Xo as VertexTimeStamperObserver,Wc as VerticalAlignmentEnum,Kc as VisibilityEnum,Al as WeaklyConnectedComponents,_n as WeaklyConnectedComponentsAlgorithm,Ea as WeightedMarkovEdgeChain,Li as WeightedMarkovEdgeChainBase,as as WriteDirectedGraphXml,is as XmlEdgeList,Bn as XmlNode,zc as XmlReaderExtensions,ah as XmlSerializableEdge,jn as XmlSerializableGraph,Zi as XmlStringWriter,ns as XmlVertexList,jc as XmlWriterExtensions,Ko as YenShortestPathsAlgorithm,N as algorithmError,Ve as defaultCompare,kd as defineQuikGraphViewer,k as equals,De as events,bn as predecessorPath,g as requireValue,ie as sameVertex,v as valueEquals};
//# sourceMappingURL=quikgraphweb.browser.js.map
