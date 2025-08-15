import { SkeletonProducts } from "../../components/skeletons/Skeleton";

export default function FavoritosLoading() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="h-8 bg-gray-200 rounded-lg mx-auto w-48 mb-8 animate-pulse" />
      <SkeletonProducts />
    </div>
  );
}
