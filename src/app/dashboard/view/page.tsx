import { ChartLineRetention } from "./_components/ChartLineRetention";
import { ChartLineUsers } from "./_components/ChartLineUsers";
import { SectionCards } from "./_components/section-cards";

export default function Page() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <SectionCards />
      <ChartLineUsers />
      <ChartLineRetention />
      {/* <DataTable data={data} /> */}
    </div>
  );
}
