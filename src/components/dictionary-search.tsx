"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, Search } from 'lucide-react';
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAccessibility } from "@/lib/hooks/use-accessibility";

interface DictionarySearchProps {
  terms: any[];
  savedTermIds: Set<string>;
  userId: string;
}

export function DictionarySearch({ terms, savedTermIds, userId }: DictionarySearchProps) {
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<Set<string>>(savedTermIds);
  const supabase = createClient();
  const { theme } = useAccessibility();

  const filteredTerms = terms.filter((term) =>
    term.term.toLowerCase().includes(search.toLowerCase()) ||
    term.definition.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleSave = async (termId: string) => {
    const isSaved = saved.has(termId);

    if (isSaved) {
      // Remove from saved
      await supabase
        .from("user_saved_terms")
        .delete()
        .eq("user_id", userId)
        .eq("term_id", termId);
      setSaved((prev) => {
        const newSet = new Set(prev);
        newSet.delete(termId);
        return newSet;
      });
    } else {
      // Add to saved
      await supabase
        .from("user_saved_terms")
        .insert({
          user_id: userId,
          term_id: termId,
        });
      setSaved((prev) => new Set(prev).add(termId));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredTerms.map((term) => {
          const isSaved = saved.has(term.id);
          const definition = theme === "easy-read" && term.easy_read_definition 
            ? term.easy_read_definition 
            : term.definition;

          return (
            <Card key={term.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{term.term}</CardTitle>
                    {term.category && (
                      <Badge variant="secondary" className="mb-2">
                        {term.category}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleSave(term.id)}
                    aria-label={isSaved ? "Remove from saved" : "Save term"}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3 leading-relaxed">
                  {definition}
                </p>
                {term.example_usage && (
                  <div className="border-l-4 border-blue-600 pl-4 py-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                    <p className="text-sm">
                      <span className="font-medium">Example: </span>
                      {term.example_usage}
                    </p>
                  </div>
                )}
                {term.related_terms && term.related_terms.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Related terms:</p>
                    <div className="flex flex-wrap gap-2">
                      {term.related_terms.map((relatedTerm: string) => (
                        <Badge key={relatedTerm} variant="outline">
                          {relatedTerm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filteredTerms.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No terms found matching your search.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
