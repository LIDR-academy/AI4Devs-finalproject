'use client';

import { useState } from 'react';
import { Loader2, Shuffle } from 'lucide-react';
import { toast } from 'sonner';
import { SimulateStore, AdminUser } from '@/types/api';
import { startSimulation } from '@/lib/api';
import { getRandomAddress, getRandomOrder } from '@/lib/simulate-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserCombobox, UserComboboxValue } from './user-combobox';

interface OrderConfigModalProps {
  open: boolean;
  onClose: () => void;
  stores: SimulateStore[];
  users: AdminUser[];
  onConversationStarted: (data: {
    conversationId: string;
    orderId: string;
    summary: string;
  }) => void;
}

type Mode = 'ADRESLES' | 'TRADICIONAL';

interface AddressState {
  line1: string;
  line2: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

const EMPTY_ADDRESS: AddressState = {
  line1: '', line2: '', postalCode: '', city: '', province: '', country: '',
};

export function OrderConfigModal({
  open,
  onClose,
  stores,
  users,
  onConversationStarted,
}: OrderConfigModalProps) {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [mode, setMode] = useState<Mode>('ADRESLES');
  const [buyer, setBuyer] = useState<UserComboboxValue | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<AddressState>(EMPTY_ADDRESS);
  const [isGift, setIsGift] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState<UserComboboxValue | null>(null);
  const [buyerRegisteredEcommerce, setBuyerRegisteredEcommerce] = useState(false);
  const [buyerHasEcommerceAddress, setBuyerHasEcommerceAddress] = useState(false);
  const [ecommerceAddress, setEcommerceAddress] = useState<AddressState>(EMPTY_ADDRESS);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(() =>
    getRandomOrder().items.map((item) => ({ ...item })),
  );
  const [currency, setCurrency] = useState('EUR');
  const [isLoading, setIsLoading] = useState(false);

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  const total = orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const addressValid = (addr: AddressState) =>
    addr.line1.trim() !== '' &&
    addr.postalCode.trim() !== '' &&
    addr.city.trim() !== '' &&
    addr.country.trim() !== '';

  const canSubmit =
    !!selectedStore &&
    buyer?.firstName?.trim() !== '' &&
    buyer?.firstName != null &&
    buyer?.phone?.trim() !== '' &&
    buyer?.phone != null &&
    (mode !== 'TRADICIONAL' || addressValid(deliveryAddress)) &&
    (mode !== 'ADRESLES' || !buyerHasEcommerceAddress || addressValid(ecommerceAddress));

  function handleRandomAddress(setter: (a: AddressState) => void) {
    const fake = getRandomAddress();
    setter({
      line1: fake.line1,
      line2: fake.line2,
      postalCode: fake.postalCode,
      city: fake.city,
      province: fake.province,
      country: fake.country,
    });
  }

  function handleRandomProducts() {
    const order = getRandomOrder();
    setOrderItems(order.items.map((item) => ({ ...item })));
  }

  function updateItem(index: number, field: keyof OrderItem, value: string) {
    setOrderItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [field]: field === 'name' ? value : Number(value) || 0 }
          : item,
      ),
    );
  }

  async function handleSubmit() {
    if (!selectedStore || !buyer) return;

    const payload = {
      store: { name: selectedStore.name, url: selectedStore.url },
      buyer: {
        first_name: buyer.firstName,
        last_name: buyer.lastName,
        phone: buyer.phone,
      },
      mode: mode === 'ADRESLES' ? ('adresles' as const) : ('tradicional' as const),
      address: mode === 'TRADICIONAL'
        ? buildAddressPayload(deliveryAddress)
        : undefined,
      buyer_registered_ecommerce: mode === 'ADRESLES' ? buyerRegisteredEcommerce : undefined,
      buyer_ecommerce_address:
        mode === 'ADRESLES' && buyerRegisteredEcommerce && buyerHasEcommerceAddress
          ? buildAddressPayload(ecommerceAddress)
          : undefined,
      gift_recipient:
        isGift && giftRecipient
          ? {
              first_name: giftRecipient.firstName,
              last_name: giftRecipient.lastName,
              phone: giftRecipient.phone,
            }
          : undefined,
      items: orderItems.length > 0 ? orderItems : undefined,
      total_amount: total,
      currency,
    };

    setIsLoading(true);
    try {
      const res = await startSimulation(payload);
      const summary = `${selectedStore.name} · ${buyer.firstName} ${buyer.lastName} · ${total.toFixed(2)} ${currency}`;
      onConversationStarted({
        conversationId: res.conversation_id,
        orderId: res.order_id,
        summary,
      });
      handleReset();
      onClose();
    } catch {
      toast.error('Error al crear la simulación. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  function buildAddressPayload(addr: AddressState) {
    const streetParts = [addr.line1, addr.line2].filter(Boolean);
    const street = streetParts.join(', ');
    const fullAddress = [street, addr.postalCode, addr.city, addr.province, addr.country]
      .filter(Boolean)
      .join(', ');
    return {
      full_address: fullAddress,
      street,
      postal_code: addr.postalCode,
      city: addr.city,
      province: addr.province || undefined,
      country: addr.country,
    };
  }

  function handleReset() {
    setSelectedStoreId('');
    setMode('ADRESLES');
    setBuyer(null);
    setDeliveryAddress(EMPTY_ADDRESS);
    setIsGift(false);
    setGiftRecipient(null);
    setBuyerRegisteredEcommerce(false);
    setBuyerHasEcommerceAddress(false);
    setEcommerceAddress(EMPTY_ADDRESS);
    setOrderItems(getRandomOrder().items.map((item) => ({ ...item })));
    setCurrency('EUR');
  }

  function handleClose() {
    if (!isLoading) {
      handleReset();
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Configurar pedido simulado</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="px-6 py-4 space-y-6">

            {/* 1. Tienda */}
            <div className="space-y-1.5">
              <Label>Tienda <span className="text-destructive">*</span></Label>
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una tienda..." />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name} — {store.ecommerceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Modo */}
            <div className="space-y-1.5">
              <Label>Modo</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={mode === 'ADRESLES' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('ADRESLES')}
                  className="flex-1"
                >
                  ADRESLES
                </Button>
                <Button
                  type="button"
                  variant={mode === 'TRADICIONAL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setMode('TRADICIONAL');
                    const isEmpty =
                      !deliveryAddress.line1 &&
                      !deliveryAddress.postalCode &&
                      !deliveryAddress.city &&
                      !deliveryAddress.country;
                    if (isEmpty) handleRandomAddress(setDeliveryAddress);
                  }}
                  className="flex-1"
                >
                  TRADICIONAL
                </Button>
              </div>
            </div>

            {/* 3. Comprador */}
            <div className="border rounded-lg p-4 space-y-1">
              <UserCombobox
                users={users}
                label="Comprador"
                value={buyer}
                onChange={setBuyer}
              />
            </div>

            {/* 4. Dirección — solo TRADICIONAL */}
            {mode === 'TRADICIONAL' && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Dirección de entrega</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRandomAddress(setDeliveryAddress)}
                    className="h-7 gap-1.5 text-xs"
                  >
                    <Shuffle className="h-3 w-3" />
                    Dirección aleatoria
                  </Button>
                </div>
                <AddressFields address={deliveryAddress} onChange={setDeliveryAddress} />
              </div>
            )}

            {/* 5. ¿Es regalo? */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch
                  id="is-gift"
                  checked={isGift}
                  onCheckedChange={setIsGift}
                />
                <Label htmlFor="is-gift">¿Es un regalo?</Label>
              </div>
              {isGift && (
                <div className="border rounded-lg p-4">
                  <UserCombobox
                    users={users}
                    label="Destinatario del regalo"
                    value={giftRecipient}
                    onChange={setGiftRecipient}
                  />
                </div>
              )}
            </div>

            {/* 6. Parámetros eCommerce — solo ADRESLES */}
            {mode === 'ADRESLES' && (
              <div className="border rounded-lg p-4 space-y-3">
                <Label className="text-sm font-medium">Parámetros simulados del eCommerce</Label>

                <div className="flex items-center gap-3">
                  <Switch
                    id="buyer-registered"
                    checked={buyerRegisteredEcommerce}
                    onCheckedChange={(v) => {
                      setBuyerRegisteredEcommerce(v);
                      if (!v) {
                        setBuyerHasEcommerceAddress(false);
                        setEcommerceAddress(EMPTY_ADDRESS);
                      }
                    }}
                  />
                  <Label htmlFor="buyer-registered" className="text-sm">
                    ¿El comprador está registrado en el eCommerce?
                  </Label>
                </div>

                {buyerRegisteredEcommerce && (
                  <div className="pl-4 border-l-2 border-muted space-y-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        id="has-ecommerce-address"
                        checked={buyerHasEcommerceAddress}
                        onCheckedChange={(v) => {
                          setBuyerHasEcommerceAddress(v);
                          if (v) {
                            const isEmpty =
                              !ecommerceAddress.line1 &&
                              !ecommerceAddress.postalCode &&
                              !ecommerceAddress.city &&
                              !ecommerceAddress.country;
                            if (isEmpty) handleRandomAddress(setEcommerceAddress);
                          } else {
                            setEcommerceAddress(EMPTY_ADDRESS);
                          }
                        }}
                      />
                      <Label htmlFor="has-ecommerce-address" className="text-sm">
                        ¿Tiene dirección guardada en el eCommerce?
                      </Label>
                    </div>

                    {buyerHasEcommerceAddress && (
                      <div className="space-y-3">
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRandomAddress(setEcommerceAddress)}
                            className="h-7 gap-1.5 text-xs"
                          >
                            <Shuffle className="h-3 w-3" />
                            Dirección aleatoria
                          </Button>
                        </div>
                        <AddressFields address={ecommerceAddress} onChange={setEcommerceAddress} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 7. Productos */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Productos</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRandomProducts}
                  className="h-7 gap-1.5 text-xs"
                >
                  <Shuffle className="h-3 w-3" />
                  Productos aleatorios
                </Button>
              </div>

              {orderItems.length > 0 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_80px_80px] gap-2 text-xs text-muted-foreground font-medium px-1">
                    <span>Nombre</span>
                    <span className="text-center">Cant.</span>
                    <span className="text-right">Precio</span>
                  </div>
                  {orderItems.map((item, i) => (
                    <div key={i} className="grid grid-cols-[1fr_80px_80px] gap-2 items-center">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(i, 'name', e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                        className="h-8 text-sm text-center"
                      />
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.price}
                        onChange={(e) => updateItem(i, 'price', e.target.value)}
                        className="h-8 text-sm text-right"
                      />
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Moneda</Label>
                      <Input
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                        className="h-7 w-16 text-xs"
                        maxLength={3}
                      />
                    </div>
                    <span className="text-sm font-semibold">
                      Total: {total.toFixed(2)} {currency}
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Simulando...
              </>
            ) : (
              'Simular Compra'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AddressFieldsProps {
  address: AddressState;
  onChange: (a: AddressState) => void;
}

function AddressFields({ address, onChange }: AddressFieldsProps) {
  const set = (field: keyof AddressState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...address, [field]: e.target.value });

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Dirección *</Label>
        <Input
          value={address.line1}
          onChange={set('line1')}
          placeholder="Calle Gran Vía 28"
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Dirección 2 (opcional)</Label>
        <Input
          value={address.line2}
          onChange={set('line2')}
          placeholder="Apto., piso, puerta, bloque..."
          className="h-8 text-sm"
        />
      </div>
      <div className="grid grid-cols-[120px_1fr] gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">C.P. *</Label>
          <Input value={address.postalCode} onChange={set('postalCode')} placeholder="28013" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Ciudad *</Label>
          <Input value={address.city} onChange={set('city')} placeholder="Madrid" className="h-8 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Provincia</Label>
          <Input value={address.province} onChange={set('province')} placeholder="Madrid" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">País *</Label>
          <Input value={address.country} onChange={set('country')} placeholder="ES" className="h-8 text-sm" maxLength={2} />
        </div>
      </div>
    </div>
  );
}
