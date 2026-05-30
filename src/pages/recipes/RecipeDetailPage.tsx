import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRecipe, useCreateRecipe, useUpdateRecipe, useAddRecipeItem, useRemoveRecipeItem, useDuplicateRecipe } from '@/hooks/useRecipes'
import { useIngredients } from '@/hooks/useIngredients'
import { useCreateProduct } from '@/hooks/useProducts'
import { useAuth } from '@/hooks/useAuth'
import { calculateRecipeCost, findCheaperAlternatives } from '@/lib/calculations'
import { toast } from 'sonner'

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { organization } = useAuth()
  const isNew = id === 'new'

  const { data: recipe, isLoading } = useRecipe(id ?? '')
  const { data: allIngredients } = useIngredients()
  const { mutateAsync: createRecipe } = useCreateRecipe()
  const { mutateAsync: updateRecipe } = useUpdateRecipe()
  const { mutateAsync: addItem } = useAddRecipeItem()
  const { mutateAsync: removeItem } = useRemoveRecipeItem()
  const { mutateAsync: duplicate } = useDuplicateRecipe()
  const { mutateAsync: createProduct } = useCreateProduct()

  const [name, setName] = useState('')
  const [yieldAmt, setYieldAmt] = useState('1')
  const [yieldUnit, setYieldUnit] = useState('pcs')
  const [overhead, setOverhead] = useState('0')
  const [packaging, setPackaging] = useState('0')
  const [selling, setSelling] = useState('0')
  const [selIngredient, setSelIngredient] = useState('')
  const [selQty, setSelQty] = useState('')
  const [items, setItems] = useState<any[]>([])

  const currentRecipe = recipe

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
    return <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <input
          placeholder="Nama Resep"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Hasil"
            value={yieldAmt}
            onChange={(e) => setYieldAmt(e.target.value)}
            className="h-12 flex-1 rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
          />
          <select
            value={yieldUnit}
            onChange={(e) => setYieldUnit(e.target.value)}
            className="h-12 w-24 rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
          >
            <option value="pcs">pcs</option>
            <option value="box">box</option>
            <option value="jar">jar</option>
            <option value="kg">kg</option>
            <option value="liter">liter</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-medium text-primary">Bahan</h2>
        {items.length === 0 ? (
          <p className="text-sm text-secondary">Belum ada bahan. Tambahkan bahan di bawah.</p>
        ) : (
          <div className="mb-3 space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
                <div>
                  <p className="text-sm font-medium text-primary">{item.name}</p>
                  <p className="text-xs text-secondary">{item.quantity} {item.unit} — Rp {item.cost_at_create.toLocaleString('id-ID')}</p>
                </div>
                <button
                  onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                  className="text-sm text-danger"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <select
            value={selIngredient}
            onChange={(e) => setSelIngredient(e.target.value)}
            className="h-12 flex-1 rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
          >
            <option value="">Pilih bahan...</option>
            {allIngredients?.map((ing) => (
              <option key={ing.id} value={ing.id}>
                {ing.name} (Rp {ing.latest_price.toLocaleString('id-ID')}/{ing.unit})
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Jml"
            value={selQty}
            onChange={(e) => setSelQty(e.target.value)}
            className="h-12 w-20 rounded-lg border border-border bg-surface px-3 text-base outline-none focus:border-primary"
          />
          <button
            onClick={handleAddIngredient}
            className="h-12 rounded-lg bg-primary px-4 text-sm font-medium text-white"
          >
            +
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-medium text-primary">Biaya & Harga</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-secondary">Overhead (%)</label>
            <input
              type="number"
              value={overhead}
              onChange={(e) => setOverhead(e.target.value)}
              className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-secondary">Biaya Kemasan (Rp)</label>
            <input
              type="number"
              value={packaging}
              onChange={(e) => setPackaging(e.target.value)}
              className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-secondary">Harga Jual (Rp)</label>
            <input
              type="number"
              value={selling}
              onChange={(e) => setSelling(e.target.value)}
              className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="mt-4 space-y-1 rounded-lg bg-background p-3">
          <div className="flex justify-between text-sm"><span className="text-secondary">Biaya Bahan</span><span className="font-medium">Rp {cost.productionCost.toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between text-sm"><span className="text-secondary">Overhead</span><span className="font-medium">Rp {cost.overheadCost.toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between text-sm"><span className="text-secondary">Kemasan</span><span className="font-medium">Rp {cost.packagingCost.toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between text-sm border-t border-border pt-1"><span className="font-medium">Total HPP</span><span className="font-semibold">Rp {cost.totalHpp.toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between text-sm"><span className="text-secondary">HPP per unit</span><span className="font-medium">Rp {cost.perUnitHpp.toLocaleString('id-ID')}</span></div>
          {Number(selling) > 0 && (
            <div className="flex justify-between text-sm border-t border-border pt-1">
              <span className="font-medium">Margin</span>
              <span className={`font-semibold ${cost.margin >= 30 ? 'text-success' : cost.margin >= 10 ? 'text-warning' : 'text-danger'}`}>
                {cost.margin.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {id && id !== 'new' && items.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-3 text-xs font-medium text-secondary uppercase tracking-wider">Optimasi Biaya</h3>
          <div className="space-y-2">
            {items.map((item) => {
              const ing = allIngredients?.find((i: any) => i.id === item.ingredient_id)
              if (!ing) return null
              const alternatives = findCheaperAlternatives(
                item.ingredient_id,
                (ing as any).category?.name ?? null,
                item.cost_at_create,
                allIngredients as any[],
              )
              if (alternatives.length === 0) return null
              const savings = (item.cost_at_create - alternatives[0].price) * item.quantity
              return (
                <div key={item.id ?? item.ingredient_id} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary">{ing.name}</p>
                      <p className="text-xs text-secondary">
                        Ganti {alternatives[0].name} — hemat Rp {savings.toLocaleString('id-ID')}/batch
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await removeItem(item.id)
                          await addItem({
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
                      className="text-xs font-medium text-primary underline"
                    >
                      Ganti
                    </button>
                  </div>
                  {alternatives.slice(0, 3).map((alt) => (
                    <p key={alt.ingredientId} className="mt-1 text-xs text-secondary">
                      {alt.name} Rp {alt.price.toLocaleString('id-ID')}/{alt.unit} (hemat Rp {alt.savingsPerUnit.toLocaleString('id-ID')}/{alt.unit})
                    </p>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <button onClick={handleSave} className="h-12 w-full rounded-lg bg-primary text-base font-medium text-white">
        Simpan Resep
      </button>

      {id && id !== 'new' && (
        <div className="flex gap-2">
          <button onClick={handleDuplicate} className="flex-1 h-12 rounded-lg border border-border bg-surface text-sm font-medium text-primary">
            Duplikat
          </button>
          <button onClick={handleCreateProduct} className="flex-1 h-12 rounded-lg border border-border bg-surface text-sm font-medium text-primary">
            Buat Produk
          </button>
          <button onClick={() => navigate(`/app/production/new?recipe=${id}`)} className="flex-1 h-12 rounded-lg border border-border bg-surface text-sm font-medium text-primary">
            Produksi
          </button>
        </div>
      )}
    </div>
  )
}
