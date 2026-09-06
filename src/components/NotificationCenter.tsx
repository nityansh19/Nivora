import { useMemo, useState } from 'react';
import { Bell, CheckCheck, CircleAlert, Info, Sparkles } from 'lucide-react';
import type { NivoraNotification } from '../domain/notifications';
import './notifications.css';

type Props={items:NivoraNotification[];onRead:(id:string)=>void;onReadAll:()=>void};
export default function NotificationCenter({items,onRead,onReadAll}:Props){
  const[filter,setFilter]=useState<'all'|'unread'>('all');
  const visible=useMemo(()=>filter==='unread'?items.filter(n=>!n.read):items,[items,filter]);
  const unread=items.filter(n=>!n.read).length;
  return <div className="content notification-content"><section className="hero-row"><div><p className="section-kicker">Your financial signal layer</p><p className="muted">Useful reminders and insights generated from your actual Nivora data.</p></div>{unread>0&&<button className="secondary-button" onClick={onReadAll}><CheckCheck size={16}/> Mark all read</button>}</section><div className="notification-tabs"><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>All <span>{items.length}</span></button><button className={filter==='unread'?'active':''} onClick={()=>setFilter('unread')}>Unread <span>{unread}</span></button></div>{visible.length?<div className="notification-list">{visible.map(item=><article key={item.id} className={`notification-item ${item.read?'read':''}`} onClick={()=>!item.read&&onRead(item.id)}><div className={`notification-icon ${item.severity}`}><Icon kind={item.kind}/></div><div className="notification-copy"><div className="notification-title"><strong>{item.title}</strong>{!item.read&&<i/>}</div><p>{item.body}</p><time>{new Date(item.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</time></div></article>)}</div>:<div className="panel notification-empty"><div className="notification-empty-icon"><Bell size={22}/></div><strong>{filter==='unread'?'You are all caught up.':'No notifications yet.'}</strong><span>Nivora will surface useful alerts only when your real activity gives it something meaningful to say.</span></div>}</div>}
function Icon({kind}:{kind:NivoraNotification['kind']}){return kind==='budget'?<CircleAlert size={18}/>:kind==='insight'?<Sparkles size={18}/>:<Info size={18}/>}
