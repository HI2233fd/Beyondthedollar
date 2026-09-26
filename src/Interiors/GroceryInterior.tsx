import { Billboard, Text } from '@react-three/drei'
import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { Guest, Plant } from '../props'
import { box } from '../collision'
import { useGame } from '../GameState'
import { useInteractable } from '../InteractionSystem'
import { LearningStation } from '../curriculum/LearningStation'
import { GROCERY_PRODUCTS, type GroceryProduct } from '../life/play/logic'

function ProductStand({ product, x, z }: { product: GroceryProduct; x: number; z: number }) {
  const addToCart = useGame((s) => s.addToCart)
  const kind = product.needKey ? 'food' : 'extra'
  useInteractable({
    id: `product-${product.id}`,
    scene: 'grocery',
    position: [x, 0, z],
    radius: 1.6,
    prompt: `Add ${product.name} ($${product.price.toFixed(2)}, ${kind})`,
    onInteract: () => addToCart({ id: product.id, name: product.name, price: product.price, needKey: product.needKey }),
  })
  return (
    <group position={[x, 0, z]}>
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
      const pay = (from: 'cash' | 'bank') => {
        const paid = useGame.getState().checkout(from)
        const now = useGame.getState()
        openDialogue({
          name: 'Cashier — Priya',
          text:
            paid < 0
              ? 'That account cannot cover the cart. Nothing was charged.'
              : `$${total.toFixed(2)} paid from ${from === 'cash' ? 'cash' : 'checking'}. You have $${now.cash.toFixed(2)} cash and $${now.bank.toFixed(2)} in checking.`,
          options: [{ label: 'Thanks', close: true }],
        })
      }
      openDialogue({
        name: 'Cashier — Priya',
        text: `Cart is $${total.toFixed(2)}. Cash $${s.cash.toFixed(2)}. Checking $${s.bank.toFixed(2)}. I will not tell you if it is a good basket.`,
        options: [
          { label: `Pay cash`, action: () => pay('cash') },
          { label: 'Pay from checking', action: () => pay('bank') },
          { label: 'Not yet', close: true },
        ],
      })
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
      {GROCERY_PRODUCTS.map((p, i) => (
        <ProductStand key={p.id} product={p} x={-6 + (i % 6) * 2.4} z={i < 6 ? -1 : -4.2} />
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
          text: 'Shelves are labeled. Food and extras are mixed together. Pay at the register when you are done — cash or checking.',
          options: [{ label: 'Thanks', close: true }],
        })}
      />
      <NPC
        id="grocery-maya"
        scene="grocery"
        position={[2.2, 0, 0.6]}
        rotation={Math.PI * 0.2}
        name="Maya"
        shirt="#f97316"
        pants="#44403c"
        hair="#3b2f2f"
        getDialogue={() => {
          const helped = useGame.getState().lifeFacts.helpedMaya
          if (helped === 'none') {
            return {
              name: 'Maya',
              text: 'Hey — I have $24 and I keep grabbing juice. Can you help me fill a basket I can actually cook from?',
              options: [
                {
                  label: 'Help with the basket',
                  action: () => useGame.getState().play({ type: 'open', activity: { kind: 'maya' } }),
                  close: true,
                },
                { label: 'Not right now', close: true },
              ],
            }
          }
          return {
            name: 'Maya',
            text:
              helped === 'well'
                ? 'You actually left me with food. I told my manager about you.'
                : 'Thanks for trying. I still had to come back for something I needed.',
            options: [
              {
                label: 'About that introduction',
                action: () => useGame.getState().play({ type: 'open', activity: { kind: 'maya-intro' } }),
                close: true,
              },
              { label: 'See you', close: true },
            ],
          }
        }}
      />
      <NPC
        id="grocery-andre"
        scene="grocery"
        position={[5.2, 0, -1.2]}
        rotation={-0.6}
        name="Andre"
        shirt="#0f766e"
        pants="#1f2937"
        getDialogue={() => {
          const facts = useGame.getState().lifeFacts
          const open = facts.apps.freshmart || facts.mayaBonus || Object.values(facts.apps).some((a) => a?.status === 'rejected')
          if (!open) {
            return {
              name: 'Andre',
              text: 'Weekend freight is covered for now. If that changes, Maya usually hears first.',
              options: [{ label: 'Good to know', close: true }],
            }
          }
          const works = facts.employerId === 'freshmart'
          if (works) {
            return {
              name: 'Andre',
              text: 'You are on the weekend crew. Clock in when you are ready to stock.',
              options: [
                {
                  label: 'Clock in',
                  action: () => {
                    const err = useGame.getState().play({ type: 'open', activity: { kind: 'shift', employerId: 'freshmart' } })
                    if (err) useGame.getState().openDialogue({ name: 'Andre', text: err, options: [{ label: 'OK', close: true }] })
                  },
                },
                { label: 'Later', close: true },
              ],
            }
          }
          return {
            name: 'Andre',
            text: 'I can use a stocker. The pay is lower than the café. The interview is the work, not a slogan.',
            options: [
              {
                label: 'Talk about the job',
                action: () => useGame.getState().play({ type: 'open', activity: { kind: 'posting', employerId: 'freshmart' } }),
                close: true,
              },
              {
                label: 'Interview now',
                action: () => {
                  const err = useGame.getState().play({ type: 'open', activity: { kind: 'interview', employerId: 'freshmart' } })
                  if (err) useGame.getState().openDialogue({ name: 'Andre', text: err, options: [{ label: 'OK', close: true }] })
                },
              },
              { label: 'Not today', close: true },
            ],
          }
        }}
      />


      <LearningStation buildingId="grocery" scene="grocery" position={[5.2, 0, 2.0]} />
      <InteriorExit scene="grocery" />
    </Room>
  )
}
