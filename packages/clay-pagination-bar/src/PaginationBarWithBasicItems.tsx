/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

import ClayButton from '@clayui/button';
import ClayIcon from '@clayui/icon';
import {ClayPaginationWithBasicItems} from '@clayui/pagination';
import {InternalDispatch, sub, useInternalState} from '@clayui/shared';
import React from 'react';

import PaginationBar from './PaginationBar';

const defaultDeltas = [
	{
		label: 10,
	},
	{
		label: 20,
	},
	{
		label: 30,
	},
	{
		label: 50,
	},
];

type Items = React.ComponentProps<typeof PaginationBar.DropDown>['items'];

interface IDelta {
	/**
	 * Path or URL to be used for some SPA focused use cases.
	 */
	href?: string;

	/**
	 * Label of the delta
	 */
	label: number;
}

interface IProps extends React.ComponentProps<typeof PaginationBar> {
	/**
	 * Sets the currently active page (controlled).
	 */
	active?: number;

	/**
	 * The value of delta that is currently selected
	 */
	activeDelta?: number;

	/**
	 * Initialize the page that is currently active. The first page is `1`.
	 * @deprecated since v3.52.0 - use `active` instead.
	 */
	activePage?: number;

	/**
	 * Sets the default DropDown position of the component. The component
	 * receives the Align constant values from the `@clayui/drop-down` package.
	 */
	alignmentPosition?: React.ComponentProps<
		typeof ClayPaginationWithBasicItems
	>['alignmentPosition'];

	/**
	 * Possible values of items per page.
	 */
	deltas?: Array<IDelta>;

	/**
	 * Sets the default active page (uncontrolled).
	 */
	defaultActive?: number;

	/**
	 * The page numbers that should be disabled. For example, `[2,5,6]`.
	 */
	disabledPages?: Array<number>;

	/**
	 * The number of pages to show on each side of the active page before
	 * using an ellipsis dropdown.
	 */
	ellipsisBuffer?: number;

	/**
	 * Function used to create the href provided for each page link.
	 */
	hrefConstructor?: (page?: number) => string;

	/**
	 * Labels for changing some texts inside the component.
	 * Use this property for i18n.
	 */
	labels?: {
		paginationResults: string;

		perPageItems: string;

		selectPerPageItems: string;
	};

	/**
	 * Callback called when the state of the active page changes (controlled).
	 * This is only used if an href is not provided.
	 */
	onActiveChange?: InternalDispatch<number>;

	/**
	 * Callback for when the number of elements per page changes. This is only used if
	 * an href is not provided.
	 */
	onDeltaChange?: (page: number) => void;

	/**
	 * Callback for when the active page changes. This is only used if
	 * an href is not provided.
	 * @deprecated since v3.52.0 - use `onActiveChange` instead.
	 */
	onPageChange?: (page: number) => void;

	/**
	 * Flags indicating if the DropDown should be rendered.
	 */
	showDeltasDropDown?: boolean;

	/**
	 * Path to spritemap from clay-css.
	 */
	spritemap?: string;

	/**
	 * The total number of items in the pagination list.
	 */
	totalItems: number;
}

const DEFAULT_LABELS = {
	paginationResults: 'Showing {0} to {1} of {2}',
	perPageItems: '{0} items',
	selectPerPageItems: '{0} items',
};

export const ClayPaginationBarWithBasicItems: React.FunctionComponent<IProps> =
	({
		active,
		activeDelta,
		activePage,
		alignmentPosition,
		defaultActive = 1,
		deltas = defaultDeltas,
		disabledPages,
		ellipsisBuffer,
		hrefConstructor,
		labels = DEFAULT_LABELS,
		onActiveChange,
		onDeltaChange,
		onPageChange,
		showDeltasDropDown = true,
		spritemap,
		totalItems,
		...otherProps
	}: IProps) => {
		const [internalActive, setActive] = useInternalState({
			defaultName: 'defaultActive',
			defaultValue: defaultActive,
			handleName: 'onActiveChange',
			name: 'value',
			onChange: onActiveChange ?? onPageChange,
			value: typeof active === 'undefined' ? activePage : active,
		});

		if (!activeDelta) {
			activeDelta = deltas[0].label;
		}

		const items: Items = deltas.map(({href, label}) => {
			const item: {
				href?: string;
				label?: string;
				onClick?: () => void;
			} = {
				href,
				label: sub(labels.selectPerPageItems, [String(label)]),
			};

			if (!href) {
				item.onClick = () => {
					if (onDeltaChange) {
						onDeltaChange(label as number);
					}
				};
			}

			return item;
		});

		const totalPages = Math.ceil(totalItems / activeDelta);

		React.useEffect(() => {
			if (internalActive > totalPages) {
				setActive(1);
			}
		}, [totalPages]);

		return (
			<PaginationBar {...otherProps}>
				{showDeltasDropDown && (
					<PaginationBar.DropDown
						alignmentPosition={alignmentPosition}
						items={items}
						trigger={
							<ClayButton
								data-testid="selectPaginationBar"
								displayType="unstyled"
							>
								{sub(labels.perPageItems, [activeDelta])}

								<ClayIcon
									spritemap={spritemap}
									symbol="caret-double-l"
								/>
							</ClayButton>
						}
					/>
				)}

				<PaginationBar.Results>
					{sub(labels.paginationResults, [
						(internalActive - 1) * activeDelta + 1,
						internalActive * activeDelta < totalItems
							? internalActive * activeDelta
							: totalItems,
						totalItems,
					])}
				</PaginationBar.Results>

				<ClayPaginationWithBasicItems
					active={internalActive}
					alignmentPosition={alignmentPosition}
					disabledPages={disabledPages}
					ellipsisBuffer={ellipsisBuffer}
					hrefConstructor={hrefConstructor}
					onActiveChange={setActive}
					spritemap={spritemap}
					totalPages={totalPages}
				/>
			</PaginationBar>
		);
	};
