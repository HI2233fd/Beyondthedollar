import { Billboard, Text } from '@react-three/drei'
import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { Guest, Plant } from '../props'
import { box } from '../collision'
import { useGame, type Dialogue } from '../GameState'
import { useInteractable } from '../InteractionSystem'
import { LearningStation } from '../curriculum/LearningStation'

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
      {/* Shelves (with stocked goods on the back shelf) */}
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
      {/* Assorted stock on the back shelf */}
      {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ec4899', '#eab308', '#14b8a6'].map((c, i) => (
        <group key={i} position={[-6.5 + i * 1.9, 0, -4.2]}>
          {[1.1, 1.55].map((y) => (
            <mesh key={y} position={[0, y, 0.35]} castShadow>
              <boxGeometry args={[0.34, 0.36, 0.3]} />
              <meshStandardMaterial color={c} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Aisle direction signs */}
      {[-4, 0, 4].map((x, i) => (
        <Billboard key={x} position={[x, 3.2, -1]}>
          <Text fontSize={0.34} color="#0f172a" anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#fff">
            {['Aisle 1', 'Aisle 2', 'Aisle 3'][i]}
          </Text>
        </Billboard>
      ))}

      {/* Produce table near the entrance */}
      <group position={[6, 0, 2]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[2.4, 0.9, 1.6]} />
          <meshStandardMaterial color="#8b5e3c" />
        </mesh>
        {[['#ef4444', -0.6], ['#f59e0b', 0], ['#22c55e', 0.6]].map(([c, ox], i) => (
          <mesh key={i} position={[ox as number, 1.05, 0]} castShadow>
            <sphereGeometry args={[0.28, 10, 10]} />
            <meshStandardMaterial color={c as string} />
          </mesh>
        ))}
      </group>

      {/* Shopping carts near the entrance */}
      {[[-4, 5.2], [-4.9, 5.2]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[0.7, 0.5, 1]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.4} wireframe />
          </mesh>
          <mesh position={[0, 0.2, 0.5]}>
            <cylinderGeometry args={[0.12, 0.12, 0.05, 12]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        </group>
      ))}

      <Plant position={[6.8, 0, -5]} />

      {/* Product stands (front shelf) */}
      {PRODUCTS.map((p, i) => (
        <ProductStand key={p.id} product={p} x={-6 + i * 3} />
      ))}

      {/* Shoppers */}
      <Guest position={[3, 0, 1]} rotation={Math.PI} shirt="#0ea5e9" pants="#374151" />
      <Guest position={[-2, 0, -2.6]} rotation={0} shirt="#f97316" skin="#8d5a3c" />
      <Guest position={[5.5, 0, 3.5]} rotation={-2.3} shirt="#84cc16" hair="#3b2f2f" />

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


      <LearningStation buildingId="grocery" scene="grocery" position={[5.2, 0, 2.0]} />
      <InteriorExit scene="grocery" />
    </Room>
  )
}
