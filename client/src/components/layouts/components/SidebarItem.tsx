import { NavigationItem } from './DesktopSidebar';
import { styled } from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { useInjectUserChanges } from '$app/common/hooks/useInjectUserChanges';
import { useThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';
import classNames from 'classnames';
import { Link } from '$app/components/forms';
import { hexToRGB } from '$app/common/hooks/useAdjustColorDarkness';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'react-feather';

const Div = styled.div`
    background-color: ${(props) => props.theme.color};
    &:hover {
        background-color: ${(props) => props.theme.hoverColor};
    }
`;

const LinkStyled = styled(Link)`
    &:hover {
        background-color: ${(props) => {
            if (props.theme.hoverColor) {
                const rgbColor = hexToRGB(props.theme.hoverColor);
                return `rgba(${rgbColor.red}, ${rgbColor.green}, ${rgbColor.blue}, 0.1)`;
            }
            return props.theme.hoverColor;
        }};
    }
`;

interface Props {
    item: NavigationItem;
}

export function SidebarItem(props: Props) {
    const { item } = props;
    const colors = useColorScheme();
    const user = useInjectUserChanges();
    const themeColors = useThemeColorScheme();
    const [isExpanded, setIsExpanded] = useState(false);

    const isMiniSidebar = Boolean(
        user?.company_user?.react_settings.show_mini_sidebar
    );

    if (!item.visible) {
        return <></>;
    }

    // Jika ada sub-item => jadikan dropdown-toggle
    if (item.children && item.children.length > 0) {
        return (
            <div>
                <Div
                    theme={{
                        color: item.current
                            ? themeColors.$1 || colors.$8
                            : themeColors.$3 || 'transparent',
                        hoverColor: themeColors.$1 || colors.$8,
                    }}
                    className={classNames(
                        'flex items-center justify-between group px-4 text-sm font-medium cursor-pointer',
                        {
                            'text-white border-l-4 border-transparent':
                                item.current,
                            'text-gray-300 border-l-4 border-transparent':
                                !item.current,
                        }
                    )}
                    onClick={() => setIsExpanded((prev) => !prev)}
                >
                    <div className="flex items-center my-2">
                        {/* Icon utama (misal Radio) */}
                        <item.icon
                            className={classNames(
                                'mr-3 flex-shrink-0 h-5 w-5',
                                {
                                    'text-white': item.current,
                                    'text-gray-300 group-hover:text-white':
                                        !item.current,
                                }
                            )}
                            aria-hidden="true"
                            style={{
                                color: item.current
                                    ? themeColors.$2
                                    : themeColors.$4,
                            }}
                        />

                        {!isMiniSidebar && (
                            <span
                                style={{
                                    color: item.current
                                        ? themeColors.$2
                                        : themeColors.$4,
                                }}
                            >
                                {item.name}
                            </span>
                        )}
                    </div>

                    {/* Chevron di samping kanan */}
                    {!isMiniSidebar && (
                        <div className="flex-shrink-0 mr-2">
                            {isExpanded ? (
                                <ChevronDown
                                    className={classNames(
                                        'h-4 w-4 flex-shrink-0',
                                        {
                                            'text-white': item.current,
                                            'text-gray-300 group-hover:text-white':
                                                !item.current,
                                        }
                                    )}
                                    aria-hidden="true"
                                />
                            ) : (
                                <ChevronRight
                                    className={classNames(
                                        'h-4 w-4 flex-shrink-0',
                                        {
                                            'text-white': item.current,
                                            'text-gray-300 group-hover:text-white':
                                                !item.current,
                                        }
                                    )}
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                    )}
                </Div>

                {/* Render sub-item kalau sedang di-expand */}
                {isExpanded && (
                    <div className="flex flex-col">
                        {item.children.map((child) => (
                            <div key={child.name} className="pl-8">
                                <SidebarItem item={child} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Leaf (tanpa children)
    return (
        <Div
            theme={{
                color: item.current
                    ? themeColors.$1 || colors.$8
                    : themeColors.$3 || 'transparent',
                hoverColor: themeColors.$1 || colors.$8,
            }}
            key={item.name}
            className={classNames(
                'flex items-center justify-between group px-4 text-sm font-medium',
                {
                    'text-white border-l-4 border-transparent': item.current,
                    'text-gray-300 border-l-4 border-transparent':
                        !item.current,
                }
            )}
        >
            <LinkStyled to={item.href} className="w-full" withoutDefaultStyling>
                <div
                    className="flex items-center justify-start my-2"
                    style={{
                        color: item.current ? themeColors.$2 : themeColors.$4,
                    }}
                >
                    <item.icon
                        className={classNames('mr-3 flex-shrink-0 h-5 w-5', {
                            'text-white': item.current,
                            'text-gray-300 group-hover:text-white':
                                !item.current,
                        })}
                        aria-hidden="true"
                        style={{
                            color: item.current
                                ? themeColors.$2
                                : themeColors.$4,
                        }}
                    />
                    {!isMiniSidebar && item.name}
                </div>
            </LinkStyled>

            {item.rightButton && !isMiniSidebar && item.rightButton.visible && (
                <LinkStyled
                    theme={{
                        hoverColor: colors.$13,
                    }}
                    to={item.rightButton.to}
                    className="rounded-full p-1.5"
                    withoutDefaultStyling
                >
                    <item.rightButton.icon
                        className="w-5 h-5"
                        style={{
                            color: item.current
                                ? themeColors.$2
                                : themeColors.$4,
                        }}
                    />
                </LinkStyled>
            )}
        </Div>
    );
}
