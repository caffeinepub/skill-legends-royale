import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CatalogEntry } from "../backend";
import { useActor } from "./useActor";

export function useHeroes() {
  const { actor, isFetching } = useActor();
  return useQuery<CatalogEntry[]>({
    queryKey: ["heroes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHeroes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBranches() {
  const { actor, isFetching } = useActor();
  return useQuery<CatalogEntry[]>({
    queryKey: ["branches"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBranches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useItems() {
  const { actor, isFetching } = useActor();
  return useQuery<CatalogEntry[]>({
    queryKey: ["items"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHeroMutations() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["heroes"] });

  const add = useMutation({
    mutationFn: ({ name, imageUrl }: { name: string; imageUrl: string }) =>
      actor!.addHero(name, imageUrl),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({
      id,
      name,
      imageUrl,
    }: { id: string; name: string; imageUrl: string }) =>
      actor!.updateHero(id, name, imageUrl),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: ({ id }: { id: string }) => actor!.deleteHero(id),
    onSuccess: invalidate,
  });

  return { add, update, remove };
}

export function useBranchMutations() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["branches"] });

  const add = useMutation({
    mutationFn: ({ name, imageUrl }: { name: string; imageUrl: string }) =>
      actor!.addBranch(name, imageUrl),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({
      id,
      name,
      imageUrl,
    }: { id: string; name: string; imageUrl: string }) =>
      actor!.updateBranch(id, name, imageUrl),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: ({ id }: { id: string }) => actor!.deleteBranch(id),
    onSuccess: invalidate,
  });

  return { add, update, remove };
}

export function useItemMutations() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["items"] });

  const add = useMutation({
    mutationFn: ({ name, imageUrl }: { name: string; imageUrl: string }) =>
      actor!.addItem(name, imageUrl),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({
      id,
      name,
      imageUrl,
    }: { id: string; name: string; imageUrl: string }) =>
      actor!.updateItem(id, name, imageUrl),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: ({ id }: { id: string }) => actor!.deleteItem(id),
    onSuccess: invalidate,
  });

  return { add, update, remove };
}
