import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import ProvinceMap from '@/components/ProvinceMap';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MapPoint {
  lng: number;
  lat: number;
  type: 'pickup' | 'dropoff';
}

interface Order {
  id: string;
  pickup: MapPoint;
  dropoff: MapPoint;
  status: 'pending' | 'accepted' | 'completed';
  price: number;
  distance: number;
  passengerName: string;
}

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'passenger' | 'driver'>('passenger');
  const [pickupPoint, setPickupPoint] = useState<MapPoint | null>(null);
  const [dropoffPoint, setDropoffPoint] = useState<MapPoint | null>(null);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      pickup: { lng: 34.776, lat: 32.064, type: 'pickup' },
      dropoff: { lng: 34.790, lat: 32.074, type: 'dropoff' },
      status: 'pending',
      price: 450,
      distance: 5.2,
      passengerName: 'Алексей М.'
    },
    {
      id: '2',
      pickup: { lng: 34.770, lat: 32.060, type: 'pickup' },
      dropoff: { lng: 34.800, lat: 32.080, type: 'dropoff' },
      status: 'pending',
      price: 620,
      distance: 7.8,
      passengerName: 'Мария К.'
    }
  ]);
  const [isPlacingPickup, setIsPlacingPickup] = useState(false);
  const [isPlacingDropoff, setIsPlacingDropoff] = useState(false);

  const handlePickupSet = (point: MapPoint) => {
    setPickupPoint(point);
    setIsPlacingPickup(false);
    toast({
      title: '📍 Точка подачи установлена',
      description: 'Теперь укажите точку назначения',
    });
  };

  const handleDropoffSet = (point: MapPoint) => {
    setDropoffPoint(point);
    setIsPlacingDropoff(false);
    toast({
      title: '🎯 Точка назначения установлена',
      description: 'Заказ готов к оформлению',
    });
  };

  const handleOrderTaxi = () => {
    if (!pickupPoint || !dropoffPoint) {
      toast({
        title: '⚠️ Укажите точки на карте',
        description: 'Необходимо указать точку подачи и точку назначения',
        variant: 'destructive',
      });
      return;
    }

    const distance = calculateDistance(pickupPoint, dropoffPoint);

    const newOrder: Order = {
      id: Date.now().toString(),
      pickup: pickupPoint,
      dropoff: dropoffPoint,
      status: 'pending',
      price: Math.round(distance * 100 + 200),
      distance: Number(distance.toFixed(1)),
      passengerName: 'Вы'
    };

    setOrders([newOrder, ...orders]);
    setPickupPoint(null);
    setDropoffPoint(null);

    toast({
      title: '🚕 Заказ создан!',
      description: `Стоимость: ${newOrder.price}₽ • Расстояние: ${newOrder.distance} км`,
    });
  };

  const handleAcceptOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'accepted' } : order
    ));
    toast({
      title: '✅ Заказ принят',
      description: 'Направляйтесь к точке подачи пассажира',
    });
  };

  const calculateDistance = (point1: MapPoint, point2: MapPoint) => {
    const R = 6371;
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
      
      <header className="relative z-10 border-b border-border/50 backdrop-blur-lg bg-card/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center animate-pulse-glow">
                <Icon name="Car" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  TaxiGO
                </h1>
                <p className="text-xs text-muted-foreground">Province Edition</p>
              </div>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-2xl">
                  <Icon name="Info" size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent className="animate-slide-in-right">
                <SheetHeader>
                  <SheetTitle className="text-2xl">Подсказки</SheetTitle>
                  <SheetDescription>Как использовать карту</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 animate-fade-in">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon name="MonitorSmartphone" size={16} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">💻 На компьютере</h4>
                        <p className="text-sm text-muted-foreground">
                          Нажмите кнопку "Указать на карте", затем кликните мышью в нужное место на карте для установки метки
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                      <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                        <Icon name="Smartphone" size={16} className="text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">📱 На телефоне</h4>
                        <p className="text-sm text-muted-foreground">
                          Нажмите "Указать на карте", затем коснитесь пальцем места на карте, куда хотите поставить метку
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Icon name="MapPin" size={16} className="text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">🎯 Порядок действий</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                          <li>Сначала укажите точку подачи (откуда)</li>
                          <li>Затем укажите точку назначения (куда)</li>
                          <li>Нажмите "Заказать такси"</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 relative z-10">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-14 rounded-2xl bg-card/50 backdrop-blur">
            <TabsTrigger 
              value="passenger" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white font-semibold"
            >
              <Icon name="User" size={18} className="mr-2" />
              Пассажир
            </TabsTrigger>
            <TabsTrigger 
              value="driver"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-secondary data-[state=active]:text-white font-semibold"
            >
              <Icon name="Car" size={18} className="mr-2" />
              Водитель
            </TabsTrigger>
          </TabsList>

          <TabsContent value="passenger" className="space-y-6 animate-fade-in">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 rounded-3xl border-border/50 bg-card/50 backdrop-blur shadow-2xl animate-scale-in">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="Map" className="text-primary" />
                  Карта Province
                </h2>
                
                <ProvinceMap
                  pickupPoint={pickupPoint}
                  dropoffPoint={dropoffPoint}
                  isPlacingPickup={isPlacingPickup}
                  isPlacingDropoff={isPlacingDropoff}
                  onPickupSet={handlePickupSet}
                  onDropoffSet={handleDropoffSet}
                />

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <Button
                    onClick={() => {
                      setIsPlacingPickup(true);
                      setIsPlacingDropoff(false);
                    }}
                    variant={isPlacingPickup ? "default" : "outline"}
                    className={`rounded-xl h-12 font-semibold transition-all ${
                      isPlacingPickup ? 'bg-gradient-to-r from-primary to-primary/80 shadow-lg' : ''
                    }`}
                  >
                    <Icon name="MapPin" size={18} className="mr-2" />
                    {pickupPoint ? 'Изменить' : 'Откуда'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsPlacingDropoff(true);
                      setIsPlacingPickup(false);
                    }}
                    variant={isPlacingDropoff ? "default" : "outline"}
                    className={`rounded-xl h-12 font-semibold transition-all ${
                      isPlacingDropoff ? 'bg-gradient-to-r from-secondary to-secondary/80 shadow-lg' : ''
                    }`}
                  >
                    <Icon name="Flag" size={18} className="mr-2" />
                    {dropoffPoint ? 'Изменить' : 'Куда'}
                  </Button>
                </div>
              </Card>

              <Card className="p-6 rounded-3xl border-border/50 bg-card/50 backdrop-blur shadow-2xl animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="ClipboardList" className="text-accent" />
                  Заказ такси
                </h2>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-muted/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Точка подачи</span>
                      {pickupPoint ? (
                        <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                          <Icon name="CheckCircle" size={14} className="mr-1" />
                          Установлена
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-muted">Не указана</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Точка назначения</span>
                      {dropoffPoint ? (
                        <Badge variant="default" className="bg-secondary/20 text-secondary border-secondary/30">
                          <Icon name="CheckCircle" size={14} className="mr-1" />
                          Установлена
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-muted">Не указана</Badge>
                      )}
                    </div>
                  </div>

                  {pickupPoint && dropoffPoint && (
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 animate-fade-in">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Расстояние</span>
                          <span className="font-bold text-lg">
                            {calculateDistance(pickupPoint, dropoffPoint).toFixed(1)} км
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Примерная стоимость</span>
                          <span className="font-bold text-2xl text-primary">
                            {Math.round(calculateDistance(pickupPoint, dropoffPoint) * 100 + 200)}₽
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleOrderTaxi}
                    disabled={!pickupPoint || !dropoffPoint}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                  >
                    <Icon name="Zap" size={20} className="mr-2" />
                    Заказать такси
                  </Button>

                  <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20">
                    <p className="text-sm text-center text-muted-foreground">
                      <Icon name="Bell" size={16} className="inline mr-1" />
                      Вы получите Push-уведомление когда водитель примет заказ
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="driver" className="space-y-6 animate-fade-in">
            <Card className="p-6 rounded-3xl border-border/50 bg-card/50 backdrop-blur shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Icon name="ListOrdered" className="text-accent" />
                Доступные заказы
              </h2>

              <div className="space-y-4">
                {orders.filter(order => order.status === 'pending').length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Icon name="Inbox" size={40} className="text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-lg">Нет доступных заказов</p>
                  </div>
                ) : (
                  orders.filter(order => order.status === 'pending').map((order, index) => (
                    <Card 
                      key={order.id} 
                      className="p-5 rounded-2xl bg-gradient-to-br from-card to-muted/20 border-border/50 hover:border-primary/50 transition-all hover:shadow-lg animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg mb-1">{order.passengerName}</h3>
                          <Badge variant="outline" className="border-accent/50 text-accent">
                            Новый заказ
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary">{order.price}₽</div>
                          <div className="text-sm text-muted-foreground">{order.distance} км</div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2">
                          <Icon name="MapPin" size={16} className="text-primary mt-1 flex-shrink-0" />
                          <span className="text-sm">Точка подачи: ({order.pickup.lng.toFixed(3)}, {order.pickup.lat.toFixed(3)})</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Icon name="Flag" size={16} className="text-secondary mt-1 flex-shrink-0" />
                          <span className="text-sm">Точка назначения: ({order.dropoff.lng.toFixed(3)}, {order.dropoff.lat.toFixed(3)})</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 font-semibold shadow-md"
                      >
                        <Icon name="Check" size={18} className="mr-2" />
                        Принять заказ
                      </Button>
                    </Card>
                  ))
                )}
              </div>

              {orders.filter(order => order.status === 'accepted').length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Icon name="Clock" className="text-primary" />
                    Активные заказы
                  </h3>
                  <div className="space-y-4">
                    {orders.filter(order => order.status === 'accepted').map((order) => (
                      <Card key={order.id} className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg mb-1">{order.passengerName}</h3>
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                              <Icon name="Navigation" size={12} className="mr-1" />
                              В процессе
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{order.price}₽</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-center text-muted-foreground">
                  <Icon name="Bell" size={16} className="inline mr-1" />
                  Вы получите Push-уведомление при появлении новых заказов
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;