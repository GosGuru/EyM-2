export const SkeletonCategories = () => (
  <section className="py-16 px-4 bg-eym-light">
    <div className="container mx-auto">
      <div className="h-8 bg-gray-200 rounded-lg mx-auto w-64 mb-12 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse">
            <div className="h-full flex flex-col justify-end p-6">
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const SkeletonProducts = () => (
  <section className="py-16 px-4 bg-white">
    <div className="container mx-auto">
      <div className="h-8 bg-gray-200 rounded-lg mx-auto w-64 mb-12 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="bg-eym-light rounded-lg overflow-hidden">
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="p-4">
              <div className="h-5 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="w-11 h-11 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <div className="h-12 bg-gray-200 rounded-lg w-48 mx-auto animate-pulse" />
      </div>
    </div>
  </section>
);

export const SkeletonTestimonials = () => (
  <section className="py-16 px-4 bg-eym-light">
    <div className="container mx-auto">
      <div className="h-8 bg-gray-200 rounded-lg mx-auto w-64 mb-12 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4 gap-1">
              {Array.from({ length: 5 }, (_, j) => (
                <div key={j} className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/5 animate-pulse" />
            </div>
            <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Skeleton para página de tienda/categorías
export const SkeletonTienda = () => (
  <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    {/* Título */}
    <div className="h-8 bg-gray-200 rounded-lg mx-auto w-48 mb-6 animate-pulse" />
    
    {/* Grid de categorías */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="group relative overflow-hidden rounded-lg aspect-[3/4] bg-gray-200 animate-pulse">
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Skeleton para productos en categoría
export const SkeletonProductos = () => (
  <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    {/* Breadcrumb */}
    <div className="flex items-center space-x-2 text-sm mb-8">
      <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
      <span>›</span>
      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
      <span>›</span>
      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
    </div>
    
    {/* Título y descripción */}
    <div className="text-center mb-12">
      <div className="h-10 bg-gray-200 rounded-lg mx-auto w-64 mb-4 animate-pulse" />
      <div className="h-6 bg-gray-200 rounded mx-auto max-w-2xl animate-pulse" />
    </div>
    
    {/* Grid de productos */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="relative aspect-[4/5] bg-gray-200 animate-pulse" />
          <div className="p-4">
            <div className="h-5 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-4/5 mb-3 animate-pulse" />
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
              <div className="w-11 h-11 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Skeleton para página de producto individual
export const SkeletonProducto = () => (
  <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    {/* Breadcrumb */}
    <div className="flex items-center space-x-2 text-sm mb-8">
      <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
      <span>›</span>
      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
      <span>›</span>
      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
      <span>›</span>
      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Imagen del producto */}
      <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
      
      {/* Información del producto */}
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
        </div>
        <div className="h-12 bg-gray-200 rounded animate-pulse" />
        <div className="h-11 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  </div>
);
