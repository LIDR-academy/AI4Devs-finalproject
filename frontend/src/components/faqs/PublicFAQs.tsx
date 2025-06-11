import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { faqApi } from "../../api/faqApi";
import { FAQ, FAQFilters } from "../../types/faq";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Button } from "../ui/button";

export function PublicFAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FAQFilters>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Load FAQs with filters
  const loadFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await faqApi.getFAQs(filters, currentPage, 10);
      setFaqs(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      console.error("Failed to load FAQs", err);
      setError("Failed to load FAQs. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    loadFaqs();
  }, [loadFaqs]);

  // Apply filters
  const applyFilters = () => {
    setFilters({
      search: searchTerm,
    });
    setCurrentPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilters({});
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h1>
      </div>

      {/* Search box */}
      <div className="mb-6 flex gap-2">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-2 text-green-600 hover:text-green-700"
            >
              Search
            </button>
          </div>
        </form>

        <Button onClick={resetFilters} variant="ghost">
          Reset
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 p-4 mb-6 rounded-md">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* FAQs accordion */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading FAQs...</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center rounded-lg">
          <p className="text-gray-500">No FAQs found</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">
                  <span className="text-base font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-sm max-w-none">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 text-sm font-medium ${
                  currentPage === i + 1
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } ${i === 0 ? "rounded-l-md" : ""} ${
                  i === totalPages - 1 ? "rounded-r-md" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
} 