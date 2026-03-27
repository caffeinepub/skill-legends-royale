import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Pencil,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { CatalogEntry } from "./backend";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useBranchMutations,
  useBranches,
  useHeroMutations,
  useHeroes,
  useIsAdmin,
  useItemMutations,
  useItems,
} from "./hooks/useQueries";

// ─── Catalog Card ────────────────────────────────────────────────────────────
function CatalogCard({ entry, index }: { entry: CatalogEntry; index: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.6) }}
      className="group flex flex-col rounded-xl overflow-hidden border border-gold/20 bg-navy-card hover:border-gold/70 hover:shadow-gold transition-all duration-300 cursor-pointer"
    >
      <div className="relative aspect-square w-full bg-navy-deep overflow-hidden">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-navy-mid">
            <span className="text-gold/40 text-xs text-center px-2 font-display font-bold uppercase leading-tight">
              {entry.name}
            </span>
          </div>
        ) : (
          <img
            src={entry.imageUrl}
            alt={entry.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        )}
      </div>
      <div className="px-2 py-2 text-center">
        <p className="text-white font-display font-bold uppercase text-[11px] tracking-wide leading-tight line-clamp-2">
          {entry.name}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Card Skeleton ────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-gold/10 bg-navy-card">
      <Skeleton className="aspect-square w-full bg-navy-mid" />
      <div className="px-2 py-2">
        <Skeleton className="h-3 w-3/4 mx-auto bg-navy-mid" />
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
function Section({
  id,
  icon,
  title,
  items,
  isLoading,
  cols = "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8",
}: {
  id: string;
  icon: string;
  title: string;
  items?: CatalogEntry[];
  isLoading: boolean;
  cols?: string;
}) {
  return (
    <section id={id} className="py-12 scroll-mt-20">
      <div className="flex items-center gap-4 mb-8">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-3xl font-display font-black uppercase text-white tracking-wider">
          {title}
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-gold/50 to-transparent" />
      </div>

      <div className={`grid ${cols} gap-3`}>
        {isLoading
          ? Array.from({ length: 12 }, (_, i) => `sk-${i}`).map((k) => (
              <CardSkeleton key={k} />
            ))
          : items?.map((entry, i) => (
              <CatalogCard key={entry.id} entry={entry} index={i} />
            ))}
      </div>

      {!isLoading && items?.length === 0 && (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid={`${id}.empty_state`}
        >
          <p className="text-lg font-display">Нет данных</p>
        </div>
      )}
    </section>
  );
}

// ─── Entry Form ───────────────────────────────────────────────────────────────
function EntryForm({
  onSubmit,
  isPending,
  initial,
  onCancel,
  ocidPrefix,
}: {
  onSubmit: (name: string, imageUrl: string) => void;
  isPending: boolean;
  initial?: { name: string; imageUrl: string };
  onCancel?: () => void;
  ocidPrefix: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), imageUrl.trim());
    if (!initial) {
      setName("");
      setImageUrl("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div>
        <Label className="text-xs text-muted-foreground">Название</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название..."
          className="bg-navy-deep border-gold/20 text-white placeholder:text-muted-foreground"
          data-ocid={`${ocidPrefix}.input`}
        />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">URL изображения</Label>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="bg-navy-deep border-gold/20 text-white placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex gap-2 mt-1">
        <Button
          type="submit"
          disabled={isPending || !name.trim()}
          size="sm"
          className="bg-gold text-navy-deep font-bold hover:bg-gold-bright flex-1"
          data-ocid={`${ocidPrefix}.submit_button`}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Check className="h-3 w-3 mr-1" />
          )}
          {initial ? "Сохранить" : "Добавить"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="border-gold/30 text-muted-foreground hover:text-white"
            data-ocid={`${ocidPrefix}.cancel_button`}
          >
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}

// ─── CMS Tab ──────────────────────────────────────────────────────────────────
function CmsTab({
  entries,
  isLoading,
  mutations,
  ocidPrefix,
}: {
  entries?: CatalogEntry[];
  isLoading: boolean;
  mutations: ReturnType<typeof useHeroMutations>;
  ocidPrefix: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = useCallback(
    async (name: string, imageUrl: string) => {
      try {
        await mutations.add.mutateAsync({ name, imageUrl });
        toast.success("Добавлено!");
      } catch {
        toast.error("Ошибка при добавлении");
      }
    },
    [mutations.add],
  );

  const handleUpdate = useCallback(
    async (id: string, name: string, imageUrl: string) => {
      try {
        await mutations.update.mutateAsync({ id, name, imageUrl });
        setEditingId(null);
        toast.success("Обновлено!");
      } catch {
        toast.error("Ошибка при обновлении");
      }
    },
    [mutations.update],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await mutations.remove.mutateAsync({ id });
        toast.success("Удалено!");
      } catch {
        toast.error("Ошибка при удалении");
      }
    },
    [mutations.remove],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-gold/20 rounded-lg p-3 bg-navy-deep">
        <p className="text-xs font-bold text-gold uppercase mb-3 tracking-wider">
          Добавить новую запись
        </p>
        <EntryForm
          onSubmit={handleAdd}
          isPending={mutations.add.isPending}
          ocidPrefix={`${ocidPrefix}.add`}
        />
      </div>

      <div>
        <p className="text-xs font-bold text-gold uppercase mb-2 tracking-wider">
          Список ({entries?.length ?? 0})
        </p>
        {isLoading ? (
          <div
            className="flex items-center justify-center py-8"
            data-ocid={`${ocidPrefix}.loading_state`}
          >
            <Loader2 className="h-5 w-5 animate-spin text-gold" />
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="flex flex-col gap-2 pr-2">
              {entries?.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="border border-gold/15 rounded-lg p-2 bg-navy-card"
                  data-ocid={`${ocidPrefix}.item.${idx + 1}`}
                >
                  {editingId === entry.id ? (
                    <EntryForm
                      initial={{ name: entry.name, imageUrl: entry.imageUrl }}
                      onSubmit={(name, imageUrl) =>
                        handleUpdate(entry.id, name, imageUrl)
                      }
                      isPending={mutations.update.isPending}
                      onCancel={() => setEditingId(null)}
                      ocidPrefix={`${ocidPrefix}.edit`}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <img
                        src={entry.imageUrl}
                        alt={entry.name}
                        className="w-8 h-8 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <span className="text-white text-xs font-bold flex-1 truncate">
                        {entry.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingId(entry.id)}
                        className="p-1 text-muted-foreground hover:text-gold transition-colors"
                        data-ocid={`${ocidPrefix}.edit_button`}
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        data-ocid={`${ocidPrefix}.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

// ─── CMS Panel ────────────────────────────────────────────────────────────────
function CmsPanel({
  isOpen,
  onClose,
}: { isOpen: boolean; onClose: () => void }) {
  const { data: heroes, isLoading: heroesLoading } = useHeroes();
  const { data: branches, isLoading: branchesLoading } = useBranches();
  const { data: items, isLoading: itemsLoading } = useItems();
  const heroMutations = useHeroMutations();
  const branchMutations = useBranchMutations();
  const itemMutations = useItemMutations();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-navy-mid border-l border-gold/20 z-50 flex flex-col"
            data-ocid="cms.panel"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-gold/20">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-gold" />
                <h2 className="text-lg font-display font-black uppercase text-gold tracking-wider">
                  Управление
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-muted-foreground hover:text-white rounded transition-colors"
                data-ocid="cms.close_button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-4">
              <Tabs defaultValue="heroes">
                <TabsList className="grid w-full grid-cols-3 bg-navy-deep mb-4">
                  <TabsTrigger
                    value="heroes"
                    className="text-xs font-display font-bold uppercase"
                    data-ocid="cms.heroes.tab"
                  >
                    Герои
                  </TabsTrigger>
                  <TabsTrigger
                    value="branches"
                    className="text-xs font-display font-bold uppercase"
                    data-ocid="cms.branches.tab"
                  >
                    Ветки
                  </TabsTrigger>
                  <TabsTrigger
                    value="items"
                    className="text-xs font-display font-bold uppercase"
                    data-ocid="cms.items.tab"
                  >
                    Предметы
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="heroes">
                  <CmsTab
                    entries={heroes}
                    isLoading={heroesLoading}
                    mutations={heroMutations}
                    ocidPrefix="cms.heroes"
                  />
                </TabsContent>
                <TabsContent value="branches">
                  <CmsTab
                    entries={branches}
                    isLoading={branchesLoading}
                    mutations={
                      branchMutations as ReturnType<typeof useHeroMutations>
                    }
                    ocidPrefix="cms.branches"
                  />
                </TabsContent>
                <TabsContent value="items">
                  <CmsTab
                    entries={items}
                    isLoading={itemsLoading}
                    mutations={
                      itemMutations as ReturnType<typeof useHeroMutations>
                    }
                    ocidPrefix="cms.items"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ onAdminOpen }: { onAdminOpen: () => void }) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 border-b border-gold/10"
      style={{ background: "oklch(0.09 0.022 260 / 92%)" }}
    >
      <div className="backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Shield className="h-7 w-7 text-gold flex-shrink-0" />
            <span className="font-display font-black uppercase tracking-widest text-gold text-sm sm:text-base leading-tight">
              Skill Legends
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> </span>Royale
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { id: "heroes", label: "Персонажи" },
              { id: "branches", label: "Ветки школы" },
              { id: "items", label: "Предметы" },
            ].map((link) => (
              <button
                type="button"
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground hover:text-gold transition-colors"
                data-ocid={`nav.${link.id}.link`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isAdmin && (
              <button
                type="button"
                onClick={onAdminOpen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold/40 text-gold hover:bg-gold/10 transition-all text-xs font-display font-bold uppercase tracking-wider"
                data-ocid="header.admin.button"
              >
                <Lock className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Панель</span>
              </button>
            )}

            {isLoggedIn ? (
              <button
                type="button"
                onClick={clear}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-card border border-gold/20 text-muted-foreground hover:text-white hover:border-gold/40 transition-all text-xs font-display font-bold uppercase tracking-wider"
                data-ocid="header.logout.button"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={login}
                disabled={isLoggingIn}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-display font-bold uppercase tracking-wider text-xs text-navy-deep transition-all disabled:opacity-60"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.82 0.15 78), oklch(0.68 0.13 70))",
                }}
                data-ocid="header.login.button"
              >
                {isLoggingIn ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogIn className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Войти</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [cmsOpen, setCmsOpen] = useState(false);
  const { data: heroes, isLoading: heroesLoading } = useHeroes();
  const { data: branches, isLoading: branchesLoading } = useBranches();
  const { data: items, isLoading: itemsLoading } = useItems();

  const sortedHeroes = heroes
    ? [...heroes].sort((a, b) => Number(a.order - b.order))
    : undefined;
  const sortedBranches = branches
    ? [...branches].sort((a, b) => Number(a.order - b.order))
    : undefined;
  const sortedItems = items
    ? [...items].sort((a, b) => Number(a.order - b.order))
    : undefined;

  return (
    <div className="min-h-screen bg-navy-deep">
      <Toaster />

      <Header onAdminOpen={() => setCmsOpen(true)} />

      <main className="pt-16">
        {/* Hero Banner */}
        <div
          className="relative py-20 px-4 text-center overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.09 0.025 265) 0%, oklch(0.11 0.028 260) 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 0%, oklch(0.77 0.14 75) 0%, transparent 70%)",
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-10 w-10 text-gold" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-display font-black uppercase tracking-widest text-white mb-3">
              Skill Legends
              <span className="block text-gold">Royale</span>
            </h1>
            <p className="text-muted-foreground font-body max-w-md mx-auto text-sm">
              Полный справочник персонажей, школьных веток и предметов
            </p>
          </motion.div>

          {/* Mobile nav */}
          <div className="flex md:hidden items-center justify-center gap-3 mt-6">
            {[
              { id: "heroes", label: "Персонажи" },
              { id: "branches", label: "Ветки" },
              { id: "items", label: "Предметы" },
            ].map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors border border-gold/20 rounded px-3 py-1"
                data-ocid={`mobile.nav.${link.id}.link`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-7xl mx-auto px-4">
          <Section
            id="heroes"
            icon="⚔️"
            title="Персонажи"
            items={sortedHeroes}
            isLoading={heroesLoading}
            cols="grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
          />

          <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent my-4" />

          <Section
            id="branches"
            icon="🌿"
            title="Ветки школы"
            items={sortedBranches}
            isLoading={branchesLoading}
            cols="grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7"
          />

          <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent my-4" />

          <Section
            id="items"
            icon="🎒"
            title="Предметы"
            items={sortedItems}
            isLoading={itemsLoading}
            cols="grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12"
          />
        </div>
      </main>

      <footer className="mt-16 border-t border-gold/10 py-8 text-center">
        <p className="text-muted-foreground text-sm font-body">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-bright transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <CmsPanel isOpen={cmsOpen} onClose={() => setCmsOpen(false)} />
    </div>
  );
}
