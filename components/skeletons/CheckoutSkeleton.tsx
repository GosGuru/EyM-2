interface CheckoutSkeletonProps {
  showForm?: boolean;
}

export const CheckoutFormSkeleton = () => (
  <div className="space-y-6">
    {/* Título de sección */}
    <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
    
    {/* Campos de nombre */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-12 bg-gray-200 rounded animate-pulse" />
      <div className="h-12 bg-gray-200 rounded animate-pulse" />
    </div>
    
    {/* Email */}
    <div className="h-12 bg-gray-200 rounded animate-pulse" />
    
    {/* Teléfono */}
    <div className="h-12 bg-gray-200 rounded animate-pulse" />
    
    {/* Título dirección */}
    <div className="h-6 bg-gray-200 rounded w-40 animate-pulse mt-8" />
    
    {/* Dirección */}
    <div className="h-12 bg-gray-200 rounded animate-pulse" />
    <div className="h-12 bg-gray-200 rounded animate-pulse" />
    
    {/* Ciudad, provincia, CP */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-12 bg-gray-200 rounded animate-pulse" />
      <div className="h-12 bg-gray-200 rounded animate-pulse" />
      <div className="h-12 bg-gray-200 rounded animate-pulse" />
    </div>
    
    {/* Checkbox términos */}
    <div className="flex items-center gap-3">
      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
    </div>
  </div>
);

export const CheckoutSummarySkeleton = () => (
  <div className="space-y-4">
    {/* Items */}
    <div className="bg-white rounded-lg border p-4">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-8 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
    
    {/* Totales */}
    <div className="bg-white rounded-lg border p-4">
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
        <div className="flex justify-between border-t pt-3">
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
      </div>
    </div>
    
    {/* Botón */}
    <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
  </div>
);

export default function CheckoutSkeleton({ showForm = true }: CheckoutSkeletonProps) {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2">
          {showForm ? <CheckoutFormSkeleton /> : null}
        </div>
        
        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <CheckoutSummarySkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
