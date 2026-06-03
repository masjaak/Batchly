import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useRecipe, useCreateRecipe, useAddRecipeItem, useRemoveRecipeItem, useDuplicateRecipe, useDeleteRecipe } from '@/hooks/useRecipes'
import { useIngredients } from '@/hooks/useIngredients'
import { useCreateProduct } from '@/hooks/useProducts'
import { useAuth } from '@/hooks/useAuth'
import { calculateRecipeCost, findCheaperAlternatives, formatCurrency } from '@/lib/calculations'
import { toast } from 'sonner'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { StatCard } from '@/components/ui/StatCard'
import { cn } from '@/lib/utils'

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { organization } = useAuth()
  const isNew = id === 'new'

  const { data: recipe, isLoading } = useRecipe(id ?? '')
  const { data: allIngredients } = useIngredients()
  const { mutateAsync: createRecipe } = useCreateRecipe()
  const { mutateAsync: addItem } = useAddRecipeItem()
  const { mutateAsync: removeItem } = useRemoveRecipeItem()
  const { mutateAsync: duplicate } = useDuplicateRecipe()
  const { mutateAsync: deleteRecipe } = useDeleteRecipe()
  const { mutateAsync: createProduct } = useCreateProduct()

  const [name, setName] = useState(recipe?.name ?? '')
  const [yieldAmt, setYieldAmt] = useState(String(recipe?.yield_amount ?? 1))
  const [yieldUnit, setYieldUnit] = useState(recipe?.yield_unit ?? 'pcs')
  const [overhead, setOverhead] = useState(String(recipe?.overhead_pct ?? 0))
  const [packaging, setPackaging] = useState(String(recipe?.packaging_cost ?? 0))
  const [selling, setSelling] = useState(String(recipe?.selling_price ?? 0))
  const [selIngredient, setSelIngredient] = useState('')
  const [selQty, setSelQty] = useState('')
  const [items, setItems] = useState<any[]>(recipe?.recipe_items ?? [])

  const cost = calculateRecipeCost(
    { overhead_pct: Number(overhead), packaging_cost: Number(packaging), selling_price: Number(selling), yield_amount: Number(yieldAmt) },
    items.map((i) => ({ quantity: i.quantity, cost_at_create: i.cost_at_create })),
  )

  const handleSave = async () => {
    if (!organization) return
    try {
      const newRecipe = await createRecipe({
        organization_id: organization.id,
        name,
        yield_amount: Number(yieldAmt),
        yield_unit: yieldUnit,
        overhead_pct: Number(overhead),
        packaging_cost: Number(packaging),
        selling_price: Number(selling),
      })

      for (const item of items) {
        await addItem({
          organization_id: organization.id,
          recipe_id: newRecipe.id,
          ingredient_id: item.ingredient_id,
          quantity: item.quantity,
          unit: item.unit,
          cost_at_create: item.cost_at_create,
        })
      }

      toast.success('Resep berhasil disimpan')
      navigate(`/app/recipes/${newRecipe.id}`)
    } catch {
      toast.error('Gagal menyimpan resep')
    }
  }

  const handleAddIngredient = () => {
    if (!selIngredient || !selQty) return
    const ing = allIngredients?.find((i) => i.id === selIngredient)
    if (!ing) return

    setItems((prev) => [
      ...prev,
      {
        ingredient_id: ing.id,
        name: ing.name,
        quantity: Number(selQty),
        unit: ing.unit,
        cost_at_create: ing.latest_price,
      },
    ])
    setSelIngredient('')
    setSelQty('')
  }

  const handleDuplicate = async () => {
    if (!id) return
    try {
      const dup = await duplicate(id)
      toast.success('Resep diduplikasi')
      navigate(`/app/recipes/${dup.id}`)
    } catch {
      toast.error('Gagal menduplikasi resep')
    }
  }

  const handleCreateProduct = async () => {
    if (!organization || !id || id === 'new') return
    try {
      await createProduct({
        organization_id: organization.id,
        recipe_id: id,
        name,
        unit: yieldUnit,
        default_price: Number(selling),
      })
      toast.success('Produk berhasil dibuat')
      navigate('/app/products')
    } catch {
      toast.error('Gagal membuat produk')
    }
  }

  if (!isNew && isLoading) {
    return <div className="h-32 animate-pulse rounded-2xl bg-surface-muted border border-border" />
  }

  const healthy = cost.margin >= 30
  const ok = cost.margin >= 10

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/app/recipes" className="inline-flex items-center gap-1 text-sm font-semibold text-secondary transition-colors hover:text-ink">
          <Icon name="chevron-left" size={14} /> Kembali ke Resep
        </Link>
        <div className="flex items-center gap-2">
          {id && id !== 'new' && (
            <Button variant="secondary" size="sm" onClick={handleDuplicate}>
              <Icon name="copy" size={14} /> Duplikat
            </Button>
          )}
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender text-grape">
            <Icon name="chef" size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary">{isNew ? 'Baru' : 'Edit'}</p>
            <input
              placeholder="Nama Resep"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-2xl font-semibold tracking-tight text-ink outline-none placeholder:text-tertiary"
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary">Hasil</label>
            <input
              type="number"
              value={yieldAmt}
              onChange={(e) => setYieldAmt(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary">Satuan Hasil</label>
            <Select
              value={yieldUnit}
              onValueChange={setYieldUnit}
              options={[
                { value: 'pcs', label: 'pcs' },
                { value: 'box', label: 'box' },
                { value: 'jar', label: 'jar' },
                { value: 'kg', label: 'kg' },
                { value: 'liter', label: 'liter' },
              ]}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary">Harga Jual (Rp)</label>
            <input
              type="number"
              value={selling}
              onChange={(e) => setSelling(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="HPP / unit" value={formatCurrency(cost.perUnitHpp)} icon="wallet" tone="lavender" />
        <StatCard label="Bahan" value={formatCurrency(cost.productionCost)} icon="box" tone="pink" />
        <StatCard label="Overhead" value={formatCurrency(cost.overheadCost)} icon="gear" tone="yellow" />
        <StatCard label="Margin" value={`${cost.margin.toFixed(0)}%`} icon={healthy ? 'trending-up' : 'trending-down'} tone={healthy ? 'mint' : ok ? 'yellow' : 'pink'} />
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink text-pink-strong">
            <Icon name="box" size={18} />
          </span>
          <CardHeader title="Bahan" subtitle="Tambahkan bahan dan jumlah yang dipakai." />
        </div>

        <div className="mt-5 space-y-2">
          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-surface-muted px-4 py-6 text-center text-sm text-secondary">
              Belum ada bahan. Tambahkan bahan di bawah.
            </p>
          ) : (
            items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lavender text-grape">
                  <Icon name="leaf" size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                  <p className="text-xs text-secondary tnum">
                    {item.quantity} {item.unit} · {formatCurrency(item.cost_at_create)}/{item.unit}
                  </p>
                </div>
                <span className="text-sm font-semibold text-ink tnum">{formatCurrency(item.quantity * item.cost_at_create)}</span>
                <button
                  onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-pink hover:text-pink-strong"
                  aria-label="Hapus"
                >
                  <Icon name="trash" size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Select
            value={selIngredient}
            onValueChange={setSelIngredient}
            className="flex-1"
            placeholder="Pilih bahan..."
            options={(allIngredients ?? []).map((ing) => ({ value: ing.id, label: `${ing.name} (${formatCurrency(ing.latest_price)}/${ing.unit})` }))}
          />
          <input
            type="number"
            placeholder="Jml"
            value={selQty}
            onChange={(e) => setSelQty(e.target.value)}
            className="h-10 w-24 rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
          />
          <Button onClick={handleAddIngredient}><Icon name="plus" size={14} /></Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow text-yellow-strong">
            <Icon name="gear" size={18} />
          </span>
          <CardHeader title="Biaya Tambahan" subtitle="Overhead, kemasan, dan ringkasan HPP." />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary">Overhead (%)</label>
            <input
              type="number"
              value={overhead}
              onChange={(e) => setOverhead(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary">Biaya Kemasan (Rp)</label>
            <input
              type="number"
              value={packaging}
              onChange={(e) => setPackaging(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
            />
          </div>
        </div>

        <div className="mt-5 space-y-2 rounded-2xl border border-border bg-surface-muted p-4">
          <div className="flex justify-between text-sm"><span className="text-secondary">Biaya Bahan</span><span className="font-medium tnum text-ink">{formatCurrency(cost.productionCost)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-secondary">Overhead</span><span className="font-medium tnum text-ink">{formatCurrency(cost.overheadCost)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-secondary">Kemasan</span><span className="font-medium tnum text-ink">{formatCurrency(cost.packagingCost)}</span></div>
          <div className="flex justify-between text-sm border-t border-border pt-2"><span className="font-semibold text-ink">Total HPP</span><span className="font-semibold tnum text-ink">{formatCurrency(cost.totalHpp)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-secondary">HPP per unit</span><span className="font-semibold tnum text-ink">{formatCurrency(cost.perUnitHpp)}</span></div>
          {Number(selling) > 0 && (
            <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
              <span className="font-semibold text-ink">Margin</span>
              <span className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tnum',
                healthy ? 'bg-mint text-mint-strong' : ok ? 'bg-yellow text-yellow-strong' : 'bg-pink text-pink-strong',
              )}>
                <Icon name={healthy ? 'trending-up' : 'trending-down'} size={11} />
                {cost.margin.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </Card>

      {id && id !== 'new' && items.length > 0 && (() => {
        const optimisations = items
          .map((item) => {
            const ing = allIngredients?.find((i: any) => i.id === item.ingredient_id)
            if (!ing) return null
            const alternatives = findCheaperAlternatives(
              item.ingredient_id,
              (ing as any).category?.name ?? null,
              item.cost_at_create,
              allIngredients as any[],
            )
            if (alternatives.length === 0) return null
            return { item, ing, alternatives }
          })
          .filter(Boolean) as any[]

        if (optimisations.length === 0) return null
        const totalSavings = optimisations.reduce((s, o) => s + (o.item.cost_at_create - o.alternatives[0].price) * o.item.quantity, 0)

        return (
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border bg-mint/30 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-mint-strong">
                    <Icon name="sparkles" size={18} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">Saran Optimasi</h3>
                    <p className="text-sm text-secondary">Bahan yang bisa diganti dengan alternatif lebih murah</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-mint-strong">
                  Hemat {formatCurrency(totalSavings)}
                </span>
              </div>
            </div>
            <div className="space-y-2 p-5">
              {optimisations.map(({ item, ing, alternatives }) => {
                const savings = (item.cost_at_create - alternatives[0].price) * item.quantity
                return (
                  <div key={item.id ?? item.ingredient_id} className="rounded-2xl border border-border bg-surface p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink">{ing.name}</p>
                        <p className="text-xs text-secondary">
                          Ganti {alternatives[0].name} — hemat {formatCurrency(savings)}/batch
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            if (item.id) await removeItem(item.id)
                            await addItem({
                              organization_id: organization!.id,
                              recipe_id: id!,
                              ingredient_id: alternatives[0].ingredientId,
                              quantity: item.quantity,
                              unit: alternatives[0].unit,
                              cost_at_create: alternatives[0].price,
                            })
                            toast.success(`Bahan diganti ke ${alternatives[0].name}`)
                          } catch {
                            toast.error('Gagal mengganti bahan')
                          }
                        }}
                        className="text-xs font-semibold text-ink underline"
                      >
                        Ganti
                      </button>
                    </div>
                    <div className="mt-2 space-y-1">
                      {alternatives.slice(0, 3).map((alt: any) => (
                        <p key={alt.ingredientId} className="text-xs text-secondary tnum">
                          {alt.name}: {formatCurrency(alt.price)}/{alt.unit} (hemat {formatCurrency(alt.savingsPerUnit)}/{alt.unit})
                        </p>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )
      })()}

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSave} className="flex-1 sm:flex-none">
          <Icon name="check" size={14} /> Simpan Resep
        </Button>
        {id && id !== 'new' && (
          <>
            <Button variant="secondary" onClick={handleCreateProduct}>
              <Icon name="tag" size={14} /> Buat Produk
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/app/production/new?recipe=${id}`)}>
              <Icon name="factory" size={14} /> Produksi
            </Button>
          </>
        )}
      </div>

      {id && id !== 'new' && (
        <Button
          variant="secondary"
          onClick={async () => {
            if (!window.confirm(`Hapus resep "${recipe?.name}"? Bahan resep juga akan terhapus.`)) return
            try {
              await deleteRecipe(id!)
              toast.success('Resep dihapus')
              navigate('/app/recipes')
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Gagal menghapus resep')
            }
          }}
          className="w-full text-pink-strong"
        >
          <Icon name="trash" size={14} /> Hapus Resep
        </Button>
      )}
    </div>
  )
}
