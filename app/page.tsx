"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Dice6, 
  Star, 
  Share2, 
  Info, 
  Trash2,
  Sparkles,
  Clock,
  Heart,
  Plus,
  Shuffle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Site {
  _id: string;
  url: string;
  title: string;
  category: string;
  genres: string[];
  year: number;
  description: string;
}

const CATEGORIES = [
  { name: "Visual & Trippy", dbCategory: "art", emoji: "👁️", description: "Mind-bending visuals" },
  { name: "Art & Aesthetic", dbCategory: "art", emoji: "🎨", description: "Beautiful and creative" },
  { name: "Interactive & Games", dbCategory: "interactive", emoji: "🎮", description: "Playful experiences" },
  { name: "Completely Useless", dbCategory: "fun", emoji: "🗿", description: "Just for fun" },
];

export default function Home() {
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Site[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [yearSlider, setYearSlider] = useState(2010);
  const [carouselIndex, setCarouselIndex] = useState(1); // Start at 1 because we duplicate first image
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  
  const carouselImages = ['/p1.png', '/p2.png', '/p3.png', '/p4.png'];
  // Create infinite carousel by duplicating first and last images
  const infiniteImages = [carouselImages[carouselImages.length - 1], ...carouselImages, carouselImages[0]];

  // Auto-play carousel with infinite loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => {
        const next = prev + 1;
        // If we're at the last duplicate (p1 duplicate), jump to real p1 without transition
        if (next >= infiniteImages.length - 1) {
          setIsTransitioning(false);
          setTimeout(() => {
            setCarouselIndex(1);
            setTimeout(() => setIsTransitioning(true), 50);
          }, 500);
          return next;
        }
        return next;
      });
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [infiniteImages.length]);
  
  // Form state for submission
  const [formData, setFormData] = useState({
    url: "",
    category: "",
    description: "",
  });

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error("Error loading favorites:", e);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const fetchRandomSite = async (category?: string | null, year?: number | null) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = "/api/random";
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (year) params.append("year", year.toString());
      if (params.toString()) url += "?" + params.toString();
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch random site");
      }
      
      const data = await response.json();
      setCurrentSite(data);
      
      // Open site in new tab
      if (data && data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      setError("Could not load a random site. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeMeSomewhere = async () => {
    setSelectedCategory(null);
    setSelectedYear(null);
    await fetchRandomSite();
  };

  const handleCategorySelect = async (categoryName: string) => {
    // Find the category object to get the database category
    const categoryObj = CATEGORIES.find(cat => cat.name === categoryName);
    const dbCategory = categoryObj?.dbCategory || categoryName;
    
    setSelectedCategory(categoryName);
    setSelectedYear(null);
    await fetchRandomSite(dbCategory, null);
  };

  const handleTimeTravelStart = async () => {
    setSelectedYear(yearSlider);
    setSelectedCategory(null);
    await fetchRandomSite(null, yearSlider);
  };

  const handleRandomNext = async () => {
    await fetchRandomSite(selectedCategory, selectedYear);
  };

  const toggleFavorite = () => {
    if (!currentSite) return;
    
    const isFavorite = favorites.some(fav => fav._id === currentSite._id);
    if (isFavorite) {
      setFavorites(favorites.filter(fav => fav._id !== currentSite._id));
    } else {
      setFavorites([...favorites, currentSite]);
    }
  };

  const isFavorite = currentSite ? favorites.some(fav => fav._id === currentSite._id) : false;

  const handleShare = async () => {
    if (!currentSite) return;
    
    const shareData = {
      title: currentSite.title,
      text: currentSite.description,
      url: currentSite.url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyToClipboard(currentSite.url);
      }
    } else {
      copyToClipboard(currentSite.url);
    }
    setShowShare(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleRemoveFavorite = (siteId: string) => {
    setFavorites(favorites.filter(fav => fav._id !== siteId));
  };

  const handleOpenFavorite = async (site: Site) => {
    setCurrentSite(site);
    setSelectedCategory(null);
    setSelectedYear(null);
  };

  const handleSubmitSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formData.url,
          title: new URL(formData.url).hostname,
          category: formData.category,
          description: formData.description,
          year: new Date().getFullYear(),
          genres: [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit site");
      }

      setFormData({ url: "", category: "", description: "" });
      alert("Thanks! We'll review it :)");
    } catch (err) {
      setError("Failed to submit site. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const modeTag = selectedCategory 
    ? `${selectedCategory} Mode`
    : selectedYear 
    ? `${selectedYear} Mode`
    : "Random";

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="w-full px-16 pr-32 ml-20 py-2 z-50" style={{ backgroundColor: '#FFFCEB' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/logo.jpg" 
              alt="Cat Logo" 
              className="h-28 w-28 object-contain"
              style={{ 
                backgroundColor: 'transparent',
                mixBlendMode: 'multiply',
                filter: 'contrast(1.1)'
              }}
              onError={(e) => {
                // Fallback: create a simple cat icon if image doesn't exist
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.fallback-cat')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'fallback-cat';
                  fallback.innerHTML = '🐱';
                  fallback.style.fontSize = '2.5rem';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-6 flex-wrap flex-1">
            <Button
              variant="outline"
              onClick={() => document.getElementById("category")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-lg text-lg px-3 py-1.5 transition-colors bg-transparent hover:!bg-[#EF93B8]"
              style={{ 
                borderColor: '#000000', 
                color: '#000000',
                borderWidth: '1px'
              }}
            >
              Pick a Category
            </Button>
            
            <Button
              variant="outline"
              onClick={() => document.getElementById("timeTravel")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-lg text-lg px-3 py-1.5 transition-colors bg-transparent hover:!bg-[#EF93B8]"
              style={{ 
                borderColor: '#000000', 
                color: '#000000',
                borderWidth: '1px'
              }}
            >
              Time Travel Mode
            </Button>
            
            <Button
              variant="outline"
              onClick={() => document.getElementById("add")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-lg text-lg px-3 py-1.5 transition-colors bg-transparent hover:!bg-[#EF93B8]"
              style={{ 
                borderColor: '#000000', 
                color: '#000000',
                borderWidth: '1px'
              }}
            >
              Add Your Site
            </Button>
            
            <Button
              variant="outline"
              onClick={() => document.getElementById("favorites")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-lg text-lg px-3 py-1.5 transition-colors bg-transparent hover:!bg-[#EF93B8]"
              style={{ 
                borderColor: '#000000', 
                color: '#000000',
                borderWidth: '1px'
              }}
            >
              Favorite sites
            </Button>
            
          </div>
        </div>
      </nav>

      {/* Landing Section */}
      <section id="landing" className="mx-auto mt-10 max-w-4xl mx-auto px-4 py-16 space-y-12">
        <div className="flex items-start gap-6">
          <img 
            src="/digi camera.png" 
            alt="Digital Camera" 
            className="h-30 w-auto object-contain flex-shrink-0 -mt-20 -ml-36"
          />
          <div className="flex-1 text-center -space-x-10 space-y-6 -mt-2">
            <h1 className="text-3xl md:text-3xl font-bold" style={{ color: '#D04D77', fontFamily: 'var(--font-press-start), monospace', letterSpacing: '0.1em', wordSpacing: '0.2em', lineHeight: '1.5' }}>
              A Tiny Corner of the Internet That Goes "Hmm."
            </h1>
            <p className="text-base md:text-lg" style={{ color: '#D04D77', fontFamily: 'var(--font-poppins), sans-serif' }}>
              A curated collection of delightful, odd, nostalgic, and playful corners of the internet.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button 
            onClick={handleTakeMeSomewhere}
            size="xl"
            className="text-xl md:text-2xl font-bold rounded-[100px] border-10 border-solid border-black text-black relative overflow-hidden transition-all duration-300 hover:-translate-y-2"
            style={{ 
              backgroundImage: 'url(/knit.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#FFFCEB',
              boxShadow: '0 10px 40px 0 rgba(0, 0, 0, 0.3)',
              position: 'relative',
              height: '240px',
              paddingLeft: '64px',
              paddingRight: '64px',
              width: '400px',
              minWidth: '400px',
              maxWidth: '400px'
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#EF93B8';
              e.currentTarget.style.backgroundImage = 'none';
              setIsHoveringButton(true);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFCEB';
              e.currentTarget.style.backgroundImage = 'url(/knit.png)';
              setIsHoveringButton(false);
            }}
          >
            {/* Pink star top right */}
            <span 
              className="absolute top-2 right-4 text-2xl"
              style={{ color: '#D04D77' }}
            >
              ⭐
            </span>
            {/* Pink star bottom left */}
            <span 
              className="absolute bottom-2 left-4 text-2xl"
              style={{ color: '#D04D77' }}
            >
              ⭐
            </span>
            <span className="relative z-10">
              {loading ? "Loading..." : isHoveringButton ? "Let's go" : "Take Me Somewhere"}
            </span>
          </Button>

        </div>
      </section>
      <img src="/knit.png" alt="Knit" className="w-full h-60 object-cover" />

      {/* Category Selection Section */}
      <section id="category" className="mx-auto max-w-7xl px-4 py-24 relative overflow-visible">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12 relative z-10">
          {/* Left Side - Text and Buttons */}
          <div className="w-full md:w-1/3 space-y-8">
              <div className="space-y-4 -space-x-10">
                <h2 className="text-4xl font-bold" style={{ color: '#000000' }}>Choose a Mood.</h2>
                <p className="text-2xl italic" style={{ color: '#000000', marginLeft: '0px' }}>What are we feeling today?</p>
              </div>

            <div className="flex flex-col gap-4 relative">
              {/* First Row - Two buttons side by side */}
              <div className="flex gap-4">
                <Button
                  onClick={() => handleCategorySelect(CATEGORIES[0].name)}
                  className="h-14 px-6 text-lg rounded-xl border-2 border-black text-black hover:opacity-90 transition-all text-left justify-start w-[250px] relative z-10"
                  style={{ backgroundColor: '#D1E2FF' }}
                >
                  {CATEGORIES[0].name}
                </Button>
                <Button
                  onClick={() => handleCategorySelect(CATEGORIES[1].name)}
                  className="h-14 px-6 text-lg rounded-xl border-2 border-black text-black hover:opacity-90 transition-all text-left justify-start w-[250px] relative z-10"
                  style={{ backgroundColor: '#D1E2FF' }}
                >
                  {CATEGORIES[1].name}
                </Button>
              </div>

              {/* Second Row - Interactive & Games button */}
              <div className="relative">
                <Button
                  onClick={() => handleCategorySelect(CATEGORIES[2].name)}
                  className="h-14 px-6 text-lg rounded-xl border-2 border-black text-black hover:opacity-90 transition-all text-left justify-start w-[250px] relative z-10"
                  style={{ backgroundColor: '#D1E2FF' }}
                >
                  {CATEGORIES[2].name}
                </Button>
              </div>

              {/* Third Row - Completely Useless button with cloud */}
              <div className="relative">
                <Button
                  onClick={() => handleCategorySelect(CATEGORIES[3].name)}
                  className="h-14 px-6 text-lg rounded-xl border-2 border-black text-black hover:opacity-90 transition-all text-left justify-start w-[250px] relative z-10"
                  style={{ backgroundColor: '#D1E2FF' }}
                >
                  {CATEGORIES[3].name}
                </Button>
                
                {/* Cloud Background Below Last Button */}
                <div className="absolute left-0 top-full -mt-20 -ml-32 z-0">
                  <img 
                    src="/cloud.png" 
                    alt="Cloud Background" 
                    className="w-[500px] h-[350px] opacity-70"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Browser Window Mockup */}
          <div className="w-full md:w-2/3 relative overflow-visible">
            {/* Cloud Background Behind Website Image */}
            <div className="absolute -right-48 -top-36 -z-10">
              <img 
                src="/cloud.png" 
                alt="Cloud Background" 
                className="w-[600px] h-[400px] opacity-70"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
            <div className="rounded-lg overflow-visible relative z-10">
              {/* Carousel */}
              <div className="relative w-full max-h-[500px]">
                <div className="relative overflow-hidden rounded-[60px]">
                  <div 
                    className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
                    style={{ transform: `translateX(-${carouselIndex * 120}%)` }}
                  >
                    {infiniteImages.map((img, index) => (
                      <div key={index} className="min-w-full flex-shrink-0">
                        <img 
                          src={img} 
                          alt={`Carousel image ${index + 1}`}
                          className="w-full ml-2 h-[500px] rounded-[60px] object-cover"
                          style={{ 
                            backgroundColor: 'transparent',
                            mixBlendMode: 'multiply',
                            filter: 'contrast(1.1)'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Time Travel Mode Section */}
      <section id="timeTravel" className="relative w-full py-80 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/old painting.jpg" 
            alt="Time Travel Background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 max-w-4xl mx-auto px-8 py-16">
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-5xl font-bold" style={{ color: '#000000' }}>Time Travel Mode</h2>
              <p className="text-xl italic" style={{ color: '#000000' }}>
                Pick a year. We'll take you to the internet that existed back then.
              </p>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-3 mt-8">
              <Button
                onClick={() => setYearSlider(Math.max(1999, yearSlider - 1))}
                className="w-12 h-12 rounded border-2 border-black bg-white text-black hover:bg-gray-100 text-xl font-bold"
                style={{ borderColor: '#000000' }}
              >
                -
              </Button>
              
              <div className="bg-white border-2 border-black rounded px-6 py-3 min-w-[120px] text-center">
                <span className="text-3xl font-bold" style={{ color: '#000000' }}>
                  {yearSlider}
                </span>
              </div>
              
              <Button
                onClick={() => setYearSlider(Math.min(2024, yearSlider + 1))}
                className="w-12 h-12 rounded border-2 border-black bg-white text-black hover:bg-gray-100 text-xl font-bold"
                style={{ borderColor: '#000000' }}
              >
                +
              </Button>
            </div>

            {/* Go Button */}
            <div className="mt-6 ml-[70px]">
              <Button
                onClick={handleTimeTravelStart}
                className="px-8 py-3 rounded border-2 border-black bg-white text-black hover:bg-gray-100 text-lg font-bold"
                style={{ borderColor: '#000000' }}
                disabled={loading}
              >
                {loading ? "Loading..." : "Go"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Add Site Submission Section */}
      <section id="add" className="relative mx-auto max-w-7xl -px-40 -ml-0 overflow-hidden">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Left Side - Knit Pattern with Stars - Shifted Far Left */}
          <div className="w-full md:w-1/5 flex-shrink-0 relative -ml-32">
            <img 
              src="/knit.png" 
              alt="Knit Pattern" 
              className="w-[800px] h-[800px] transform scale-x-[-1]"
              style={{ mixBlendMode: 'multiply', opacity: 0.8 }}
            />
            {/* Star decorations */}
            <div className="absolute top-12 left-8 text-pink-400 text-2xl">★</div>
            <div className="absolute top-10 left-8 text-pink-400 text-xl">★</div>
            <div className="absolute bottom-32 left-8 text-pink-400 text-2xl">★</div>
          </div>

          {/* Middle - Text */}
          <div className="w-full md:w-1/3 flex-shrink-0 pt-60 ml-20 space-y-4">
            <h2 className="text-4xl font-semibold" style={{ color: '#000000' }}>Submit a Website</h2>
            <p className="text-3xl italic leading-relaxed" style={{ color: '#000000' }}>
              Found something weird, delightful, or just very internet? Share it with us — we'd love to add it.
            </p>
          </div>

          {/* Right Side - Form in Card */}
          <div className="flex-1 pt-40 pl-40">
            <div className="border-2 border-black rounded-3xl p-8 bg-white shadow-lg">
              <form onSubmit={handleSubmitSite} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-xl font-bold" style={{ color: '#000000' }}>Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="Drop the link here."
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-4 py-4 text-lg border-2 border-black rounded-xl bg-white italic"
                    style={{ borderColor: '#000000' }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xl font-bold" style={{ color: '#000000' }}>Category</Label>
                  <Input
                    id="category-input"
                    type="text"
                    placeholder="Where does the vibe fit? (fun / art / visual / useless / game)"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-4 text-lg border-2 border-black rounded-xl bg-white italic"
                    style={{ borderColor: '#000000' }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xl font-bold" style={{ color: '#000000' }}>Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us what it does, or why you love it."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-4 text-lg border-2 border-black rounded-xl bg-white italic"
                    style={{ borderColor: '#000000' }}
                    rows={4}
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                    {error}
                  </div>
                )}

                <div className="flex justify-center pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="px-16 py-4 text-xl font-bold border-2 border-black rounded-full text-black hover:opacity-90"
                    style={{ backgroundColor: '#EF93B8', borderColor: '#000000' }}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Info Modal */}
      {showInfo && currentSite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ color: '#000000' }}>{currentSite.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfo(false)}
                >
                  ×
                </Button>
              </div>
              <CardDescription style={{ color: '#000000' }}>
                {currentSite.category} • {currentSite.year}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p style={{ color: '#000000' }}>{currentSite.description}</p>
              {currentSite.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentSite.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(currentSite.url, "_blank")}
              >
                Open in New Tab
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Share Modal */}
      {showShare && currentSite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ color: '#000000' }}>Share Website</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShare(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL</Label>
                <Input value={currentSite.url} readOnly />
              </div>
              <Button onClick={handleShare} className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Decorative Bottom Border */}
      <div 
        className="w-full h-16 mt-auto"
        style={{
          backgroundImage: 'url(/knit.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat-x'
        }}
      />
    </div>
  );
}
