import React, { useMemo, useState, useEffect } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, CalendarCheck2, GraduationCap, Home as HomeIcon, Library, NotebookPen, Plus, Trash2, User, TrendingUp, ExternalLink, Mail, AlertCircle, CheckCircle } from "lucide-react";

// --- Tipos ---
type Course = {
  id: string;
  nome: string;
  ch: number; // carga horária
  nota: number | ""; // 0-10
  periodo: string; // 2025.1 etc
  status: "Cursada" | "Em andamento" | "A cursar";
};

type Notification = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

// --- Utilidades ---
const fmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const uuid = () => Math.random().toString(36).slice(2);

function calcIRA(courses: Course[]) {
  // Modelo simples: média ponderada por CH, ignorando status "A cursar" e notas vazias
  const concl = courses.filter(c => c.status !== "A cursar" && c.nota !== "");
  const somaP = concl.reduce((acc, c) => acc + Number(c.nota) * c.ch, 0);
  const somaCH = concl.reduce((acc, c) => acc + c.ch, 0);
  if (somaCH === 0) return 0;
  return somaP / somaCH;
}

const seedData: Course[] = [
  { id: uuid(), nome: "Química Inorgânica (128h)", ch: 128, nota: 7, periodo: "2025.1", status: "Cursada" },
  { id: uuid(), nome: "Química Analítica (CLAE)", ch: 64, nota: 8, periodo: "2025.2", status: "Em andamento" },
  { id: uuid(), nome: "Termodinâmica de Processos", ch: 64, nota: "", periodo: "2026.1", status: "A cursar" },
];

const storeKey = "acadplanner.courses.v1";

export default function AcadPlannerApp() {
  const [tab, setTab] = useState("home");
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const raw = localStorage.getItem(storeKey);
      return raw ? JSON.parse(raw) : seedData;
    } catch {
      return seedData;
    }
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    localStorage.setItem(storeKey, JSON.stringify(courses));
  }, [courses]);

  const addNotification = (message: string, type: Notification["type"] = "info") => {
    const id = uuid();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const ira = useMemo(() => calcIRA(courses), [courses]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Notification System */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map(notification => (
          <NotificationToast 
            key={notification.id} 
            notification={notification} 
            onClose={() => removeNotification(notification.id)} 
          />
        ))}
      </div>

      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 grid place-items-center text-white font-bold">AP</div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">AcadPlanner</h1>
              <p className="text-xs text-gray-500 -mt-0.5">Planejador acadêmico • Davi Carvalho</p>
            </div>
          </div>
          <nav className="ml-auto flex gap-1 flex-wrap">
            <NavBtn icon={<HomeIcon className="w-4 h-4"/>} label="Início" active={tab==="home"} onClick={()=>setTab("home")} />
            <NavBtn icon={<CalendarCheck2 className="w-4 h-4"/>} label="Planejamento" active={tab==="planejamento"} onClick={()=>setTab("planejamento")} />
            <NavBtn icon={<Library className="w-4 h-4"/>} label="Resumos" active={tab==="resumos"} onClick={()=>setTab("resumos")} />
            <NavBtn icon={<GraduationCap className="w-4 h-4"/>} label="Portfólio" active={tab==="portfolio"} onClick={()=>setTab("portfolio")} />
            <NavBtn icon={<Mail className="w-4 h-4"/>} label="Contato" active={tab==="contato"} onClick={()=>setTab("contato")} />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {tab === "home" && (
            <motion.section key="home" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-8}} transition={{duration:0.25}}>
              <Hero ira={ira} />
              <QuickLinks onGo={setTab} />
            </motion.section>
          )}

          {tab === "planejamento" && (
            <motion.section key="plan" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-8}} transition={{duration:0.25}}>
              <Planner 
                courses={courses} 
                setCourses={setCourses} 
                ira={ira} 
                addNotification={addNotification}
              />
            </motion.section>
          )}

          {tab === "resumos" && (
            <motion.section key="resumos" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-8}} transition={{duration:0.25}}>
              <Resumos />
            </motion.section>
          )}

          {tab === "portfolio" && (
            <motion.section key="portfolio" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-8}} transition={{duration:0.25}}>
              <Portfolio />
            </motion.section>
          )}

          {tab === "contato" && (
            <motion.section key="contato" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-8}} transition={{duration:0.25}}>
              <Contato addNotification={addNotification} />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} AcadPlanner • Feito por Davi Carvalho
      </footer>
    </div>
  );
}

function NotificationToast({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  const bgColor = notification.type === "success" 
    ? "bg-green-100 border-green-400 text-green-800" 
    : notification.type === "error" 
      ? "bg-red-100 border-red-400 text-red-800" 
      : "bg-blue-100 border-blue-400 text-blue-800";
  
  const Icon = notification.type === "success" 
    ? CheckCircle 
    : AlertCircle;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`p-4 rounded-lg border ${bgColor} flex items-start gap-3 shadow-md`}
    >
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 text-sm">{notification.message}</div>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        &times;
      </button>
    </motion.div>
  );
}

function NavBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-sm transition-all ${active ? "bg-gray-900 text-white shadow" : "hover:bg-gray-200"}`}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function Hero({ ira }: { ira: number }) {
  return (
    <div className="grid lg:grid-cols-3 gap-5 items-stretch">
      <div className="lg:col-span-2 p-6 rounded-3xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-md">
        <h2 className="text-2xl font-semibold">Bem-vindo ao AcadPlanner</h2>
        <p className="mt-2 text-white/90 max-w-2xl">Seu hub pessoal para organização acadêmica: acompanhe disciplinas, calcule o IRA, escreva resumos de Química e mantenha seu portfólio sempre atualizado.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-white text-gray-900 rounded-2xl font-medium hover:opacity-90">Como funciona</button>
          <button className="px-4 py-2 bg-white/10 backdrop-blur rounded-2xl font-medium hover:bg-white/20">Ver roadmap</button>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white shadow-md">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5"/>
          <h3 className="font-semibold">Seu IRA (estimado)</h3>
        </div>
        <p className="text-4xl font-bold mt-3">{fmt.format(ira)}</p>
        <p className="text-sm text-gray-500">Média ponderada pelas cargas horárias das disciplinas concluídas/em andamento.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border p-3">
            <p className="text-xs text-gray-500">Disciplinas</p>
            <p className="text-lg font-semibold">Organize e acompanhe</p>
          </div>
          <div className="rounded-2xl border p-3">
            <p className="text-xs text-gray-500">Resumos</p>
            <p className="text-lg font-semibold">Orgânica, Inorgânica, Analítica…</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLinks({ onGo }: { onGo: (t: string)=>void }) {
  const items = [
    { icon: <CalendarCheck2 className="w-5 h-5"/>, title: "Planejamento Acadêmico", desc: "Monte sua grade, calcule IRA e acompanhe seu progresso.", to: "planejamento" },
    { icon: <BookOpen className="w-5 h-5"/>, title: "Resumos de Química", desc: "Anotações organizadas por disciplina e tema.", to: "resumos" },
    { icon: <GraduationCap className="w-5 h-5"/>, title: "Portfólio", desc: "Currículo, projetos e certificados.", to: "portfolio" },
    { icon: <Mail className="w-5 h-5"/>, title: "Contato", desc: "Fale comigo e encontre meus links.", to: "contato" },
  ];
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {items.map((it) => (
        <button 
          key={it.title} 
          onClick={()=>onGo(it.to)} 
          className="group rounded-3xl border p-4 text-left hover:shadow-md transition-all bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="w-10 h-10 rounded-2xl grid place-items-center bg-gray-900 text-white group-hover:scale-105 transition-transform">{it.icon}</div>
          <h4 className="mt-3 font-semibold">{it.title}</h4>
          <p className="text-sm text-gray-600">{it.desc}</p>
          <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium">Abrir <ExternalLink className="w-4 h-4"/></div>
        </button>
      ))}
    </div>
  );
}

function Planner({ courses, setCourses, ira, addNotification }: { courses: Course[]; setCourses: (c: Course[])=>void; ira: number; addNotification: (msg: string, type?: "success" | "error" | "info") => void }) {
  const [novo, setNovo] = useState<Course>({ id: uuid(), nome: "", ch: 64, nota: "", periodo: new Date().getFullYear() + ".1", status: "A cursar"});

  function validateCourse(course: Course): boolean {
    if (!course.nome.trim()) {
      addNotification("Nome da disciplina é obrigatório", "error");
      return false;
    }
    
    if (course.ch <= 0) {
      addNotification("Carga horária deve ser maior que zero", "error");
      return false;
    }
    
    if (course.status === "Cursada" && (course.nota === "" || Number(course.nota) < 0 || Number(course.nota) > 10)) {
      addNotification("Nota deve estar entre 0 e 10 para disciplinas cursadas", "error");
      return false;
    }
    
    if (!course.periodo.match(/^\d{4}\.[12]$/)) {
      addNotification("Período deve estar no formato AAAA.S (ex: 2025.1)", "error");
      return false;
    }
    
    return true;
  }

  function addCourse() {
    if (!validateCourse(novo)) return;
    
    setCourses([{...novo, id: uuid()}, ...courses]);
    setNovo({ id: uuid(), nome: "", ch: 64, nota: "", periodo: novo.periodo, status: "A cursar"});
    addNotification("Disciplina adicionada com sucesso", "success");
  }

  function update(id: string, patch: Partial<Course>) {
    const updatedCourse = {...courses.find(c => c.id === id), ...patch} as Course;
    
    if (!validateCourse(updatedCourse)) return;
    
    setCourses(courses.map(c => c.id === id ? updatedCourse : c));
    addNotification("Disciplina atualizada com sucesso", "success");
  }
  
  function remove(id: string) {
    setCourses(courses.filter(c => c.id !== id));
    addNotification("Disciplina removida com sucesso", "success");
  }

  const concluidas = courses.filter(c=>c.status === "Cursada").length;
  const andamento = courses.filter(c=>c.status === "Em andamento").length;
  const futuras = courses.filter(c=>c.status === "A cursar").length;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Stat title="IRA atual (estimado)" value={fmt.format(ira)} />
        <Stat title="Cursadas" value={String(concluidas)} />
        <Stat title="Em andamento" value={String(andamento)} />
        <Stat title="A cursar" value={String(futuras)} />
      </div>

      <div className="rounded-3xl border bg-white p-4">
        <h3 className="font-semibold flex items-center gap-2"><NotebookPen className="w-4 h-4"/>Adicionar disciplina</h3>
        <div className="grid md:grid-cols-6 gap-3 mt-3">
          <input 
            value={novo.nome} 
            onChange={e=>setNovo({...novo, nome:e.target.value})} 
            placeholder="Nome da disciplina" 
            className="md:col-span-2 rounded-xl border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
          />
          <input 
            type="number" 
            min="1"
            value={novo.ch} 
            onChange={e=>setNovo({...novo, ch:Number(e.target.value)})} 
            className="rounded-xl border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            placeholder="CH" 
          />
          <input 
            type="number" 
            step="0.1" 
            min="0"
            max="10"
            value={novo.nota as any} 
            onChange={e=>setNovo({...novo, nota:e.target.value===""?"":Number(e.target.value)})} 
            className="rounded-xl border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            placeholder="Nota (0-10)" 
          />
          <input 
            value={novo.periodo} 
            onChange={e=>setNovo({...novo, periodo:e.target.value})} 
            className="rounded-xl border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            placeholder="Período (ex: 2025.2)" 
          />
          <select 
            value={novo.status} 
            onChange={e=>setNovo({...novo, status:e.target.value as any})} 
            className="rounded-xl border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option>A cursar</option>
            <option>Em andamento</option>
            <option>Cursada</option>
          </select>
          <button 
            onClick={addCourse} 
            className="rounded-xl bg-gray-900 text-white px-3 py-2 flex items-center justify-center gap-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            <Plus className="w-4 h-4"/>Adicionar
          </button>
        </div>
      </div>

      <div className="rounded-3xl border bg-white overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-semibold">Suas disciplinas</h3>
          <p className="text-sm text-gray-500">Edite diretamente nas células</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Disciplina</Th>
                <Th className="w-28">CH</Th>
                <Th className="w-32">Nota</Th>
                <Th className="w-28">Período</Th>
                <Th className="w-40">Status</Th>
                <Th className="w-16"></Th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhuma disciplina cadastrada. Adicione sua primeira disciplina acima.
                  </td>
                </tr>
              ) : (
                courses.map(c => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <Td>
                      <input 
                        value={c.nome} 
                        onChange={e=>update(c.id,{nome:e.target.value})} 
                        className="w-full bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 px-1 py-1 rounded"
                      />
                    </Td>
                    <Td>
                      <input 
                        type="number" 
                        min="1"
                        value={c.ch} 
                        onChange={e=>update(c.id,{ch:Number(e.target.value)})} 
                        className="w-full bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 px-1 py-1 rounded text-center" 
                      />
                    </Td>
                    <Td>
                      <input 
                        type="number" 
                        step="0.1" 
                        min="0"
                        max="10"
                        value={c.nota as any} 
                        onChange={e=>update(c.id,{nota:e.target.value===""?"":Number(e.target.value)})} 
                        className="w-full bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 px-1 py-1 rounded text-center" 
                      />
                    </Td>
                    <Td>
                      <input 
                        value={c.periodo} 
                        onChange={e=>update(c.id,{periodo:e.target.value})} 
                        className="w-full bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 px-1 py-1 rounded text-center" 
                      />
                    </Td>
                    <Td>
                      <select 
                        value={c.status} 
                        onChange={e=>update(c.id,{status:e.target.value as any})} 
                        className="w-full bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 px-1 py-1 rounded"
                      >
                        <option>Cursada</option>
                        <option>Em andamento</option>
                        <option>A cursar</option>
                      </select>
                    </Td>
                    <Td>
                      <button 
                        onClick={()=>{
                          if (window.confirm("Tem certeza que deseja remover esta disciplina?")) {
                            remove(c.id);
                          }
                        }} 
                        className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                        aria-label="Remover disciplina"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left font-medium px-4 py-3 ${className}`}>{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function Resumos() {
  const categorias = [
    { titulo: "Química Orgânica", temas: ["Funções orgânicas", "Mecanismos de substituição (SN1/SN2)", "Espectroscopia (IR, RMN)"] },
    { titulo: "Química Inorgânica", temas: ["Compostos de coordenação", "Isomeria", "Ligação metálica"] },
    { titulo: "Química Analítica", temas: ["CLAE/HPLC", "Gravimetria", "Volumetria"] },
    { titulo: "Termodinâmica", temas: ["1ª e 2ª Leis", "Equilíbrios de fase", "Propriedades de misturas"] },
  ];
  
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-white p-5">
        <h3 className="font-semibold">Resumos por disciplina</h3>
        <p className="text-sm text-gray-600">Crie posts de estudo, adicione imagens e fórmulas. Dica: no Wix, ative o <b>Blog</b> e use categorias com estes nomes.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categorias.map(cat => (
          <div key={cat.titulo} className="rounded-3xl border bg-white p-4 hover:shadow-md transition-shadow">
            <h4 className="font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4"/>{cat.titulo}</h4>
            <ul className="mt-2 text-sm text-gray-600 list-disc ml-5">
              {cat.temas.map(t => <li key={t}>{t}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function Portfolio() {
  const itens = [
    { titulo: "Estágio obrigatório – Biblioteca Universitária", desc: "Atividades administrativas e apoio acadêmico.", chips: ["Administração", "Organização" ] },
    { titulo: "Projeto: Simulador de IRA", desc: "Ferramenta web para cálculo e visualização de IRA.", chips: ["React", "Cálculo ponderado"] },
    { titulo: "Relatório: CLAE (HPLC)", desc: "Resumo técnico com figuras e bibliografia.", chips: ["Analítica", "Métodos instrumentais"] },
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {itens.map(card => (
          <div key={card.titulo} className="rounded-3xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-semibold">{card.titulo}</h4>
            <p className="text-sm text-gray-600 mt-1">{card.desc}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {card.chips.map(c => <span key={c} className="px-2 py-1 rounded-xl text-xs bg-gray-100">{c}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-3xl border bg-white p-5">
        <h4 className="font-semibold">Currículo rápido</h4>
        <ul className="mt-2 text-sm text-gray-700 list-disc ml-5">
          <li>Graduando em Engenharia Química — UFC</li>
          <li>Técnico em Administração e Química</li>
          <li>Interesses: organização acadêmica, química aplicada, ferramentas educacionais</li>
        </ul>
      </div>
    </div>
  );
}

function Contato({ addNotification }: { addNotification: (msg: string, type?: "success" | "error" | "info") => void }) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.email.trim() || !formData.mensagem.trim()) {
      addNotification("Por favor, preencha todos os campos", "error");
      return;
    }
    
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      addNotification("Por favor, insira um email válido", "error");
      return;
    }
    
    // Simulate form submission
    addNotification("Mensagem enviada com sucesso! Em breve retornarei o contato.", "success");
    setFormData({ nome: "", email: "", mensagem: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-2xl">
      <div className="rounded-3xl border bg-white p-6">
        <h3 className="font-semibold">Fale comigo</h3>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
          <input 
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Seu nome" 
            className="rounded-xl border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
          />
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Seu e-mail" 
            className="rounded-xl border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
          />
          <textarea 
            name="mensagem"
            value={formData.mensagem}
            onChange={handleChange}
            placeholder="Mensagem" 
            rows={5} 
            className="rounded-xl border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
          />
          <button 
            type="submit"
            className="rounded-xl bg-gray-900 text-white px-4 py-2 w-fit hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            Enviar
          </button>
        </form>
        <div className="mt-6 text-sm text-gray-600">
          <p>E-mail: seuemail@exemplo.com</p>
          <p>LinkedIn: linkedin.com/in/davi-carvalho</p>
        </div>
      </div>
    </div>
  );
}