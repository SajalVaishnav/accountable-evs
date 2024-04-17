import prisma from "@/prisma/prismaSingleton";
import { Readable } from "stream";

// reference: https://github.com/prisma/prisma/issues/5055
export default function streamMeters(batchSize: number) {
    let cursorId: string | undefined = undefined;
    return new Readable({
      objectMode: true,
      async read() {
        try {
          const items = await prisma.meter.findMany({
            take: batchSize,
            skip: cursorId ? 1 : 0,
            cursor: cursorId ? { id: cursorId } : undefined,
          });
          if (items.length === 0) {
            this.push(null);
          } else {
            this.push(items);
            cursorId = items[items.length - 1].id;
          }
        } catch (err: any) {
          this.destroy(err);
        }
      },
    });
  }
  