import React, { useState, useEffect } from 'react';
import { NavLink } from '../../types';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import Modal from '../Modal';

interface NavigationManagerProps {
    navLinks: NavLink[];
    onUpdateNavLinks: (links: NavLink[]) => void;
}

interface LinkEditorProps {
    link?: NavLink | null;
    onSave: (name: string, href: string) => void;
    onClose: () => void;
}

const LinkEditorModal: React.FC<LinkEditorProps> = ({ link, onSave, onClose }) => {
    const [name, setName] = useState(link?.name || '');
    const [href, setHref] = useState(link?.href || '#');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name, href);
    };

    return (
        <Modal isOpen={true} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">{link ? 'Edit Link' : 'Add New Link'}</h3>
                <div>
                    <label htmlFor="link-name" className="block text-sm font-medium">Name</label>
                    <input type="text" id="link-name" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                    <label htmlFor="link-href" className="block text-sm font-medium">HREF / URL</label>
                    <input type="text" id="link-href" value={href} onChange={e => setHref(e.target.value)} required className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-secondary rounded-md">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-accent text-accent-foreground rounded-md">Save</button>
                </div>
            </form>
        </Modal>
    );
};


const NavigationManager: React.FC<NavigationManagerProps> = ({ navLinks, onUpdateNavLinks }) => {
    const [localLinks, setLocalLinks] = useState<NavLink[]>([]);
    const [isEditing, setIsEditing] = useState<NavLink | { parentId: string | null } | null>(null);

    useEffect(() => {
        setLocalLinks(JSON.parse(JSON.stringify(navLinks))); // Deep copy
    }, [navLinks]);

    const handleSave = () => {
        onUpdateNavLinks(localLinks);
    };

    const handleDelete = (linkId: string) => {
        if (!window.confirm("Are you sure you want to delete this link and all its sub-links?")) return;

        const recursiveDelete = (links: NavLink[]): NavLink[] => {
            return links.filter(link => {
                if (link.id === linkId) return false;
                if (link.sublinks) {
                    link.sublinks = recursiveDelete(link.sublinks);
                }
                return true;
            });
        };
        setLocalLinks(recursiveDelete(localLinks));
    };

    const handleSaveLink = (name: string, href: string) => {
        if (!isEditing) return;

        const newLinkData = { name, href };

        if ('id' in isEditing && isEditing.id) { // Editing existing link
            const recursiveUpdate = (links: NavLink[]): NavLink[] => {
                return links.map(link => {
                    if (link.id === (isEditing as NavLink).id) {
                        return { ...link, ...newLinkData };
                    }
                    if (link.sublinks) {
                        return { ...link, sublinks: recursiveUpdate(link.sublinks) };
                    }
                    return link;
                });
            };
            setLocalLinks(recursiveUpdate(localLinks));
        } else { // Adding new link
            const newLink: NavLink = {
                id: `nav-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
                ...newLinkData,
                sublinks: []
            };
            const parentId = (isEditing as { parentId: string | null }).parentId;
            if (parentId) {
                 const recursiveAdd = (links: NavLink[]): NavLink[] => {
                    return links.map(link => {
                        if (link.id === parentId) {
                            return { ...link, sublinks: [...(link.sublinks || []), newLink] };
                        }
                        if (link.sublinks) {
                            return { ...link, sublinks: recursiveAdd(link.sublinks) };
                        }
                        return link;
                    });
                };
                setLocalLinks(recursiveAdd(localLinks));
            } else {
                setLocalLinks([...localLinks, newLink]);
            }
        }
        setIsEditing(null);
    };
    
    const renderLinks = (links: NavLink[], parentId: string | null = null, level: number = 0) => {
        return (
            <ul className={level > 0 ? "pl-6 mt-2 space-y-2 border-l-2 border-border" : "space-y-2"}>
                {links.map(link => (
                    <li key={link.id} className="bg-secondary p-3 rounded-md">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{link.name}</span>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setIsEditing({ parentId: link.id })} className="text-green-500 hover:text-green-700" title="Add Sub-link"><PlusCircleIcon className="w-5 h-5"/></button>
                                <button onClick={() => setIsEditing(link)} className="text-primary hover:text-primary/80" title="Edit Link"><PencilIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleDelete(link.id)} className="text-destructive hover:text-destructive/80" title="Delete Link"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                        {link.sublinks && link.sublinks.length > 0 && renderLinks(link.sublinks, link.id, level + 1)}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Manage Navigation</h3>
                <button onClick={handleSave} className="px-5 py-2.5 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold">Save Changes</button>
            </div>
            <div className="p-4 border border-border rounded-lg space-y-4">
                {renderLinks(localLinks)}
                <button onClick={() => setIsEditing({ parentId: null })} className="flex items-center gap-2 mt-4 px-4 py-2 text-primary hover:bg-secondary font-semibold text-sm rounded-md">
                    <PlusCircleIcon className="w-5 h-5"/>
                    Add Top-Level Link
                </button>
            </div>
             {isEditing && (
                <LinkEditorModal 
                    link={'id' in isEditing ? isEditing : null} 
                    onSave={handleSaveLink} 
                    onClose={() => setIsEditing(null)} 
                />
            )}
        </div>
    );
};

export default NavigationManager;