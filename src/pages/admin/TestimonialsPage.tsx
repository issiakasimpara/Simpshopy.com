import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  Check,
  X,
  Trash2,
  Search,
  Filter,
  MessageCircle,
  TrendingUp,
  Users,
  Award,
  Image as ImageIcon
} from 'lucide-react';
import { useTestimonials } from '@/hooks/useTestimonials';
import { useStores } from '@/hooks/useStores';
import { useToast } from '@/hooks/use-toast';

const TestimonialsPage = () => {
  const { stores } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  // Sélectionner automatiquement la première boutique
  const currentStore = selectedStoreId 
    ? stores.find(s => s.id === selectedStoreId) 
    : stores[0];

  const { 
    testimonials, 
    isLoading, 
    approveTestimonial, 
    rejectTestimonial, 
    deleteTestimonial,
    toggleFeatured,
    refetch 
  } = useTestimonials(currentStore?.id, false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = testimonial.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (activeTab) {
      case 'pending':
        return !testimonial.is_approved && matchesSearch;
      case 'approved':
        return testimonial.is_approved && matchesSearch;
      case 'featured':
        return testimonial.is_featured && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const handleApprove = async (id: string) => {
    const result = await approveTestimonial(id);
    if (result) {
      refetch();
    }
  };

  const handleReject = async (id: string) => {
    const result = await rejectTestimonial(id);
    if (result) {
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) {
      const result = await deleteTestimonial(id);
      if (result) {
        refetch();
      }
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    const result = await toggleFeatured(id, featured);
    if (result) {
      refetch();
    }
  };

  // Statistiques
  const stats = {
    total: testimonials.length,
    pending: testimonials.filter(t => !t.is_approved).length,
    approved: testimonials.filter(t => t.is_approved).length,
    featured: testimonials.filter(t => t.is_featured).length,
    averageRating: testimonials.length > 0 
      ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
      : '0'
  };

  if (!currentStore) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Aucune boutique trouvée</h2>
          <p className="text-gray-500">Créez d'abord une boutique pour gérer les témoignages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Témoignages</h1>
        <p className="text-gray-600">Gérez les avis et témoignages de vos clients</p>
      </div>

      {/* Sélecteur de boutique */}
      {stores.length > 1 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Boutique :</label>
              <select
                value={selectedStoreId || currentStore.id}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Check className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approuvés</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                <p className="text-2xl font-bold">{stats.averageRating}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom ou contenu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets et liste des témoignages */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">En attente ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approuvés ({stats.approved})</TabsTrigger>
          <TabsTrigger value="featured">Mis en avant ({stats.featured})</TabsTrigger>
          <TabsTrigger value="all">Tous ({stats.total})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTestimonials.length > 0 ? (
            <div className="space-y-4">
              {filteredTestimonials.map((testimonial) => (
                <Card key={testimonial.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{testimonial.customer_name}</h3>
                          {/* 📸 NOUVEAU: Indicateur d'images */}
                          {testimonial.images && testimonial.images.length > 0 && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              {testimonial.images.length}
                            </Badge>
                          )}
                          <div className="flex">{renderStars(testimonial.rating)}</div>
                          {testimonial.is_featured && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              <Award className="w-3 h-3 mr-1" />
                              Mis en avant
                            </Badge>
                          )}
                          <Badge variant={testimonial.is_approved ? "default" : "secondary"}>
                            {testimonial.is_approved ? "Approuvé" : "En attente"}
                          </Badge>
                        </div>
                        {testimonial.title && (
                          <h4 className="font-medium text-gray-900 mb-2">{testimonial.title}</h4>
                        )}
                        <p className="text-gray-600 mb-2">"{testimonial.content}"</p>

                        {/* 📸 NOUVEAU: Affichage des images */}
                        {testimonial.images && testimonial.images.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <ImageIcon className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600 font-medium">
                                {testimonial.images.length} image{testimonial.images.length > 1 ? 's' : ''} jointe{testimonial.images.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 max-w-xs">
                              {testimonial.images.slice(0, 3).map((imageUrl, imgIndex) => (
                                <div key={imgIndex} className="relative group">
                                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                                    <img
                                      src={imageUrl}
                                      alt={`Image ${imgIndex + 1} du témoignage`}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                                      onClick={() => window.open(imageUrl, '_blank')}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5Ljc5IDEzLjc5IDkuNzkgMTAuMjEgMTIgOEMxNC4yMSAxMC4yMSAxNC4yMSAxMy43OSAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                                      }}
                                    />
                                  </div>
                                  {/* Overlay pour plus d'images */}
                                  {imgIndex === 2 && testimonial.images && testimonial.images.length > 3 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                      <span className="text-white text-xs font-medium">
                                        +{testimonial.images.length - 3}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-sm text-gray-500">
                          {testimonial.customer_email} • {new Date(testimonial.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {!testimonial.is_approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(testimonial.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {testimonial.is_approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(testimonial.id)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleFeatured(testimonial.id, !testimonial.is_featured)}
                          className={testimonial.is_featured ? "text-purple-600" : "text-gray-600"}
                        >
                          <Award className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(testimonial.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Aucun témoignage trouvé
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === 'pending' && 'Aucun témoignage en attente de validation.'}
                    {activeTab === 'approved' && 'Aucun témoignage approuvé.'}
                    {activeTab === 'featured' && 'Aucun témoignage mis en avant.'}
                    {activeTab === 'all' && 'Aucun témoignage pour cette boutique.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestimonialsPage;
