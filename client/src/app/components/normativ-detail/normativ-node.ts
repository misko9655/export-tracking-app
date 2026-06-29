import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NormativNode } from '../../models/normativ.model';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-normativ-node',
    imports: [MatIconModule, DecimalPipe],
    template: `
        <div class="node" [class.has-children]="node.nodes.length > 0" [style.margin-left.px]="level * 24">
            <div class="node-row" [class.parent-node]="node.nodes.length > 0">
                <div class="node-info">
                    <span class="artikal-id">{{ node.artikalId }}</span>
                    <span class="artikal-naziv">{{ node.artikalNaziv }}</span>
                </div>
                <div class="node-values">
                    <div class="value-group">
                        <span class="value-label">Količina</span>
                        <span class="value-num">{{ node.kolicina | number:'1.0-5' }}</span>
                        <span class="value-jm">{{ node.artikalJm }}</span>
                    </div>
                    <div class="value-group">
                        <span class="value-label">Za GP</span>
                        <span class="value-num">{{ node.kolicinaGP | number:'1.0-3' }}</span>
                    </div>
                    <div class="value-group skladiste">
                        <mat-icon>warehouse</mat-icon>
                        <span>{{ node.skladisteNaziv }}</span>
                    </div>
                </div>
            </div>

            @if(node.nodes.length > 0) {
                <div class="children">
                    @for(child of node.nodes; track child.id) {
                        <app-normativ-node [node]="child" [level]="level + 1" />
                    }
                </div>
            }
        </div>
    `,
    styles: [`
        .node {
            border-left: 2px solid rgba(74, 48, 109, 0.12);
            margin-bottom: 2px;
        }

        .node.has-children > .node-row {
            background-color: rgba(74, 48, 109, 0.04);
            border-left: 3px solid #4A306D;
            margin-left: -2px;
        }

        .node-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            border-radius: 4px;
            gap: 16px;
            transition: background-color 0.1s;

            &:hover {
                background-color: rgba(74, 48, 109, 0.06);
            }
        }

        .node-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 0;
        }

        .artikal-id {
            font-family: 'Roboto Mono', monospace;
            font-weight: 600;
            font-size: 0.82rem;
            color: #4A306D;
            white-space: nowrap;
            min-width: 70px;
        }

        .artikal-naziv {
            font-size: 0.9rem;
            color: #2d2d4e;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .node-values {
            display: flex;
            align-items: center;
            gap: 20px;
            flex-shrink: 0;
        }

        .value-group {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            min-width: 60px;

            &.skladiste {
                flex-direction: row;
                align-items: center;
                gap: 4px;
                color: #7a7a9a;
                font-size: 0.78rem;
                min-width: unset;

                mat-icon {
                    font-size: 14px;
                    width: 14px;
                    height: 14px;
                }
            }
        }

        .value-label {
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #9090aa;
        }

        .value-num {
            font-size: 0.88rem;
            font-weight: 600;
            color: #2d2d4e;
            font-variant-numeric: tabular-nums;
        }

        .value-jm {
            font-size: 0.7rem;
            color: #52796F;
            text-transform: uppercase;
            font-weight: 500;
        }

        .children {
            margin-top: 2px;
        }
    `]
})
export class NormativNodeComponent {
    @Input({ required: true }) node!: NormativNode;
    @Input() level = 0;
}
