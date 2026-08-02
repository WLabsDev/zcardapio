"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useBackToClose } from "@/hooks/use-back-to-close";

type AdminPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

type PostForm = {
  title: string;
  excerpt: string;
  content: string;
  published: boolean;
};

const emptyForm: PostForm = {
  title: "",
  excerpt: "",
  content: "",
  published: false,
};

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPost | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useBackToClose(dialogOpen, () => setDialogOpen(false));

  const load = useCallback(() => {
    fetch("/api/admin/posts")
      .then((res) => res.json())
      .then((data) => {
        if (data?.posts) setPosts(data.posts);
      })
      .catch(() => {});
  }, []);

  useEffect(load, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (post: AdminPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      published: post.published,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (form.title.trim().length < 2) {
      toast.error("Informe um título.");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content,
      published: form.published,
    };
    const res = await fetch(
      editing ? `/api/admin/posts/${editing.id}` : "/api/admin/posts",
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    ).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível salvar o post.");
      return;
    }
    setDialogOpen(false);
    toast.success(editing ? "Post atualizado!" : "Post criado!");
    load();
  };

  const remove = async (post: AdminPost) => {
    if (!window.confirm(`Excluir o post "${post.title}"?`)) return;
    const res = await fetch(`/api/admin/posts/${post.id}`, {
      method: "DELETE",
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível excluir o post.");
      return;
    }
    toast.success("Post excluído.");
    load();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Blog</h2>
          <p className="text-sm text-muted-foreground">
            Artigos do blog público (zcardapio.com.br/blog) — foco em SEO.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          Novo post
        </Button>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nenhum post ainda. Crie o primeiro artigo para começar a atrair
          restaurantes pela busca.
        </p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/60"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-bold">{post.title}</h3>
                  <Badge
                    variant="outline"
                    className={
                      post.published
                        ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {post.published ? "Publicado" : "Rascunho"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  /blog/{post.slug}
                  {post.publishedAt ? ` · ${shortDate(post.publishedAt)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {post.published && (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    title="Ver no site"
                  >
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <ExternalLink className="size-4" />
                    </Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(post)}
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => remove(post)}
                  title="Excluir"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(o: boolean) => !o && setDialogOpen(false)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar post" : "Novo post"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="btitle">Título</Label>
              <Input
                id="btitle"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Ex.: Cardápio no WhatsApp: por que o PDF perde vendas"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bexcerpt">Resumo (aparece na lista e no Google)</Label>
              <Textarea
                id="bexcerpt"
                rows={2}
                value={form.excerpt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, excerpt: e.target.value }))
                }
                placeholder="Uma ou duas frases que resumem o artigo."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bcontent">Conteúdo (Markdown)</Label>
              <Textarea
                id="bcontent"
                rows={14}
                className="font-mono text-sm"
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder={"## Introdução\n\nEscreva aqui... Use ## para subtítulos, - para listas e [texto](https://link) para links."}
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Publicado</p>
                <p className="text-xs text-muted-foreground">
                  Rascunhos só aparecem aqui no admin; publicados vão ao ar no
                  blog e no sitemap.
                </p>
              </div>
              <Switch
                checked={form.published}
                onCheckedChange={(v: boolean) =>
                  setForm((f) => ({ ...f, published: v }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving}>
              {saving ? "Salvando..." : editing ? "Salvar" : "Criar post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
