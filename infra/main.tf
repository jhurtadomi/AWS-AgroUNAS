module "network" {
  source         = "./modules/network"
  project_name   = var.project_name
  vpc_cidr       = var.vpc_cidr
  public_subnets = var.public_subnets
}

module "eks" {
  source          = "./modules/eks"
  project_name    = var.project_name
  cluster_version = var.cluster_version
  vpc_id          = module.network.vpc_id
  subnet_ids      = module.network.public_subnet_ids
}
