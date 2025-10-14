import { SectionCards } from "./_components/section-cards";
import { TableView } from "./_components/TableView";

export default function Page() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <SectionCards />
      <TableView/>
    </div>
  );
}
