import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import { FavoritosProvider } from "../components/FavoritosContext";
import { CartProvider } from "../components/CartContext";
import CartHost from "../components/CartHost";
import MotionProvider from "../components/motion/MotionProvider";
import TopLoader from "../components/ui/TopLoader";
import Script from "next/script";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "EYM Indumentaria - Tu Estilo, Tu Identidad",
  description: "Descubre la nueva colección de EYM Indumentaria. Ropa moderna, elegante y con personalidad. Envío gratis en compras superiores a $50.000",
  keywords: "ropa, moda, indumentaria, EYM, colección, estilo, fashion",
  authors: [{ name: "EYM Indumentaria" }],
  openGraph: {
    title: "EYM Indumentaria - Tu Estilo, Tu Identidad",
    description: "Descubre la nueva colección de EYM Indumentaria",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
  <body suppressHydrationWarning className={`${manrope.variable} font-sans bg-eym-light text-eym-dark`}>
        {/* Strip intrusive attributes injected by some browser extensions (bis_*) before hydration */}
        <Script id="strip-bis-attrs" strategy="beforeInteractive">
          {`
          (function(){
            try{
              var ATTRS=['bis_skin_checked','bis_size','bis_id'];
              var strip=function(root){
                ATTRS.forEach(function(a){
                  try{ root.querySelectorAll('['+a+']').forEach(function(el){ el.removeAttribute(a); }); }catch(e){}
                });
              };
              strip(document);
              var mo=new MutationObserver(function(muts){
                for(var i=0;i<muts.length;i++){
                  var m=muts[i];
                  if(m.type==='attributes' && ATTRS.indexOf(m.attributeName)>=0){
                    try{ m.target.removeAttribute(m.attributeName); }catch(e){}
                  }
                  if(m.addedNodes && m.addedNodes.length){
                    for(var j=0;j<m.addedNodes.length;j++){
                      var n=m.addedNodes[j];
                      if(n && n.nodeType===1){ strip(n); }
                    }
                  }
                }
              });
              mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:ATTRS});
            }catch(_){}
          })();
        `}
        </Script>
        <MotionProvider>
          <TopLoader />
          <FavoritosProvider>
            <CartProvider>
              <Header />
              {children}
              <CartHost />
            </CartProvider>
          </FavoritosProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
