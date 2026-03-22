import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DesignSystemPatternProvider } from "@/components/design-system/pattern-provider";
import { Dialog, DialogContent } from "@/components/design-system/primitives/dialog";
import { Popover, PopoverContent } from "@/components/design-system/primitives/popover";

describe("pattern glass guards", () => {
  it("downgrades premium popovers when the page pattern disallows glass", () => {
    render(
      <DesignSystemPatternProvider patternName="addressManagement">
        <Popover open>
          <PopoverContent variant="premium">Filters</PopoverContent>
        </Popover>
      </DesignSystemPatternProvider>,
    );

    const content = screen.getByText("Filters").closest('[data-slot="popover-content"]');
    expect(content).toHaveAttribute("data-variant", "neutral");
    expect(content).toHaveAttribute("data-glass-downgraded", "true");
  });

  it("downgrades premium dialogs when the page pattern disallows glass", () => {
    render(
      <DesignSystemPatternProvider patternName="addressManagement">
        <Dialog open>
          <DialogContent variant="premium">Editor</DialogContent>
        </Dialog>
      </DesignSystemPatternProvider>,
    );

    const content = screen.getByText("Editor").closest('[data-slot="dialog-content"]');
    expect(content).toHaveAttribute("data-variant", "default");
    expect(content).toHaveAttribute("data-glass-downgraded", "true");
  });

  it("keeps premium overlays premium when the pattern allows glass", () => {
    render(
      <DesignSystemPatternProvider patternName="editorialMasthead">
        <Popover open>
          <PopoverContent variant="premium">Premium</PopoverContent>
        </Popover>
      </DesignSystemPatternProvider>,
    );

    const content = screen.getByText("Premium").closest('[data-slot="popover-content"]');
    expect(content).toHaveAttribute("data-variant", "premium");
    expect(content).toHaveAttribute("data-glass-downgraded", "false");
  });
});
