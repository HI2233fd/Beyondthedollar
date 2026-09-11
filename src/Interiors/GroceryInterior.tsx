import { Billboard, Text } from '@react-three/drei'
import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { box } from '../collision'
import { useGame, type Dialogue } from '../GameState'
import { useInteractable } from '../InteractionSystem'

interface Product {
  id: string
  name: string
  price: number
  color: string
}

const PRODUCTS: Product[] = [
  { id: 'milk', name: 'Milk', price: 3.49, color: '#f8fafc' },
  { id: 'eggs', name: 'Eggs', price: 2.99, color: '#fde68a' },
  { id: 'bread', name: 'Bread', price: 3.29, color: '#d9a066' },
  { id: 'chicken', name: 'Chicken', price: 8.49, color: '#f4c7b0' },
  { id: 'fruit', name: 'Fruit', price: 4.99, color: '#ef4444' },
]

function ProductStand({ product, x }: { product: Product; x: number }) {
  const addToCart = useGame((s) => s.addToCart)
  useInteractable({
    id: `product-${product.id}`,
    scene: 'grocery',
    position: [x, 0, 0],
    radius: 1.9,
    prompt: `Add ${product.name} ($${product.price.toFixed(2)})`,
    onInteract: () => addToCart({ id: product.id, name: product.name, price: product.price }),
  })
  return (
    <group position={[x, 0, -1]}>
      {/* product boxes on the shelf */}
      {[1.05, 1.5].map((y) =>
        [-0.4, 0, 0.4].map((ox) => (
          <mesh key={`${y}-${ox}`} position={[ox, y, 0.4]} castShadow>
            <boxGeometry args={[0.32, 0.36, 0.32]} />
            <meshStandardMaterial color={product.color} />
          </mesh>
        )),
      )}
      <Billboard position={[0, 2.35, 0.4]}>
        <Text fontSize={0.26} color="#0f172a" anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor="#ffffff">
          {`${product.name}  $${product.price.toFixed(2)}`}
        </Text>
      </Billboard>
    </group>
  )
}

function Checkout() {
  const openDialogue = useGame((s) => s.openDialogue)
  useInteractable({
    id: 'grocery-checkout',
    scene: 'grocery',
    position: [-6, 0, 4],
    radius: 2.4,
    prompt: 'Checkout',
    onInteract: () => {
      const s = useGame.getState()
      if (s.cart.length === 0) {
        openDialogue({
          name: 'Cashier — Priya',
          text: 'Your cart is empty! Grab a few items off the shelves, then come back to check out.',
          options: [{ label: 'Okay', close: true }],
        })
        return
      }
      const total = s.cart.reduce((a, i) => a + i.price, 0)
      const count = s.cart.length
      s.checkout()
      const done: Dialogue = {
        name: 'Cashier — Priya',
        text: `That’s ${count} item${count > 1 ? 's' : ''} for $${total.toFixed(2)}. Payment received — thanks for shopping at FreshMart! Your cash balance is now $${useGame.getState().cash.toFixed(2)}.`,
        options: [{ label: 'You’re welcome', close: true }],
      }
      openDialogue(done)
    },
  })
  return (
    <group position={[-6, 0, 4]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[2.6, 1.1, 1.2]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <mesh position={[0, 1.18, 0]}>
        <boxGeometry args={[2.6, 0.08, 1.2]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      {/* register */}
      <mesh position={[0.6, 1.35, 0]}>
        <boxGeometry args={[0.5, 0.3, 0.4]} />
        <meshStandardMaterial color="#0b1220" emissive="#22c55e" emissiveIntensity={0.3} />
      </mesh>
      <Billboard position={[0, 2.5, 0]}>
        <Text fontSize={0.3} color="#22c55e" anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#052e16">
          CHECKOUT
        </Text>
      </Billboard>
    </group>
  )
}

export function GroceryInterior() {
  return (
    <Room
      w={18}
      d={14}
      floor="#e7e2d6"
      wall="#f3f1ea"
      extraBoxes={[box(0, -1, 16, 1.4), box(0, -4.2, 16, 1.4), box(-6, 4, 2.6, 1.2)]}
    >
      {/* Shelves */}
      {[-1, -4.2].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <boxGeometry args={[16, 1.8, 1.2]} />
            <meshStandardMaterial color="#8b93a1" />
          </mesh>
          <mesh position={[0, 1.85, 0]}>
            <boxGeometry args={[16, 0.1, 1.2]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
        </group>
      ))}

      {/* Product stands (front shelf) */}
      {PRODUCTS.map((p, i) => (
        <ProductStand key={p.id} product={p} x={-6 + i * 3} />
      ))}

      <Checkout />

      <NPC
        id="grocery-cashier"
        scene="grocery"
        position={[-6, 0, 5]}
        rotation={Math.PI}
        name="Priya"
        shirt="#16a34a"
        pants="#14532d"
        skin="#c68642"
        getDialogue={() => ({
          name: 'Cashier — Priya',
          text: 'Hi! Add items from the shelves, then step up to the register to check out.',
          options: [{ label: 'Thanks', close: true }],
        })}
      />

      <InteriorExit scene="grocery" />
    </Room>
  )
}
