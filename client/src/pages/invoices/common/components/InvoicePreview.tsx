/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { previewEndpoint } from '$app/common/helpers';
import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { useRef} from 'react';
import { InvoiceViewer } from './InvoiceViewer';
import { RelationType } from './ProductsTable';
import { RemoveLogoCTA } from '$app/components/RemoveLogoCTA';

export type Resource =
  | Invoice
  | RecurringInvoice
  | Quote
  | Credit
  | PurchaseOrder;

interface Props {
  for: 'create' | 'invoice';
  resource: Resource;
  entity:
    | 'invoice'
    | 'recurring_invoice'
    | 'quote'
    | 'credit'
    | 'purchase_order';
  relationType: RelationType;
  endpoint?:
    | '/api/v1/live_preview?entity=:entity'
    | '/api/v1/live_preview/purchase_order?entity=:entity';
  initiallyVisible?: boolean;
  observable?: boolean;
  withRemoveLogoCTA?: boolean;
}

export function InvoicePreview(props: Props) {
  const divRef = useRef<HTMLDivElement>(null);

 

  if (
    props.resource?.id &&
    props.resource?.[props.relationType] &&
    props.entity === 'purchase_order'
  ) {
    return (
      <div className="flex flex-col space-y-3">
        <InvoiceViewer
          link={previewEndpoint(
            '/api/v1/live_preview/purchase_order?entity=:entity&entity_id=:id',
            {
              entity: props.entity,
              id: props.resource?.id,
            }
          )}
          resource={props.resource}
          method="POST"
        />

        {props.withRemoveLogoCTA && <RemoveLogoCTA />}
      </div>
    );
  }

  if (
    props.resource?.id &&
    props.resource?.[props.relationType] &&
    props.for === 'invoice'
  ) {
    return (
      <div className="flex flex-col space-y-3">
        <div ref={divRef}>
          <InvoiceViewer
            link={previewEndpoint(
              '/api/v1/live_preview?entity=:entity&entity_id=:id',
              {
                entity: props.entity,
                id: props.resource?.id,
              }
            )}
            method="POST"
            resource={props.resource}
            enabled={props.observable}
          />
        </div>

        {props.withRemoveLogoCTA && <RemoveLogoCTA />}
      </div>
    );
  }

  return <></>;
}
