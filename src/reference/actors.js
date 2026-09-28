import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/examples/jsm/utils/SkeletonUtils.js';

// Visual assets are replaceable independently of collisions, services, and save data.
export const ASSETS={
  people:{male:'/reference-assets/characters/male.gltf',female:'/reference-assets/characters/female.gltf'},
  hair:{parted:'/reference-assets/hair/simpleparted.gltf',buzz:'/reference-assets/hair/buzzed.gltf',long:'/reference-assets/hair/long.gltf',buns:'/reference-assets/hair/buns.gltf'},
  buildings:{small:'/reference-assets/city/Building_Small_1.gltf',medium:'/reference-assets/city/Building_Medium_2_001.gltf',large:'/reference-assets/city/Building_Large_2.gltf'},
  animations:'/reference-assets/locomotion.glb'
};
const cache=new Map,loader=new GLTFLoader;
export const loadModel=url=>{if(!cache.has(url)){assetStatus.loading++;cache.set(url,loader.loadAsync(url).catch(e=>{cache.delete(url);assetStatus.failed.push(url);throw e;}).finally(()=>assetStatus.loading--));}return cache.get(url);};
export const assetStatus={loading:0,failed:[]};
const animations={idle:'Idle_Loop',walk:'Walk_Loop',run:'Jog_Fwd_Loop',talk:'Idle_Talking_Loop',sit:'Sitting_Idle_Loop',interact:'Interact',work:'PickUp_Table'};
function outfit(mesh,profile){const source=mesh.material;mesh.material=source.clone();mesh.material.roughness=.78;mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;if(/eyebrows/i.test(mesh.name))mesh.material.color.set(profile.hair||'#30241e');
  if(!/SuperHero|Superhero|Female|Male/i.test(mesh.name))return;
  const geo=mesh.geometry.clone(),pos=geo.attributes.position,normal=geo.attributes.normal,index=geo.index;const groups=[[],[],[],[]];
  const classify=(x,y)=>y<.14?3:y<1.02?2:y<1.57&&Math.abs(x)<.6?1:0;
  for(let i=0;i<index.count;i+=3){const a=index.getX(i),b=index.getX(i+1),c=index.getX(i+2);const x=(pos.getX(a)+pos.getX(b)+pos.getX(c))/3,y=(pos.getY(a)+pos.getY(b)+pos.getY(c))/3;groups[classify(x,y)].push(a,b,c);}
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),k=classify(x,y);if(k===1||k===2){const padding=k===1?.013:.011;pos.setXYZ(i,x+normal.getX(i)*padding,y,z+normal.getZ(i)*padding);}}
  geo.setIndex(groups.flat());geo.clearGroups();let offset=0;groups.forEach((g,i)=>{geo.addGroup(offset,g.length,i);offset+=g.length;});geo.computeVertexNormals();mesh.geometry=geo;
  const skin=source.clone();skin.color.set(profile.skin||'#d6a47b').lerp(new T.Color('white'),.45);skin.roughness=.82;
  const shirt=new T.MeshStandardMaterial({color:profile.shirt||'#527bc4',roughness:.94});
  const pants=new T.MeshStandardMaterial({color:profile.pants||0x334b65,roughness:1});
  const shoes=new T.MeshStandardMaterial({color:profile.shoes||0xe4e1d7,roughness:.72});mesh.material=[skin,shirt,pants,shoes];
}
export async function createActor(profile={},options={}){
  const type=profile.body==='female'?'female':'male';
  const [model,library,hair]=await Promise.all([loadModel(ASSETS.people[type]),loadModel(ASSETS.animations),loadModel(ASSETS.hair[profile.hairstyle]||ASSETS.hair.parted)]);
  const scene=cloneSkeleton(model.scene);scene.updateMatrixWorld(true);scene.traverse(o=>{if(o.isMesh){const original=o.geometry;outfit(o,profile);if(o.geometry===original)o.geometry=o.geometry.clone();o.userData.actorOwned=true;}});
  const head=scene.getObjectByName('Head');
  if(head){const coiffure=hair.scene.clone(true);coiffure.name="Hairstyle";coiffure.traverse(o=>{if(o.isMesh){o.geometry=o.geometry.clone();o.userData.actorOwned=true;o.material=o.material.clone();o.material.color.set(profile.hair||'#30241e');o.material.roughness=.9;o.castShadow=true;}});const bounds=new T.Box3().setFromObject(coiffure),size=bounds.getSize(new T.Vector3),center=bounds.getCenter(new T.Vector3);const isLong=['long','buns'].includes(profile.hairstyle);const scale=.23/Math.max(size.x,.01);coiffure.scale.setScalar(scale);coiffure.position.set(-center.x*scale,(type==='female'?1.71:1.76)-bounds.min.y*scale-(isLong?.16:0),-center.z*scale-.025);scene.add(coiffure);scene.updateMatrixWorld(true);head.attach(coiffure);}
  const root=new T.Group;root.add(scene);const scale=profile.height==='Tall'?1.03:profile.height==='Short'?.9:.96;scene.scale.set(.9*scale,scale,scale);scene.position.y=.015;
  const mixer=new T.AnimationMixer(scene),actions={};
  for(const [key,name] of Object.entries(animations)){const original=library.animations.find(a=>a.name===name);if(!original)continue;const clip=original.clone();clip.tracks=clip.tracks.filter(t=>t.name.endsWith('.quaternion')||/^pelvis\.position$/.test(t.name));for(const track of clip.tracks){const bone=track.name.split('.')[0],source=library.scene.getObjectByName(bone),target=scene.getObjectByName(bone);if(!source||!target)continue;if(track.name.endsWith('.quaternion')){const correction=target.quaternion.clone().multiply(source.quaternion.clone().invert());for(let i=0;i<track.values.length;i+=4){const q=new T.Quaternion().fromArray(track.values,i).premultiply(correction);q.toArray(track.values,i);}}else{for(let i=0;i<track.values.length;i+=3)for(let j=0;j<3;j++)track.values[i+j]+=target.position.getComponent(j)-source.position.getComponent(j);}}actions[key]=mixer.clipAction(clip);}
  let current=null;
  const actor={root,scene,mixer,actions,setAction(name,speed=1){const action=actions[name]||actions.idle;if(!action)return;if(current!==action){current?.fadeOut(.2);action.reset().fadeIn(.2).play();current=action;}action.timeScale=speed;},update(dt){mixer.update(dt);},dispose(){mixer.stopAllAction();mixer.uncacheRoot(scene);scene.traverse(o=>{if(o.isMesh){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();o.geometry.dispose();}});}};
  actor.setAction(options.action||'idle');actor.update(.01);root.updateMatrixWorld(true);const coiffure=scene.getObjectByName('Hairstyle');if(coiffure){let crown=-Infinity;const v=new T.Vector3;scene.traverse(o=>{if(o.isSkinnedMesh&&/SuperHero|Superhero/i.test(o.name)){for(let i=0;i<o.geometry.attributes.position.count;i++){o.getVertexPosition(i,v);v.applyMatrix4(o.matrixWorld);crown=Math.max(crown,v.y);}}});const bounds=new T.Box3().setFromObject(coiffure);const target=coiffure.getWorldPosition(new T.Vector3);target.y+=crown+.065-bounds.max.y;coiffure.parent.worldToLocal(target);coiffure.position.copy(target);}return actor;
}
